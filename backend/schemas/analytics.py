from pydantic import BaseModel
from typing import Optional


class PageViewCreate(BaseModel):
    page: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
