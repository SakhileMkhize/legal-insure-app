from sqlalchemy import Column, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    role = Column(String(20), nullable=False, default="customer")
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255))
    password_hash = Column(String(255))
    phone = Column(String(20))
    joined_at = Column(Date)

    # Kept lean on purpose - date of birth, ID number, address, and
    # employment/marital details live on UserProfile (models/user_profile.py),
    # a 1:1 satellite table. Route handlers merge the two dicts together so
    # the API's user JSON shape is unaffected by the split.
    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "joinedAt": self.joined_at.isoformat() if self.joined_at else None,
        }
