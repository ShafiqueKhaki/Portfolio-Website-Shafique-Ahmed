import re
from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def ensure_unique_slug(db: Session, model, slug: str, exclude_id: int = None) -> str:
    """Guarantee uniqueness by appending -1, -2, etc. as needed."""
    base_slug = slug
    counter = 1
    while True:
        query = db.query(model).filter(model.slug == slug)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1
