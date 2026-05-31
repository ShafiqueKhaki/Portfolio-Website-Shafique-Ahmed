from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from schemas.category import CategoryResponse
from schemas.auth import UserResponse


class BlogPostBase(BaseModel):
    title: str
    content: str = ""
    excerpt: str = ""
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    tags: List[str] = []
    is_published: bool = False
    reading_time_minutes: int = 1


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    reading_time_minutes: Optional[int] = None


class BlogPostResponse(BlogPostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    author_id: Optional[int]
    published_at: Optional[datetime]
    created_at: datetime
    category: Optional[CategoryResponse] = None
    author: Optional[UserResponse] = None
