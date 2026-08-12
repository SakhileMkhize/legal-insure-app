from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class PractitionerCategory(Base):
    __tablename__ = "practitioner_categories"

    practitioner_id = Column(String(50), primary_key=True)
    category_id = Column(String(20), primary_key=True)

    def to_dict(self):
        return {
            "practitionerId": self.practitioner_id,
            "categoryId": self.category_id,
        }
