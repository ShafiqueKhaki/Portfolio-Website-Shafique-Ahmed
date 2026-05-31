import hashlib
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta, timezone
from database import get_db
from models.analytics import Visitor
from schemas.analytics import PageViewCreate
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api/analytics", tags=["analytics"])
admin_router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])


@public_router.post("/pageview", status_code=201)
async def log_pageview(body: PageViewCreate, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
    visitor = Visitor(
        page=body.page,
        referrer=body.referrer,
        user_agent=body.user_agent or request.headers.get("user-agent"),
        ip_hash=ip_hash,
    )
    db.add(visitor)
    db.commit()
    return {"ok": True}


@admin_router.get("", dependencies=[Depends(get_current_admin)])
def get_analytics(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    total_views = db.query(func.count(Visitor.id)).scalar()
    week_views = db.query(func.count(Visitor.id)).filter(Visitor.created_at >= week_ago).scalar()

    # Views per day (last 14 days)
    fourteen_ago = now - timedelta(days=14)
    daily_raw = (
        db.query(cast(Visitor.created_at, Date).label("day"), func.count().label("count"))
        .filter(Visitor.created_at >= fourteen_ago)
        .group_by(cast(Visitor.created_at, Date))
        .order_by(cast(Visitor.created_at, Date))
        .all()
    )
    views_by_day = [{"date": str(r.day), "count": r.count} for r in daily_raw]

    # Top pages
    top_pages_raw = (
        db.query(Visitor.page, func.count().label("count"))
        .group_by(Visitor.page)
        .order_by(func.count().desc())
        .limit(10)
        .all()
    )
    top_pages = [{"page": r.page, "count": r.count} for r in top_pages_raw]

    # Top referrers
    top_referrers_raw = (
        db.query(Visitor.referrer, func.count().label("count"))
        .filter(Visitor.referrer != None, Visitor.referrer != "")
        .group_by(Visitor.referrer)
        .order_by(func.count().desc())
        .limit(10)
        .all()
    )
    top_referrers = [{"referrer": r.referrer, "count": r.count} for r in top_referrers_raw]

    return {
        "total_views": total_views,
        "week_views": week_views,
        "views_by_day": views_by_day,
        "top_pages": top_pages,
        "top_referrers": top_referrers,
    }
