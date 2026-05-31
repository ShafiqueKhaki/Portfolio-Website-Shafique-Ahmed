from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from schemas.category import CategoryResponse


class ProjectBase(BaseModel):
    title: str
    summary: str = ""
    description: str = ""
    role: str = ""
    year: Optional[int] = None
    status: str = "completed"
    cover_image: Optional[str] = None
    gallery: List[str] = []
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    video_url: Optional[str] = None
    tech_stack: List[str] = []
    is_featured: bool = False
    is_active: bool = True
    category_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    year: Optional[int] = None
    status: Optional[str] = None
    cover_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    video_url: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    category: Optional[CategoryResponse] = None
