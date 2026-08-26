from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.policy import Policy
from models.policy_cover_category import PolicyCoverCategory
from models.dependant import Dependant
from models.benefit import Benefit
from models.policy_benefit import PolicyBenefit
from models.user import User
from models.next_of_kin import NextOfKin
from models.legal_history_entry import LegalHistoryEntry
from sqlalchemy import select
from datetime import date
import uuid

policies_bp = Blueprint("policies_bp", __name__)

ALLOWED_PAYMENT_METHODS = {"debit_order", "eft", "card"}
EMPLOYMENT_STATUSES = {"employed", "self-employed", "unemployed", "retired", "student"}
MARITAL_STATUSES = {"single", "married", "divorced", "widowed"}


def parse_date(value):
    return date.fromisoformat(value) if value else None


def serialize_policy(policy):
    categories = db.session.scalars(
        select(PolicyCoverCategory.category_id).where(
            PolicyCoverCategory.policy_id == policy.id
        )
    ).all()
    dependants = db.session.scalars(
        select(Dependant).where(Dependant.policy_id == policy.id)
    ).all()

    return {
        **policy.to_dict(),
        "categoriesCovered": list(categories),
        "dependants": [dependant.to_dict() for dependant in dependants],
    }


@policies_bp.get("/me")
@jwt_required()
def get_my_policy():
    policy = db.session.scalar(
        select(Policy).where(Policy.user_id == get_jwt_identity())
    )

    if policy is None:
        return {"message": "We couldn't find a policy for this account."}, 404

    return serialize_policy(policy)


@policies_bp.get("/me/benefits")
@jwt_required()
def get_my_benefits():
    policy = db.session.scalar(
        select(Policy).where(Policy.user_id == get_jwt_identity())
    )
    if policy is None:
        return {"message": "We couldn't find a policy for this account."}, 404

    benefits = db.session.scalars(select(Benefit)).all()
    usage_by_benefit = {
        usage.benefit_id: usage
        for usage in db.session.scalars(
            select(PolicyBenefit).where(PolicyBenefit.policy_id == policy.id)
        ).all()
    }

    result = []
    for benefit in benefits:
        usage = usage_by_benefit.get(benefit.id)
        result.append(
            {
                **benefit.to_dict(),
                "usedCount": usage.used_count if usage else 0,
                "usedAmount": float(usage.used_amount) if usage else 0,
            }
        )

    return result


@policies_bp.patch("/me/banking")
@jwt_required()
def update_banking_details():
    policy = db.session.scalar(
        select(Policy).where(Policy.user_id == get_jwt_identity())
    )
    if policy is None:
        return {"message": "We couldn't find a policy for this account."}, 404

    data = request.get_json()

    payment_method = data.get("paymentMethod")
    if payment_method is not None and payment_method not in ALLOWED_PAYMENT_METHODS:
        return {"message": "Invalid payment method"}, 400

    # The API never returns the real account number (see Policy.to_dict),
    # so there's nothing to "clear" - submitting a blank value just leaves
    # whatever's already on file untouched. Only a new non-empty value
    # replaces it.
    account_number = data.get("accountNumber")

    if "paymentMethod" in data:
        policy.payment_method = payment_method
    if "bankName" in data:
        policy.bank_name = data.get("bankName")
    if "accountHolder" in data:
        policy.account_holder = data.get("accountHolder")
    if account_number and account_number.strip():
        policy.account_number = account_number.strip()
    if "branchCode" in data:
        policy.branch_code = data.get("branchCode")

    try:
        db.session.commit()

        return serialize_policy(policy)

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Banking details were not updated"}, 500


