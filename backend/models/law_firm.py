from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class LawFirm(Base):
    __tablename__ = "law_firms"

    id = Column(String(50), primary_key=True)
    name = Column(String(150))
    registration_number = Column(String(50))
    bio = Column(String(1000))
    phone = Column(String(20))
    email = Column(String(255))
    address = Column(String(255))
    is_active = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "registrationNumber": self.registration_number,
            "bio": self.bio,
            "phone": self.phone,
            "email": self.email,
            "address": self.address,
            "isActive": self.is_active,
        }
