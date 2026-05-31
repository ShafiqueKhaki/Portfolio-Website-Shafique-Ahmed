"""
Seed initial data on first startup.

- Creates the admin user from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
- If ADMIN_FORCE_UPDATE=true, updates the admin credentials even if the
  user already exists (useful when you change your email/password in .env).
- Creates the default profile row (single-row settings table).
- Seeds sample categories, skills, education, and experience so the
  public pages render something useful out of the box.
"""

from database import SessionLocal
from models.user import User
from models.profile import Profile
from models.category import Category
from models.skill import Skill
from models.education import Education
from models.experience import Experience
from auth.hashing import hash_password
from config import settings
from datetime import date


def run_seed():
    db = SessionLocal()
    try:
        _seed_admin(db)
        _seed_profile(db)
        _seed_categories(db)
        _seed_skills(db)
        _seed_education(db)
        _seed_experience(db)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[seed] Error during seeding: {e}")
    finally:
        db.close()


def _seed_admin(db):
    existing = db.query(User).filter(User.is_admin == True).first()

    if existing is None:
        admin = User(
            name=settings.ADMIN_NAME,
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            is_admin=True,
        )
        db.add(admin)
        db.flush()
        print(f"[seed] Admin user created: {settings.ADMIN_EMAIL}")

    elif settings.ADMIN_FORCE_UPDATE:
        existing.name = settings.ADMIN_NAME
        existing.email = settings.ADMIN_EMAIL
        existing.hashed_password = hash_password(settings.ADMIN_PASSWORD)
        db.flush()
        print(f"[seed] Admin user FORCE-UPDATED: {settings.ADMIN_EMAIL}")

    else:
        print(f"[seed] Admin already exists ({existing.email}). "
              "Set ADMIN_FORCE_UPDATE=true to update credentials.")


def _seed_profile(db):
    if db.query(Profile).first():
        return
    profile = Profile(
        full_name="Shafique Ahmed",
        headline="CS Student → Aspiring Software Engineer | Building things that matter",
        bio=(
            "I'm Shafique Ahmed, a final-year Computer Science student at Sukkur IBA University. "
            "I love building full-stack web applications, exploring backend systems, and learning "
            "everything I can about software engineering. Based in Sukkur, Sindh, Pakistan."
        ),
        location="Sukkur, Sindh, Pakistan",
        email="your@email.com",
        github="https://github.com/yourusername",
        linkedin="https://linkedin.com/in/yourusername",
        twitter="https://x.com/yourusername",
    )
    db.add(profile)
    print("[seed] Default profile created.")


def _seed_categories(db):
    if db.query(Category).first():
        return
    categories = [
        Category(name="Web Development", slug="web-development", type="project"),
        Category(name="Machine Learning", slug="machine-learning", type="project"),
        Category(name="CLI Tools", slug="cli-tools", type="project"),
        Category(name="Tutorial", slug="tutorial", type="blog"),
        Category(name="Opinion", slug="opinion", type="blog"),
        Category(name="Project Log", slug="project-log", type="blog"),
    ]
    db.add_all(categories)
    print("[seed] Sample categories created.")


def _seed_skills(db):
    if db.query(Skill).first():
        return
    skills = [
        # Languages
        Skill(name="Python", category="Languages", level=4, order=1),
        Skill(name="JavaScript", category="Languages", level=4, order=2),
        Skill(name="TypeScript", category="Languages", level=3, order=3),
        Skill(name="C++", category="Languages", level=3, order=4),
        Skill(name="SQL", category="Languages", level=3, order=5),
        # Frameworks
        Skill(name="FastAPI", category="Frameworks", level=4, order=1),
        Skill(name="Next.js", category="Frameworks", level=4, order=2),
        Skill(name="React", category="Frameworks", level=4, order=3),
        Skill(name="SQLAlchemy", category="Frameworks", level=3, order=4),
        # Tools
        Skill(name="Git & GitHub", category="Tools", level=4, order=1),
        Skill(name="PostgreSQL", category="Tools", level=3, order=2),
        Skill(name="Docker", category="Tools", level=2, order=3),
        Skill(name="Linux", category="Tools", level=3, order=4),
        # Concepts
        Skill(name="REST APIs", category="Concepts", level=4, order=1),
        Skill(name="Data Structures & Algorithms", category="Concepts", level=3, order=2),
        Skill(name="OOP", category="Concepts", level=4, order=3),
        Skill(name="System Design", category="Concepts", level=2, order=4),
    ]
    db.add_all(skills)
    print("[seed] Sample skills created.")


def _seed_education(db):
    if db.query(Education).first():
        return
    edu = Education(
        institution="Sukkur IBA University",
        degree="Bachelor of Science",
        field_of_study="Computer Science",
        location="Sukkur, Sindh, Pakistan",
        start_date=date(2021, 9, 1),
        is_current=True,
        grade="3.5 / 4.0",
        description=(
            "Studying core CS fundamentals: data structures, algorithms, databases, "
            "operating systems, software engineering, and web development."
        ),
        order=0,
    )
    db.add(edu)
    print("[seed] Sample education created.")


def _seed_experience(db):
    if db.query(Experience).first():
        return
    exp = Experience(
        role="Freelance Web Developer",
        company="Self-employed",
        location="Remote",
        type="freelance",
        start_date=date(2023, 1, 1),
        is_current=True,
        description=(
            "Building full-stack web applications for clients using FastAPI, Next.js, "
            "PostgreSQL, and Tailwind CSS. Handling everything from requirements to deployment."
        ),
        skills=["FastAPI", "Next.js", "PostgreSQL", "Tailwind CSS"],
        order=0,
    )
    db.add(exp)
    print("[seed] Sample experience created.")


if __name__ == "__main__":
    run_seed()
