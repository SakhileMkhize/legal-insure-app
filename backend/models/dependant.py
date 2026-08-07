from sqlalchemy import Column, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Dependant(Base):
    __tablename__ = "dependants"

    id = Column(String(50), primary_key=True)
    policy_id = Column(String(50))
    name = Column(String(100))
    date_of_birth = Column(Date)
    relationship = Column(String(20))

    def to_dict(self):
        return {
            "id": self.id,
            "policyId": self.policy_id,
            "name": self.name,
            "dateOfBirth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "relationship": self.relationship,
        }
