from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.consultants import Consultants

from app.modules.db_context import Base


class Ingredients(Base):
    __tablename__ = 'ingredients'
    __table_args__ = (
        Index("ix_ingredients_consultant_id", "consultant_id"),
        Index("ix_ingredients_name_consultant_id", "name", "consultant_id", unique=True),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    consultant_id = Column(String, ForeignKey("main.consultants.id"), nullable=True)
    consultant = relationship("app.modules.schema.main.consultants.Consultants",
                              backref="fk_ingredients_consultants_consultant_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Ingredients, self).__init__(*args, **kwargs)
