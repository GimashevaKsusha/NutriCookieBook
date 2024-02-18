from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship

from app.modules.schema.main.ingredients import Ingredients

from app.modules.db_context import Base


class MappingLogs(Base):
    __tablename__ = 'mapping_logs'
    __table_args__ = (
        Index("ix_mapping_logs_ingredient_id", "ingredient_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    ingredient_id = Column(String, ForeignKey("main.ingredients.id", ondelete="CASCADE"), nullable=False)
    ingredient = relationship("app.modules.schema.main.ingredients.Ingredients",
                              backref="fk_mapping_logs_ingredients_ingredient_id")

    log = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(MappingLogs, self).__init__(*args, **kwargs)
