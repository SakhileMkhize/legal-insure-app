from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class PolicyCoverCategory(Base):
    __tablename__ = "policy_cover_categories"

    policy_id = Column(String(50), primary_key=True)
    category_id = Column(String(20), primary_key=True)

    def to_dict(self):
        return {
            "policyId": self.policy_id,
            "categoryId": self.category_id,
        }
