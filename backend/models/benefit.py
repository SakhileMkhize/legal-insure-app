from sqlalchemy import Column, String, Integer, Numeric
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Benefit(Base):
    __tablename__ = "benefits"

    id = Column(String(20), primary_key=True)
    label = Column(String(150))
    description = Column(String(1000))
    usage_limit_count = Column(Integer)
    usage_limit_amount = Column(Numeric(10, 2))
    period = Column(String(20), default="annual")

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "usageLimitCount": self.usage_limit_count,
            "usageLimitAmount": float(self.usage_limit_amount) if self.usage_limit_amount is not None else None,
            "period": self.period,
        }
