from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class CertificationBase(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_url: Optional[str] = None
    image: Optional[str] = None
    order: int = 0


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_url: Optional[str] = None
    image: Optional[str] = None
    order: Optional[int] = None


class CertificationResponse(CertificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
