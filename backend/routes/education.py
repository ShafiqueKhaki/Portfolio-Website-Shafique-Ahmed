from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.education import Education
from schemas.education import EducationCreate, EducationUpdate, EducationResponse
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api/education", tags=["education"])
admin_router = APIRouter(prefix="/api/admin/education", tags=["admin-education"])


@public_router.get("", response_model=List[EducationResponse])
def list_education(db: Session = Depends(get_db)):
    return db.query(Education).order_by(Education.start_date.desc()).all()


@admin_router.get("", response_model=List[EducationResponse], dependencies=[Depends(get_current_admin)])
def admin_list(db: Session = Depends(get_db)):
    return db.query(Education).order_by(Education.order).all()


@admin_router.post("", response_model=EducationResponse, dependencies=[Depends(get_current_admin)])
def create(body: EducationCreate, db: Session = Depends(get_db)):
    item = Education(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@admin_router.put("/{item_id}", response_model=EducationResponse, dependencies=[Depends(get_current_admin)])
def update(item_id: int, body: EducationUpdate, db: Session = Depends(get_db)):
    item = db.query(Education).filter(Education.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@admin_router.delete("/{item_id}", dependencies=[Depends(get_current_admin)])
def delete(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Education).filter(Education.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
