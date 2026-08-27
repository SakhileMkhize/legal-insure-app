from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# 1:1 with Policy (see models/policy.py) - split out because payment
# collection details are a distinct concern from the policy record itself,
# and are the most sensitive fields on it.
class PolicyBanking(Base):
    __tablename__ = "policy_banking"

    policy_id = Column(String(50), primary_key=True)
    payment_method = Column(String(20))
    bank_name = Column(String(100))
    account_holder = Column(String(150))
    account_number = Column(String(30))
    branch_code = Column(String(10))

    def to_dict(self):
        return {
            "paymentMethod": self.payment_method,
            "bankName": self.bank_name,
            "accountHolder": self.account_holder,
            "branchCode": self.branch_code,
            "accountNumberMasked": (
                f"•••• {self.account_number[-4:]}"
                if self.account_number and len(self.account_number) >= 4
                else None
            ),
            "bankingOnFile": bool(self.account_number),
        }
