from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50))
    category_id = Column(String(20))
    practitioner_id = Column(String(50))
    lawyer_name = Column(String(150))
    scheduled_at = Column(DateTime)
    status = Column(String(20), default="scheduled")
    notes = Column(String(1000))

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "category": self.category_id,
            "practitionerId": self.practitioner_id,
            "lawyerName": self.lawyer_name,
            "scheduledAt": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "status": self.status,
            "notes": self.notes,
        }
