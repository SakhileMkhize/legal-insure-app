from sqlalchemy import Column, String, Numeric, Integer, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50))
    plan_id = Column(String(20))
    status = Column(String(20), default="pending")
    start_date = Column(Date)
    monthly_premium = Column(Numeric(10, 2))
    cover_limit = Column(Numeric(12, 2), default=0)
    cover_used = Column(Numeric(12, 2), default=0)
    consultations_included = Column(Integer, default=0)
    consultations_used = Column(Integer, default=0)

    # Kept lean on purpose - underwriting disclosures/consent live on
    # PolicyDisclosure and payment details live on PolicyBanking (both in
    # models/), 1:1 satellite tables. serialize_policy() in policies_bp.py
    # merges all three dicts together so the API's policy JSON shape is
    # unaffected by the split.
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "planId": self.plan_id,
            "status": self.status,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "monthlyPremium": float(self.monthly_premium) if self.monthly_premium is not None else None,
            "coverLimit": float(self.cover_limit) if self.cover_limit is not None else None,
            "coverUsed": float(self.cover_used) if self.cover_used is not None else None,
            "consultationsIncluded": self.consultations_included,
            "consultationsUsed": self.consultations_used,
        }
