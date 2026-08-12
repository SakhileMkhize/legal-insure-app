from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class NextOfKin(Base):
    __tablename__ = "next_of_kin"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50))
    name = Column(String(150))
    relationship = Column(String(50))
    phone = Column(String(20))
    email = Column(String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "relationship": self.relationship,
            "phone": self.phone,
            "email": self.email,
        }
