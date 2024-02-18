from sqlalchemy import Column, String, DateTime, Index, ForeignKey
from sqlalchemy.orm import relationship

from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class PrimaryIngredients(Base):
    __tablename__ = 'primary_ingredients'
    __table_args__ = (
        Index("ix_primary_ingredients_name", "name", unique=True),
        Index("ix_primary_ingredients_author_id", "author_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    author_id = Column(String, ForeignKey("public.users.id"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users", backref="fk_primary_ingredients_users_author_id")

    def __init__(self, *args, **kwargs):
        super(PrimaryIngredients, self).__init__(*args, **kwargs)
