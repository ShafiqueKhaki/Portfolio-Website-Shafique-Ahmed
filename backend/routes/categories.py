from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from auth.dependencies import get_current_admin
from utils import slugify, ensure_unique_slug

public_router = APIRouter(prefix="/api/categories", tags=["categories"])
admin_router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])


@public_router.get("", response_model=List[CategoryResponse])
def list_categories(type: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Category)
    if type:
        q = q.filter(Category.type == type)
    return q.all()


@admin_router.get("", response_model=List[CategoryResponse], dependencies=[Depends(get_current_admin)])
def admin_list(db: Session = Depends(get_db)):
    return db.query(Category).all()


@admin_router.post("", response_model=CategoryResponse, dependencies=[Depends(get_current_admin)])
def create(body: CategoryCreate, db: Session = Depends(get_db)):
    slug = ensure_unique_slug(db, Category, slugify(body.name))
    item = Category(**body.model_dump(), slug=slug)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@admin_router.put("/{item_id}", response_model=CategoryResponse, dependencies=[Depends(get_current_admin)])
def update(item_id: int, body: CategoryUpdate, db: Session = Depends(get_db)):
    item = db.query(Category).filter(Category.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    if "name" in data:
        data["slug"] = ensure_unique_slug(db, Category, slugify(data["name"]), exclude_id=item_id)
    for field, value in data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@admin_router.delete("/{item_id}", dependencies=[Depends(get_current_admin)])
def delete(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Category).filter(Category.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
