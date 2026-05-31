from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from config import settings
from database import engine, Base

# Import all models so Base.metadata is populated
import models  # noqa: F401

# Routes
from routes.auth import router as auth_router
from routes.profile import public_router as profile_pub, admin_router as profile_adm
from routes.projects import public_router as projects_pub, admin_router as projects_adm
from routes.skills import public_router as skills_pub, admin_router as skills_adm
from routes.experiences import public_router as exp_pub, admin_router as exp_adm
from routes.education import public_router as edu_pub, admin_router as edu_adm
from routes.certifications import public_router as cert_pub, admin_router as cert_adm
from routes.achievements import public_router as ach_pub, admin_router as ach_adm
from routes.blog import public_router as blog_pub, admin_router as blog_adm
from routes.categories import public_router as cat_pub, admin_router as cat_adm
from routes.messages import public_router as msg_pub, admin_router as msg_adm
from routes.analytics import public_router as analytics_pub, admin_router as analytics_adm
from routes.upload import admin_router as upload_adm


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (alembic handles migrations in production)
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    from seed import run_seed
    run_seed()
    yield


app = FastAPI(
    title="Shafique Ahmed — Portfolio API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Please try again."},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


# Register all routers
for router in [
    auth_router,
    profile_pub, profile_adm,
    projects_pub, projects_adm,
    skills_pub, skills_adm,
    exp_pub, exp_adm,
    edu_pub, edu_adm,
    cert_pub, cert_adm,
    ach_pub, ach_adm,
    blog_pub, blog_adm,
    cat_pub, cat_adm,
    msg_pub, msg_adm,
    analytics_pub, analytics_adm,
    upload_adm,
]:
    app.include_router(router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
