from sqlalchemy import Column, String, Numeric, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50))
    category_id = Column(String(20))
    title = Column(String(255))
    description = Column(String(2000))
    amount_claimed = Column(Numeric(12, 2))
    status = Column(String(20), default="pending")
    submitted_at = Column(Date)
    decided_at = Column(Date)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "category": self.category_id,
            "title": self.title,
            "description": self.description,
            "amountClaimed": float(self.amount_claimed) if self.amount_claimed is not None else None,
            "status": self.status,
            "submittedAt": self.submitted_at.isoformat() if self.submitted_at else None,
            "decidedAt": self.decided_at.isoformat() if self.decided_at else None,
        }
