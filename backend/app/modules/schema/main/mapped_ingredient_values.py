from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.ingredients import Ingredients
from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class MappedIngredientValues(Base):
    __tablename__ = 'mapped_ingredient_values'
    __table_args__ = (
        Index("ix_mapped_ingredient_values_ingredient_id", "ingredient_id"),
        Index("ix_mapped_ingredient_values_primary_id", "primary_id"),
        Index("ix_mapped_ingredient_values_author_id", "author_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    ingredient_id = Column(String, ForeignKey("main.ingredients.id", ondelete="CASCADE"), nullable=False)
    ingredient = relationship("app.modules.schema.main.ingredients.Ingredients",
                              backref="fk_mapped_ingredient_values_ingredients_ingredient_id")

    primary_id = Column(String, ForeignKey("main.primary_ingredients.id", ondelete="CASCADE"), nullable=False)
    primary = relationship("app.modules.schema.main.primary_ingredients.PrimaryIngredients",
                           backref="fk_mapped_ingredient_values_primary_ingredients_primary_id")

    status = Column(String, nullable=True)

    author_id = Column(String, ForeignKey("public.users.id", ondelete="CASCADE"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users",
                          backref="fk_mapped_ingredient_values_users_author_id")

    created_at = Column(DateTime, nullable=False)
    controller_id = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    def __init__(self, *args, **kwargs):
        super(MappedIngredientValues, self).__init__(*args, **kwargs)
