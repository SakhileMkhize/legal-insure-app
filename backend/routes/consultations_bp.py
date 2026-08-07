from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.consultation import Consultation
from sqlalchemy import select
from datetime import datetime
import uuid

consultations_bp = Blueprint("consultations_bp", __name__)


@consultations_bp.get("/me")
@jwt_required()
def list_my_consultations():
    consultations = db.session.scalars(
        select(Consultation)
        .where(Consultation.user_id == get_jwt_identity())
        .order_by(Consultation.scheduled_at)
    ).all()

    return [consultation.to_dict() for consultation in consultations]


@consultations_bp.post("/")
@jwt_required()
def book_consultation():
    data = request.get_json()

    consultation = Consultation(
        id=str(uuid.uuid4()),
        user_id=get_jwt_identity(),
        category_id=data.get("category"),
        lawyer_name=data.get("lawyerName"),
        scheduled_at=datetime.fromisoformat(data.get("scheduledAt")),
        status="scheduled",
        notes=data.get("notes"),
    )

    try:
        db.session.add(consultation)
        db.session.commit()

        return consultation.to_dict(), 201

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Consultation was not booked"}, 500
