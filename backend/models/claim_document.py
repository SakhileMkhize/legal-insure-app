from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ClaimDocument(Base):
    __tablename__ = "claim_documents"

    id = Column(String(50), primary_key=True)
    claim_id = Column(String(50))
    uploaded_by = Column(String(50))
    file_name = Column(String(255))
    stored_path = Column(String(500))
    content_type = Column(String(100))
    file_size = Column(Integer)
    uploaded_at = Column(DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "claimId": self.claim_id,
            "uploadedBy": self.uploaded_by,
            "fileName": self.file_name,
            "contentType": self.content_type,
            "fileSize": self.file_size,
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
