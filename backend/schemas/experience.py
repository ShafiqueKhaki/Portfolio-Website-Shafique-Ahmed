from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List


class ExperienceBase(BaseModel):
    role: str
    company: str
    location: str = ""
    type: str = "job"
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: str = ""
    skills: List[str] = []
    order: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    order: Optional[int] = None


class ExperienceResponse(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
