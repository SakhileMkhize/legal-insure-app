from sqlalchemy import Column, String, Integer, Numeric
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class PolicyBenefit(Base):
    __tablename__ = "policy_benefits"

    policy_id = Column(String(50), primary_key=True)
    benefit_id = Column(String(20), primary_key=True)
    used_count = Column(Integer, default=0)
    used_amount = Column(Numeric(10, 2), default=0)

    def to_dict(self):
        return {
            "policyId": self.policy_id,
            "benefitId": self.benefit_id,
            "usedCount": self.used_count,
            "usedAmount": float(self.used_amount) if self.used_amount is not None else 0,
        }
