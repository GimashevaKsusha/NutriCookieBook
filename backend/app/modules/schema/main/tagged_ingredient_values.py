from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.main.recipe_dish_tags_reference import RecipeDishTagsReference

from app.modules.db_context import Base


class TaggedIngredientValues(Base):
    __tablename__ = 'tagged_ingredient_values'
    __table_args__ = (
        Index("ix_tagged_ingredient_values_ingredient_id", "ingredient_id"),
        Index("ix_tagged_ingredient_values_tag_id", "tag_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    ingredient_id = Column(String, ForeignKey("main.primary_ingredients.id", ondelete="CASCADE"), nullable=False)
    ingredient = relationship("app.modules.schema.main.primary_ingredients.PrimaryIngredients",
                              backref="fk_tagged_ingredient_values_primary_ingredients_ingredient_id")

    tag_id = Column(String, ForeignKey("main.recipe_dish_tags_reference.id", ondelete="CASCADE"), nullable=False)
    tag = relationship("app.modules.schema.main.recipe_dish_tags_reference.RecipeDishTagsReference",
                       backref="fk_tagged_ingredient_values_recipe_dish_tags_reference_tag_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(TaggedIngredientValues, self).__init__(*args, **kwargs)
