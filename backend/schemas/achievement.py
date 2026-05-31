from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class AchievementBase(BaseModel):
    title: str
    description: str = ""
    date: Optional[date] = None
    category: str = "award"
    image: Optional[str] = None
    order: int = 0


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    category: Optional[str] = None
    image: Optional[str] = None
    order: Optional[int] = None


class AchievementResponse(AchievementBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
