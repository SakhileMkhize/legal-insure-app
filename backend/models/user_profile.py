from sqlalchemy import Column, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# 1:1 with User (see models/user.py) - split out to keep the core identity
# table lean. Holds the underwriting/personal-details side of a customer:
# who they are for KYC/employment purposes, not who they are for login.
class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(String(50), primary_key=True)
    date_of_birth = Column(Date)
    id_number = Column(String(20))
    address = Column(String(255))
    employer_name = Column(String(150))
    occupation = Column(String(100))
    employment_status = Column(String(20))
    marital_status = Column(String(20))

    def to_dict(self):
        return {
            "dateOfBirth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "idNumber": self.id_number,
            "address": self.address,
            "employerName": self.employer_name,
            "occupation": self.occupation,
            "employmentStatus": self.employment_status,
            "maritalStatus": self.marital_status,
        }
