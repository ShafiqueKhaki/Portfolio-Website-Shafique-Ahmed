from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime, timezone
from database import get_db
from models.blog_post import BlogPost
from models.user import User
from schemas.blog_post import BlogPostCreate, BlogPostUpdate, BlogPostResponse
from auth.dependencies import get_current_admin
from utils import slugify, ensure_unique_slug

public_router = APIRouter(prefix="/api/blog", tags=["blog"])
admin_router = APIRouter(prefix="/api/admin/blog", tags=["admin-blog"])


@public_router.get("", response_model=List[BlogPostResponse])
def list_posts(
    category: Optional[int] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(BlogPost).filter(BlogPost.is_published == True)
    if category is not None:
        q = q.filter(BlogPost.category_id == category)
    if search:
        q = q.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.excerpt.ilike(f"%{search}%"),
            )
        )
    posts = q.order_by(BlogPost.published_at.desc()).all()
    if tag:
        posts = [p for p in posts if tag in (p.tags or [])]
    return posts


@public_router.get("/{slug}", response_model=BlogPostResponse)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@admin_router.get("", response_model=List[BlogPostResponse], dependencies=[Depends(get_current_admin)])
def admin_list(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@admin_router.post("", response_model=BlogPostResponse)
def create_post(body: BlogPostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    slug = ensure_unique_slug(db, BlogPost, slugify(body.title))
    data = body.model_dump()
    published_at = datetime.now(timezone.utc) if data.get("is_published") else None
    post = BlogPost(**data, slug=slug, author_id=current_user.id, published_at=published_at)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@admin_router.put("/{post_id}", response_model=BlogPostResponse, dependencies=[Depends(get_current_admin)])
def update_post(post_id: int, body: BlogPostUpdate, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    data = body.model_dump(exclude_unset=True)
    if "title" in data:
        data["slug"] = ensure_unique_slug(db, BlogPost, slugify(data["title"]), exclude_id=post_id)
    if data.get("is_published") and not post.published_at:
        data["published_at"] = datetime.now(timezone.utc)
    for field, value in data.items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@admin_router.delete("/{post_id}", dependencies=[Depends(get_current_admin)])
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}
