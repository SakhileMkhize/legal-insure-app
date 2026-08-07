from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.policy import Policy
from models.policy_cover_category import PolicyCoverCategory
from models.dependant import Dependant
from models.user import User
from sqlalchemy import select
from datetime import date
import uuid

policies_bp = Blueprint("policies_bp", __name__)


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

    user = db.session.get(User, user_id)
    user.date_of_birth = parse_date(data.get("dateOfBirth"))
    user.id_number = data.get("idNumber")
    user.address = data.get("address")

    for category in db.session.scalars(
        select(PolicyCoverCategory).where(PolicyCoverCategory.policy_id == policy.id)
    ):
        db.session.delete(category)

    for dependant in db.session.scalars(
        select(Dependant).where(Dependant.policy_id == policy.id)
    ):
        db.session.delete(dependant)

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

        db.session.commit()

        return serialize_policy(policy)

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Policy could not be updated"}, 500
