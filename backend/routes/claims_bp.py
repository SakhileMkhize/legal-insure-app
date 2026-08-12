from flask import Blueprint, request, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.claim import Claim
from models.claim_document import ClaimDocument
from models.policy import Policy
from models.user import User
from sqlalchemy import select, desc
from datetime import date, datetime
from werkzeug.utils import secure_filename
import os
import uuid

claims_bp = Blueprint("claims_bp", __name__)

ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "doc", "docx"}


def is_allowed_document(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_DOCUMENT_EXTENSIONS
    )


def can_access_claim(claim):
    return get_jwt().get("role") == "admin" or claim.user_id == get_jwt_identity()


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
    previous_status = claim.status
    new_status = data.get("status")

    claim.status = new_status
    claim.decided_at = date.today()

    # Approving a claim draws down the policy's legal expense cover;
    # reversing an approval (e.g. correcting a mistaken decision) gives
    # it back. Gated on an actual status change so re-saving the same
    # status twice can't double-count.
    if new_status != previous_status and claim.amount_claimed:
        policy = db.session.scalar(
            select(Policy).where(Policy.user_id == claim.user_id)
        )
        if policy is not None:
            cover_used = policy.cover_used or 0
            if new_status == "approved" and previous_status != "approved":
                policy.cover_used = cover_used + claim.amount_claimed
            elif previous_status == "approved" and new_status != "approved":
                policy.cover_used = max(0, cover_used - claim.amount_claimed)

    try:
        db.session.commit()

        return claim.to_dict()

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Claim was not updated"}, 500


@claims_bp.post("/<claim_id>/documents")
@jwt_required()
def upload_claim_documents(claim_id):
    claim = db.session.get(Claim, claim_id)
    if claim is None:
        return {"message": "Claim not found"}, 404
    if not can_access_claim(claim):
        return {"message": "Not authorized"}, 403

    files = [f for f in request.files.getlist("files") if f.filename]
    if not files:
        return {"message": "No files were provided"}, 400

    rejected = [f.filename for f in files if not is_allowed_document(f.filename)]
    if rejected:
        return {
            "message": "Unsupported file type: "
            + ", ".join(rejected)
            + ". Allowed types: "
            + ", ".join(sorted(ALLOWED_DOCUMENT_EXTENSIONS)),
        }, 400

    claim_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], claim_id)
    os.makedirs(claim_folder, exist_ok=True)

    created = []
    try:
        for file in files:
            safe_name = secure_filename(file.filename)
            stored_name = f"{uuid.uuid4()}_{safe_name}"
            stored_path = os.path.join(claim_folder, stored_name)
            file.save(stored_path)

            document = ClaimDocument(
                id=str(uuid.uuid4()),
                claim_id=claim_id,
                uploaded_by=get_jwt_identity(),
                file_name=safe_name,
                stored_path=stored_path,
                content_type=file.content_type,
                file_size=os.path.getsize(stored_path),
                uploaded_at=datetime.utcnow(),
            )
            db.session.add(document)
            created.append(document)

        db.session.commit()

        return [document.to_dict() for document in created], 201

    except Exception as error:
        db.session.rollback()
        print(error)
        return {"message": "Documents could not be uploaded"}, 500


@claims_bp.get("/<claim_id>/documents")
@jwt_required()
def list_claim_documents(claim_id):
    claim = db.session.get(Claim, claim_id)
    if claim is None:
        return {"message": "Claim not found"}, 404
    if not can_access_claim(claim):
        return {"message": "Not authorized"}, 403

    documents = db.session.scalars(
        select(ClaimDocument)
        .where(ClaimDocument.claim_id == claim_id)
        .order_by(ClaimDocument.uploaded_at)
    ).all()

    return [document.to_dict() for document in documents]


@claims_bp.get("/documents/<document_id>/download")
@jwt_required()
def download_claim_document(document_id):
    document = db.session.get(ClaimDocument, document_id)
    if document is None:
        return {"message": "Document not found"}, 404

    claim = db.session.get(Claim, document.claim_id)
    if claim is None or not can_access_claim(claim):
        return {"message": "Not authorized"}, 403

    directory, filename = os.path.split(document.stored_path)
    return send_from_directory(
        directory,
        filename,
        as_attachment=True,
        download_name=document.file_name,
    )
