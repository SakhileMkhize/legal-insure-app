from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class PlanFeature(Base):
    __tablename__ = "plan_features"

    id = Column(Integer, primary_key=True)
    plan_id = Column(String(20))
    feature = Column(String(255))
    sort_order = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "planId": self.plan_id,
            "feature": self.feature,
            "sortOrder": self.sort_order,
        }
