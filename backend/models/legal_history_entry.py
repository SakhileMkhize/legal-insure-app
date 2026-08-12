from sqlalchemy import Column, String, Date, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class LegalHistoryEntry(Base):
    __tablename__ = "legal_history_entries"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50))
    category_id = Column(String(20))
    description = Column(String(1000))
    occurred_at = Column(Date)
    was_insured_claim = Column(Boolean, default=False)
    other_insurer = Column(String(150))
    disclosed_at = Column(Date)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "category": self.category_id,
            "description": self.description,
            "occurredAt": self.occurred_at.isoformat() if self.occurred_at else None,
            "wasInsuredClaim": self.was_insured_claim,
            "otherInsurer": self.other_insurer,
            "disclosedAt": self.disclosed_at.isoformat() if self.disclosed_at else None,
        }
