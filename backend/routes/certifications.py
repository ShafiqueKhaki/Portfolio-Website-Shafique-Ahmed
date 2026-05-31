from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.certification import Certification
from schemas.certification import CertificationCreate, CertificationUpdate, CertificationResponse
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api/certifications", tags=["certifications"])
admin_router = APIRouter(prefix="/api/admin/certifications", tags=["admin-certifications"])


@public_router.get("", response_model=List[CertificationResponse])
def list_certs(db: Session = Depends(get_db)):
    return db.query(Certification).order_by(Certification.order).all()


@admin_router.get("", response_model=List[CertificationResponse], dependencies=[Depends(get_current_admin)])
def admin_list(db: Session = Depends(get_db)):
    return db.query(Certification).order_by(Certification.order).all()


@admin_router.post("", response_model=CertificationResponse, dependencies=[Depends(get_current_admin)])
def create(body: CertificationCreate, db: Session = Depends(get_db)):
    item = Certification(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@admin_router.put("/{item_id}", response_model=CertificationResponse, dependencies=[Depends(get_current_admin)])
def update(item_id: int, body: CertificationUpdate, db: Session = Depends(get_db)):
    item = db.query(Certification).filter(Certification.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@admin_router.delete("/{item_id}", dependencies=[Depends(get_current_admin)])
def delete(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Certification).filter(Certification.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
