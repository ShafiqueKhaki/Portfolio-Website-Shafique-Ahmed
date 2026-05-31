from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.skill import Skill
from schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api/skills", tags=["skills"])
admin_router = APIRouter(prefix="/api/admin/skills", tags=["admin-skills"])


@public_router.get("", response_model=List[SkillResponse])
def list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).filter(Skill.is_active == True).order_by(Skill.order).all()


@admin_router.get("", response_model=List[SkillResponse], dependencies=[Depends(get_current_admin)])
def admin_list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.order).all()


@admin_router.post("", response_model=SkillResponse, dependencies=[Depends(get_current_admin)])
def create_skill(body: SkillCreate, db: Session = Depends(get_db)):
    skill = Skill(**body.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@admin_router.put("/{skill_id}", response_model=SkillResponse, dependencies=[Depends(get_current_admin)])
def update_skill(skill_id: int, body: SkillUpdate, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(skill, field, value)
    db.commit()
    db.refresh(skill)
    return skill


@admin_router.delete("/{skill_id}", dependencies=[Depends(get_current_admin)])
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Deleted"}
