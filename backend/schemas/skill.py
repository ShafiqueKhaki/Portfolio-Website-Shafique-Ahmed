from pydantic import BaseModel, ConfigDict
from typing import Optional


class SkillBase(BaseModel):
    name: str
    category: str
    level: int = 3
    icon: Optional[str] = None
    order: int = 0
    is_active: bool = True


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    level: Optional[int] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class SkillResponse(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
