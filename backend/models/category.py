from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, CheckConstraint
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(20))  # "project" | "blog"

    __table_args__ = (
        CheckConstraint("type IN ('project', 'blog')", name="category_type_check"),
    )

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="category")
    blog_posts: Mapped[list["BlogPost"]] = relationship("BlogPost", back_populates="category")
