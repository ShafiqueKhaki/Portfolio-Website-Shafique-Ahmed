from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.experience import Experience
from schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api/experiences", tags=["experiences"])
admin_router = APIRouter(prefix="/api/admin/experiences", tags=["admin-experiences"])


@public_router.get("", response_model=List[ExperienceResponse])
def list_experiences(db: Session = Depends(get_db)):
    return db.query(Experience).order_by(Experience.start_date.desc()).all()


@admin_router.get("", response_model=List[ExperienceResponse], dependencies=[Depends(get_current_admin)])
def admin_list(db: Session = Depends(get_db)):
    return db.query(Experience).order_by(Experience.order).all()


@admin_router.post("", response_model=ExperienceResponse, dependencies=[Depends(get_current_admin)])
def create(body: ExperienceCreate, db: Session = Depends(get_db)):
    item = Experience(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@admin_router.put("/{item_id}", response_model=ExperienceResponse, dependencies=[Depends(get_current_admin)])
def update(item_id: int, body: ExperienceUpdate, db: Session = Depends(get_db)):
    item = db.query(Experience).filter(Experience.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@admin_router.delete("/{item_id}", dependencies=[Depends(get_current_admin)])
def delete(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Experience).filter(Experience.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
