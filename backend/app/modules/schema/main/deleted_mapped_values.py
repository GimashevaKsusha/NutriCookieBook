from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.ingredients import Ingredients
from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class DeletedMappedValues(Base):
    __tablename__ = 'deleted_mapped_values'
    __table_args__ = (
        Index("ix_deleted_mapped_values_ingredient_id", "ingredient_id"),
        Index("ix_deleted_mapped_values_primary_id", "primary_id"),
        Index("ix_deleted_mapped_values_author_id", "author_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    ingredient_id = Column(String, ForeignKey("main.ingredients.id", ondelete="CASCADE"), nullable=False)
    ingredient = relationship("app.modules.schema.main.ingredients.Ingredients",
                              backref="fk_deleted_mapped_values_ingredients_ingredient_id")

    primary_id = Column(String, ForeignKey("main.primary_ingredients.id", ondelete="CASCADE"), nullable=False)
    primary = relationship("app.modules.schema.main.primary_ingredients.PrimaryIngredients",
                           backref="fk_deleted_mapped_values_primary_ingredients_primary_id")

    author_id = Column(String, ForeignKey("public.users.id", ondelete="CASCADE"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users",
                          backref="fk_deleted_mapped_values_users_author_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(DeletedMappedValues, self).__init__(*args, **kwargs)
