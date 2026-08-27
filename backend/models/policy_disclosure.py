from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# 1:1 with Policy (see models/policy.py) - split out from the core policy
# record because these fields are underwriting disclosures/consent captured
# once during Build Policy, not the operational state of the policy itself.
class PolicyDisclosure(Base):
    __tablename__ = "policy_disclosures"

    policy_id = Column(String(50), primary_key=True)
    has_pre_existing_dispute = Column(Boolean, default=False)
    pre_existing_dispute_details = Column(String(1000))
    personal_use_confirmed = Column(Boolean, default=False)
    popia_consent = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "hasPreExistingDispute": self.has_pre_existing_dispute,
            "preExistingDisputeDetails": self.pre_existing_dispute_details,
            "personalUseConfirmed": self.personal_use_confirmed,
            "popiaConsent": self.popia_consent,
        }
