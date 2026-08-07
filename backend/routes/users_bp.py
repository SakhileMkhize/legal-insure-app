from flask import Blueprint, request
from extensions import db
from models.user import User
from models.plan import Plan
from models.policy import Policy
from sqlalchemy import select
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import uuid
from datetime import date
from werkzeug.security import generate_password_hash, check_password_hash

users_bp = Blueprint("users_bp", __name__)


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

    # New policies start "pending" — nothing is covered until the client
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
        has_pre_existing_dispute=False,
        personal_use_confirmed=False,
        popia_consent=False,
    )

    try:
        db.session.add(user)
        db.session.flush()  # user row must exist before policy references it
        db.session.add(policy)
        db.session.commit()

        token = create_access_token(identity=user.id, additional_claims={"role": user.role})

        return {**user.to_dict(), "token": token}, 201

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

    return user.to_dict()
