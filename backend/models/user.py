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
    date_of_birth = Column(Date)
    id_number = Column(String(20))
    address = Column(String(255))
    joined_at = Column(Date)
    employer_name = Column(String(150))
    occupation = Column(String(100))
    employment_status = Column(String(20))
    marital_status = Column(String(20))

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "dateOfBirth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "idNumber": self.id_number,
            "address": self.address,
            "joinedAt": self.joined_at.isoformat() if self.joined_at else None,
            "employerName": self.employer_name,
            "occupation": self.occupation,
            "employmentStatus": self.employment_status,
            "maritalStatus": self.marital_status,
        }
