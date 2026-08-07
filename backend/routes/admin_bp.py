from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt
from extensions import db
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.plan import Plan
from sqlalchemy import select

admin_bp = Blueprint("admin_bp", __name__)


def require_admin():
    return get_jwt().get("role") == "admin"


@admin_bp.get("/metrics")
@jwt_required()
def get_metrics():
    if not require_admin():
        return {"message": "Not authorized"}, 403

    clients = db.session.scalars(
        select(User).where(User.role == "customer")
    ).all()
    active_policies = db.session.scalars(
        select(Policy).where(Policy.status == "active")
    ).all()
    pending_claims = db.session.scalars(
        select(Claim).where(Claim.status.in_(["pending", "in-review"]))
    ).all()
    mrr = sum(float(policy.monthly_premium) for policy in active_policies)

    return {
        "totalClients": len(clients),
        "activePolicies": len(active_policies),
        "pendingClaims": len(pending_claims),
        "mrr": mrr,
    }


@admin_bp.get("/clients")
@jwt_required()
def list_clients():
    if not require_admin():
        return {"message": "Not authorized"}, 403

    clients = db.session.scalars(
        select(User).where(User.role == "customer")
    ).all()

    result = []
    for client in clients:
        policy = db.session.scalar(
            select(Policy).where(Policy.user_id == client.id)
        )
        plan = db.session.get(Plan, policy.plan_id) if policy else None
        result.append(
            {
                **client.to_dict(),
                "planName": plan.name if plan else "No plan",
                "policyStatus": policy.status if policy else "inactive",
                "monthlyPremium": float(policy.monthly_premium) if policy else 0,
            }
        )

    return result
