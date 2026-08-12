from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.consultation import Consultation
from models.practitioner import Practitioner
from models.practitioner_category import PractitionerCategory
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

    practitioner_id = data.get("practitionerId")
    practitioner = db.session.get(Practitioner, practitioner_id)
    if practitioner is None or not practitioner.is_active:
        return {"message": "Please choose an available attorney"}, 400

    category = data.get("category")
    covers_category = db.session.scalar(
        select(PractitionerCategory).where(
            PractitionerCategory.practitioner_id == practitioner_id,
            PractitionerCategory.category_id == category,
        )
    )
    if covers_category is None:
        return {
            "message": "That attorney doesn't cover the selected category"
        }, 400

    consultation = Consultation(
        id=str(uuid.uuid4()),
        user_id=get_jwt_identity(),
        category_id=category,
        practitioner_id=practitioner_id,
        # Denormalized for display convenience — set from the practitioner
        # record, never typed by the client.
        lawyer_name=practitioner.to_dict()["displayName"],
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
