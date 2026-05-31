from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class MessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str = ""
    message: str


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime
