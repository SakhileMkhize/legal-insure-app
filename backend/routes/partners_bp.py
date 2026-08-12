from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from extensions import db
from models.law_firm import LawFirm
from models.practitioner import Practitioner
from models.practitioner_category import PractitionerCategory
from sqlalchemy import select

partners_bp = Blueprint("partners_bp", __name__)


def serialize_practitioner(practitioner, firm):
    categories = db.session.scalars(
        select(PractitionerCategory.category_id).where(
            PractitionerCategory.practitioner_id == practitioner.id
        )
    ).all()

    return {
        **practitioner.to_dict(),
        "firm": firm.to_dict() if firm else None,
        "categories": list(categories),
    }


@partners_bp.get("/")
@jwt_required()
def list_partners():
    category = request.args.get("category")

    # .is_(True) compiles to "IS 1" on MSSQL, which isn't valid T-SQL
    # (IS only works with NULL) — use equality instead.
    query = select(Practitioner).where(Practitioner.is_active == True)  # noqa: E712
    if category:
        query = query.where(
            Practitioner.id.in_(
                select(PractitionerCategory.practitioner_id).where(
                    PractitionerCategory.category_id == category
                )
            )
        )

    practitioners = db.session.scalars(query.order_by(Practitioner.name)).all()
    firms = {firm.id: firm for firm in db.session.scalars(select(LawFirm)).all()}

    return [
        serialize_practitioner(practitioner, firms.get(practitioner.firm_id))
        for practitioner in practitioners
    ]


@partners_bp.get("/<practitioner_id>")
@jwt_required()
def get_partner(practitioner_id):
    practitioner = db.session.get(Practitioner, practitioner_id)
    if practitioner is None:
        return {"message": "Practitioner not found"}, 404

    firm = db.session.get(LawFirm, practitioner.firm_id)

    return serialize_practitioner(practitioner, firm)
