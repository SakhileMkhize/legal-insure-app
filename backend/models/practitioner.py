from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Practitioner(Base):
    __tablename__ = "practitioners"

    id = Column(String(50), primary_key=True)
    firm_id = Column(String(50))
    name = Column(String(150))
    title = Column(String(50))
    practice_number = Column(String(50))
    email = Column(String(255))
    phone = Column(String(20))
    bio = Column(String(1000))
    is_active = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "firmId": self.firm_id,
            "name": self.name,
            "title": self.title,
            "practiceNumber": self.practice_number,
            "email": self.email,
            "phone": self.phone,
            "bio": self.bio,
            "isActive": self.is_active,
            # Convenience for display without a second lookup, e.g. "Adv. Kabelo Ntuli"
            "displayName": f"{self.title} {self.name}".strip() if self.title else self.name,
        }