@policies_bp.post("/build")
@jwt_required()
def build_policy():
    user_id = get_jwt_identity()
    data = request.get_json()

    policy = db.session.scalar(select(Policy).where(Policy.user_id == user_id))
    if policy is None:
        return {"message": "We couldn't find a policy for this account."}, 404

    policy.status = "active"
    policy.has_pre_existing_dispute = data.get("hasPreExistingDispute") == "yes"
    policy.pre_existing_dispute_details = data.get("preExistingDisputeDetails")
    policy.personal_use_confirmed = bool(data.get("personalUseConfirmed"))
    policy.popia_consent = bool(data.get("popiaConsent"))

    # Banking is only touched when the wizard actually sent a payment
    # method - keeps this endpoint safe to call even if a client skips
    # the section entirely.
    payment_method = data.get("paymentMethod")
    if payment_method:
        if payment_method not in ALLOWED_PAYMENT_METHODS:
            return {"message": "Invalid payment method"}, 400
        policy.payment_method = payment_method
        policy.bank_name = data.get("bankName")
        policy.account_holder = data.get("accountHolder")
        policy.branch_code = data.get("branchCode")
        account_number = data.get("accountNumber")
        if account_number and account_number.strip():
            policy.account_number = account_number.strip()

    user = db.session.get(User, user_id)
    user.date_of_birth = parse_date(data.get("dateOfBirth"))
    user.id_number = data.get("idNumber")
    user.address = data.get("address")

    employment_status = data.get("employmentStatus")
    if employment_status and employment_status not in EMPLOYMENT_STATUSES:
        return {"message": "Invalid employment status"}, 400
    marital_status = data.get("maritalStatus")
    if marital_status and marital_status not in MARITAL_STATUSES:
        return {"message": "Invalid marital status"}, 400

    if "employerName" in data:
        user.employer_name = data.get("employerName")
    if "occupation" in data:
        user.occupation = data.get("occupation")
    if employment_status:
        user.employment_status = employment_status
    if marital_status:
        user.marital_status = marital_status

    for category in db.session.scalars(
        select(PolicyCoverCategory).where(PolicyCoverCategory.policy_id == policy.id)
    ):
        db.session.delete(category)

    for dependant in db.session.scalars(
        select(Dependant).where(Dependant.policy_id == policy.id)
    ):
        db.session.delete(dependant)

    # Next of kin belongs to the user rather than the policy, but the
    # wizard still treats it as one submission - the list it sends
    # replaces whatever was recorded before. Legal history isn't collected
    # by the wizard at all (added later from My Account instead), so it's
    # only touched here if a caller actually sends the key - otherwise
    # every rebuild would silently wipe out entries added since.
    for contact in db.session.scalars(
        select(NextOfKin).where(NextOfKin.user_id == user_id)
    ):
        db.session.delete(contact)

    if "legalHistory" in data:
        for entry in db.session.scalars(
            select(LegalHistoryEntry).where(LegalHistoryEntry.user_id == user_id)
        ):
            db.session.delete(entry)

    try:
        db.session.flush()

        for category_id in data.get("categoriesCovered", []):
            db.session.add(
                PolicyCoverCategory(policy_id=policy.id, category_id=category_id)
            )

        for dependant in data.get("dependants", []):
            db.session.add(
                Dependant(
                    id=str(uuid.uuid4()),
                    policy_id=policy.id,
                    name=dependant.get("name"),
                    date_of_birth=parse_date(dependant.get("dateOfBirth")),
                    relationship=dependant.get("relationship"),
                )
            )

        for contact in data.get("nextOfKin", []):
            db.session.add(
                NextOfKin(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    name=contact.get("name"),
                    relationship=contact.get("relationship"),
                    phone=contact.get("phone"),
                    email=contact.get("email"),
                )
            )

        for entry in data.get("legalHistory", []):
            db.session.add(
                LegalHistoryEntry(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    category_id=entry.get("category") or None,
                    description=entry.get("description"),
                    occurred_at=parse_date(entry.get("occurredAt")),
                    was_insured_claim=bool(entry.get("wasInsuredClaim")),
                    other_insurer=entry.get("otherInsurer"),
                    disclosed_at=date.today(),
                )
            )

        db.session.commit()

        return serialize_policy(policy)

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Policy could not be updated"}, 500
