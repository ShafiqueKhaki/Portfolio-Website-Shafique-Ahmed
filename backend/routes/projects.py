from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from models.project import Project
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from auth.dependencies import get_current_admin
from utils import slugify, ensure_unique_slug

public_router = APIRouter(prefix="/api/projects", tags=["projects"])
admin_router = APIRouter(prefix="/api/admin/projects", tags=["admin-projects"])


@public_router.get("", response_model=List[ProjectResponse])
def list_projects(
    category: Optional[int] = Query(None),
    featured: Optional[bool] = Query(None),
    tech: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Project).filter(Project.is_active == True)
    if category is not None:
        q = q.filter(Project.category_id == category)
    if featured is not None:
        q = q.filter(Project.is_featured == featured)
    projects = q.order_by(Project.created_at.desc()).all()
    if tech:
        projects = [p for p in projects if tech.lower() in [t.lower() for t in (p.tech_stack or [])]]
    return projects


@public_router.get("/{slug}", response_model=ProjectResponse)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.slug == slug, Project.is_active == True).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@admin_router.get("", response_model=List[ProjectResponse], dependencies=[Depends(get_current_admin)])
def admin_list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()


@admin_router.post("", response_model=ProjectResponse, dependencies=[Depends(get_current_admin)])
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    slug = ensure_unique_slug(db, Project, slugify(body.title))
    project = Project(**body.model_dump(), slug=slug)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@admin_router.put("/{project_id}", response_model=ProjectResponse, dependencies=[Depends(get_current_admin)])
def update_project(project_id: int, body: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    data = body.model_dump(exclude_unset=True)
    if "title" in data:
        data["slug"] = ensure_unique_slug(db, Project, slugify(data["title"]), exclude_id=project_id)
    for field, value in data.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@admin_router.delete("/{project_id}", dependencies=[Depends(get_current_admin)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Deleted"}
