from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: str = ""
    location: str = ""
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    grade: Optional[str] = None
    description: str = ""
    order: int = 0


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class EducationResponse(EducationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
