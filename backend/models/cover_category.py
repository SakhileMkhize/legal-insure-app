from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class CoverCategory(Base):
    __tablename__ = "cover_categories"

    id = Column(String(20), primary_key=True)
    label = Column(String(100))
    description = Column(String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.label,
            "description": self.description,
        }
