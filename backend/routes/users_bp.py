from flask import Blueprint, request
from extensions import db
from models.user import User
from models.user_profile import UserProfile
from models.plan import Plan
from models.policy import Policy
from models.policy_disclosure import PolicyDisclosure
from models.legal_history_entry import LegalHistoryEntry
from models.next_of_kin import NextOfKin
from sqlalchemy import select, desc
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import uuid
from datetime import date
from werkzeug.security import generate_password_hash, check_password_hash

users_bp = Blueprint("users_bp", __name__)

EMPLOYMENT_STATUSES = {"employed", "self-employed", "unemployed", "retired", "student"}
MARITAL_STATUSES = {"single", "married", "divorced", "widowed"}


# User's profile fields (see models/user_profile.py) live in their own 1:1
# table - this merges them back in so callers see the same flat shape the
# API returned before that split.
def serialize_user(user):
    profile = db.session.get(UserProfile, user.id)
    return {**user.to_dict(), **(profile.to_dict() if profile else UserProfile().to_dict())}


# CREATE
@users_bp.post("/signup")
def create_user():
    data = request.get_json()

    existing = db.session.scalar(select(User).where(User.email == data.get("email")))
    if existing is not None:
        return {"message": "An account with this email already exists."}, 409

    plan = db.session.get(Plan, data.get("planId"))
    if plan is None:
        return {"message": "Unknown plan."}, 400

    user_id = str(uuid.uuid4())
    joined_at = date.today()

    user = User(
        id=user_id,
        role="customer",
        first_name=data.get("firstName"),
        last_name=data.get("lastName"),
        email=data.get("email"),
        password_hash=generate_password_hash(data.get("password")),
        phone=data.get("phone"),
        joined_at=joined_at,
    )

    profile = UserProfile(user_id=user_id)

    # New policies start "pending" - nothing is covered until the client
    # (or our team) works through the underwriting questionnaire.
    policy = Policy(
        id=str(uuid.uuid4()),
        user_id=user_id,
        plan_id=plan.id,
        status="pending",
        start_date=joined_at,
        monthly_premium=plan.monthly_price,
        cover_limit=plan.cover_limit,
        cover_used=0,
        consultations_included=plan.consultations_included,
        consultations_used=0,
    )

    try:
        db.session.add(user)
        db.session.add(profile)
        db.session.flush()  # user row must exist before policy references it
        db.session.add(policy)
        db.session.add(
            PolicyDisclosure(
                policy_id=policy.id,
                has_pre_existing_dispute=False,
                personal_use_confirmed=False,
                popia_consent=False,
            )
        )
        db.session.commit()

        token = create_access_token(
            identity=user.id, additional_claims={"role": user.role}
        )

        return {**serialize_user(user), "token": token}, 201

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "User was not added"}, 500


@users_bp.post("/login")
def login_user():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = db.session.scalar(select(User).where(User.email == email))

    if user is None:
        return {"message": "Invalid email or password."}, 401

    if not check_password_hash(user.password_hash, password):
        return {"message": "Invalid email or password."}, 401

    token = create_access_token(identity=user.id, additional_claims={"role": user.role})

    return {
        "message": "Login successful",
        "token": token,
        "id": user.id,
        "role": user.role,
    }, 200


@users_bp.get("/me")
@jwt_required()
def get_current_user():
    user = db.session.get(User, get_jwt_identity())

    if user is None:
        return {"message": "User not found"}, 404

    return serialize_user(user)


@users_bp.patch("/me")
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user is None:
        return {"message": "User not found"}, 404

    profile = db.session.get(UserProfile, user_id)
    if profile is None:
        # Older accounts created before the profile split may not have a
        # row yet - create one on first write instead.
        profile = UserProfile(user_id=user_id)
        db.session.add(profile)

    data = request.get_json()

    employment_status = data.get("employmentStatus")
    if employment_status is not None and employment_status not in EMPLOYMENT_STATUSES:
        return {"message": "Invalid employment status"}, 400

    marital_status = data.get("maritalStatus")
    if marital_status is not None and marital_status not in MARITAL_STATUSES:
        return {"message": "Invalid marital status"}, 400

    if "employerName" in data:
        profile.employer_name = data.get("employerName")
    if "occupation" in data:
        profile.occupation = data.get("occupation")
    if "employmentStatus" in data:
        profile.employment_status = employment_status
    if "maritalStatus" in data:
        profile.marital_status = marital_status

    try:
        db.session.commit()

        return serialize_user(user)

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Profile was not updated"}, 500


@users_bp.get("/me/legal-history")
@jwt_required()
def list_legal_history():
    entries = db.session.scalars(
        select(LegalHistoryEntry)
        .where(LegalHistoryEntry.user_id == get_jwt_identity())
        .order_by(desc(LegalHistoryEntry.disclosed_at))
    ).all()

    return [entry.to_dict() for entry in entries]


@users_bp.post("/me/legal-history")
@jwt_required()
def add_legal_history():
    data = request.get_json()

    if not (data.get("description") or "").strip():
        return {"message": "A description is required"}, 400

    entry = LegalHistoryEntry(
        id=str(uuid.uuid4()),
        user_id=get_jwt_identity(),
        category_id=data.get("category"),
        description=data.get("description"),
        occurred_at=date.fromisoformat(data["occurredAt"])
        if data.get("occurredAt")
        else None,
        was_insured_claim=bool(data.get("wasInsuredClaim")),
        other_insurer=data.get("otherInsurer"),
        disclosed_at=date.today(),
    )

    try:
        db.session.add(entry)
        db.session.commit()

        return entry.to_dict(), 201

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Entry was not added"}, 500


@users_bp.get("/me/next-of-kin")
@jwt_required()
def list_next_of_kin():
    contacts = db.session.scalars(
        select(NextOfKin).where(NextOfKin.user_id == get_jwt_identity())
    ).all()

    return [contact.to_dict() for contact in contacts]


@users_bp.post("/me/next-of-kin")
@jwt_required()
def add_next_of_kin():
    data = request.get_json()

    if not (data.get("name") or "").strip() or not (data.get("phone") or "").strip():
        return {"message": "Name and phone are required"}, 400

    contact = NextOfKin(
        id=str(uuid.uuid4()),
        user_id=get_jwt_identity(),
        name=data.get("name"),
        relationship=data.get("relationship"),
        phone=data.get("phone"),
        email=data.get("email"),
    )

    try:
        db.session.add(contact)
        db.session.commit()

        return contact.to_dict(), 201

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Contact was not added"}, 500


@users_bp.delete("/me/next-of-kin/<contact_id>")
@jwt_required()
def delete_next_of_kin(contact_id):
    contact = db.session.get(NextOfKin, contact_id)
    if contact is None or contact.user_id != get_jwt_identity():
        return {"message": "Contact not found"}, 404

    try:
        db.session.delete(contact)
        db.session.commit()

        return {"message": "Contact removed"}

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Contact was not removed"}, 500
