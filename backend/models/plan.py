from sqlalchemy import Column, String, Numeric, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(20), primary_key=True)
    name = Column(String(50))
    monthly_price = Column(Numeric(10, 2))
    tagline = Column(String(255))
    consultations_included = Column(Integer, default=0)
    cover_limit = Column(Numeric(12, 2), default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "monthlyPrice": float(self.monthly_price) if self.monthly_price is not None else None,
            "tagline": self.tagline,
            "consultationsIncluded": self.consultations_included,
            "coverLimit": float(self.cover_limit) if self.cover_limit is not None else None,
        }
