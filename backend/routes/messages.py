from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.message import Message
from schemas.message import MessageCreate, MessageResponse
from auth.dependencies import get_current_admin
from services.email_service import send_contact_notification

public_router = APIRouter(prefix="/api/contact", tags=["contact"])
admin_router = APIRouter(prefix="/api/admin/messages", tags=["admin-messages"])


@public_router.post("", status_code=201)
def send_message(body: MessageCreate, db: Session = Depends(get_db)):
    msg = Message(**body.model_dump())
    db.add(msg)
    db.commit()
    # Fire-and-forget email notification
    try:
        send_contact_notification(body.name, body.email, body.subject, body.message)
    except Exception:
        pass
    return {"message": "Message sent successfully"}


@admin_router.get("", response_model=List[MessageResponse], dependencies=[Depends(get_current_admin)])
def list_messages(
    unread: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Message)
    if unread is not None:
        q = q.filter(Message.is_read == (not unread))
    if search:
        q = q.filter(
            Message.name.ilike(f"%{search}%") |
            Message.email.ilike(f"%{search}%") |
            Message.subject.ilike(f"%{search}%")
        )
    return q.order_by(Message.created_at.desc()).all()


@admin_router.put("/{msg_id}/read", response_model=MessageResponse, dependencies=[Depends(get_current_admin)])
def mark_read(msg_id: int, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg


@admin_router.delete("/{msg_id}", dependencies=[Depends(get_current_admin)])
def delete_message(msg_id: int, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"message": "Deleted"}
