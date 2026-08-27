from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.policy import Policy
from models.policy_disclosure import PolicyDisclosure
from models.policy_banking import PolicyBanking
from models.policy_cover_category import PolicyCoverCategory
from models.dependant import Dependant
from models.benefit import Benefit
from models.policy_benefit import PolicyBenefit
from models.user_profile import UserProfile
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

    # Disclosures and banking (see models/policy_disclosure.py and
    # models/policy_banking.py) live in their own 1:1 tables - merge them
    # back in so callers see the same flat shape the API returned before
    # that split.
    disclosure = db.session.get(PolicyDisclosure, policy.id)
    banking = db.session.get(PolicyBanking, policy.id)

    return {
        **policy.to_dict(),
        **(disclosure.to_dict() if disclosure else PolicyDisclosure().to_dict()),
        **(banking.to_dict() if banking else PolicyBanking().to_dict()),
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

    banking = db.session.get(PolicyBanking, policy.id)
    if banking is None:
        # Older policies created before the banking split may not have a
        # row yet - create one on first write instead.
        banking = PolicyBanking(policy_id=policy.id)
        db.session.add(banking)

    data = request.get_json()

    payment_method = data.get("paymentMethod")
    if payment_method is not None and payment_method not in ALLOWED_PAYMENT_METHODS:
        return {"message": "Invalid payment method"}, 400

    # The API never returns the real account number (see PolicyBanking.to_dict),
    # so there's nothing to "clear" - submitting a blank value just leaves
    # whatever's already on file untouched. Only a new non-empty value
    # replaces it.
    account_number = data.get("accountNumber")

    if "paymentMethod" in data:
        banking.payment_method = payment_method
    if "bankName" in data:
        banking.bank_name = data.get("bankName")
    if "accountHolder" in data:
        banking.account_holder = data.get("accountHolder")
    if account_number and account_number.strip():
        banking.account_number = account_number.strip()
    if "branchCode" in data:
        banking.branch_code = data.get("branchCode")

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

    disclosure = db.session.get(PolicyDisclosure, policy.id)
    if disclosure is None:
        disclosure = PolicyDisclosure(policy_id=policy.id)
        db.session.add(disclosure)

    policy.status = "active"
    disclosure.has_pre_existing_dispute = data.get("hasPreExistingDispute") == "yes"
    disclosure.pre_existing_dispute_details = data.get("preExistingDisputeDetails")
    disclosure.personal_use_confirmed = bool(data.get("personalUseConfirmed"))
    disclosure.popia_consent = bool(data.get("popiaConsent"))

    # Banking is only touched when the wizard actually sent a payment
    # method - keeps this endpoint safe to call even if a client skips
    # the section entirely.
    payment_method = data.get("paymentMethod")
    if payment_method:
        if payment_method not in ALLOWED_PAYMENT_METHODS:
            return {"message": "Invalid payment method"}, 400
        banking = db.session.get(PolicyBanking, policy.id)
        if banking is None:
            banking = PolicyBanking(policy_id=policy.id)
            db.session.add(banking)
        banking.payment_method = payment_method
        banking.bank_name = data.get("bankName")
        banking.account_holder = data.get("accountHolder")
        banking.branch_code = data.get("branchCode")
        account_number = data.get("accountNumber")
        if account_number and account_number.strip():
            banking.account_number = account_number.strip()

    profile = db.session.get(UserProfile, user_id)
    if profile is None:
        profile = UserProfile(user_id=user_id)
        db.session.add(profile)

    profile.date_of_birth = parse_date(data.get("dateOfBirth"))
    profile.id_number = data.get("idNumber")
    profile.address = data.get("address")

    employment_status = data.get("employmentStatus")
    if employment_status and employment_status not in EMPLOYMENT_STATUSES:
        return {"message": "Invalid employment status"}, 400
    marital_status = data.get("maritalStatus")
    if marital_status and marital_status not in MARITAL_STATUSES:
        return {"message": "Invalid marital status"}, 400

    if "employerName" in data:
        profile.employer_name = data.get("employerName")
    if "occupation" in data:
        profile.occupation = data.get("occupation")
    if employment_status:
        profile.employment_status = employment_status
    if marital_status:
        profile.marital_status = marital_status

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
