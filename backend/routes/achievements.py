from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.achievement import Achievement
from schemas.achievement import AchievementCreate, AchievementUpdate, AchievementResponse
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api/achievements", tags=["achievements"])
admin_router = APIRouter(prefix="/api/admin/achievements", tags=["admin-achievements"])


@public_router.get("", response_model=List[AchievementResponse])
def list_achievements(db: Session = Depends(get_db)):
    return db.query(Achievement).order_by(Achievement.order).all()


@admin_router.get("", response_model=List[AchievementResponse], dependencies=[Depends(get_current_admin)])
def admin_list(db: Session = Depends(get_db)):
    return db.query(Achievement).order_by(Achievement.order).all()


@admin_router.post("", response_model=AchievementResponse, dependencies=[Depends(get_current_admin)])
def create(body: AchievementCreate, db: Session = Depends(get_db)):
    item = Achievement(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@admin_router.put("/{item_id}", response_model=AchievementResponse, dependencies=[Depends(get_current_admin)])
def update(item_id: int, body: AchievementUpdate, db: Session = Depends(get_db)):
    item = db.query(Achievement).filter(Achievement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@admin_router.delete("/{item_id}", dependencies=[Depends(get_current_admin)])
def delete(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Achievement).filter(Achievement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
