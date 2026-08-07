from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.claim import Claim
from models.user import User
from sqlalchemy import select, desc
from datetime import date
import uuid

claims_bp = Blueprint("claims_bp", __name__)


@claims_bp.get("/me")
@jwt_required()
def list_my_claims():
    claims = db.session.scalars(
        select(Claim)
        .where(Claim.user_id == get_jwt_identity())
        .order_by(desc(Claim.submitted_at))
    ).all()

    return [claim.to_dict() for claim in claims]


@claims_bp.get("/")
@jwt_required()
def list_all_claims():
    if get_jwt().get("role") != "admin":
        return {"message": "Not authorized"}, 403

    claims = db.session.scalars(
        select(Claim).order_by(desc(Claim.submitted_at))
    ).all()

    result = []
    for claim in claims:
        client = db.session.get(User, claim.user_id)
        result.append(
            {
                **claim.to_dict(),
                "clientName": f"{client.first_name} {client.last_name}"
                if client
                else "Unknown client",
            }
        )

    return result


@claims_bp.post("/")
@jwt_required()
def submit_claim():
    data = request.get_json()

    claim = Claim(
        id=str(uuid.uuid4()),
        user_id=get_jwt_identity(),
        category_id=data.get("category"),
        title=data.get("title"),
        description=data.get("description"),
        amount_claimed=data.get("amountClaimed"),
        status="pending",
        submitted_at=date.today(),
    )

    try:
        db.session.add(claim)
        db.session.commit()

        return claim.to_dict(), 201

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Claim was not submitted"}, 500


@claims_bp.patch("/<claim_id>/status")
@jwt_required()
def update_claim_status(claim_id):
    if get_jwt().get("role") != "admin":
        return {"message": "Not authorized"}, 403

    claim = db.session.get(Claim, claim_id)
    if claim is None:
        return {"message": "Claim not found"}, 404

    data = request.get_json()
    claim.status = data.get("status")
    claim.decided_at = date.today()

    try:
        db.session.commit()

        return claim.to_dict()

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Claim was not updated"}, 500
