from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    headline: str
    bio: str
    avatar: Optional[str]
    resume_url: Optional[str]
    location: str
    email: str
    phone: Optional[str]
    github: Optional[str]
    linkedin: Optional[str]
    twitter: Optional[str]
    website: Optional[str]
    updated_at: datetime


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    resume_url: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None
