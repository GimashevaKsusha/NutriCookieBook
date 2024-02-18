from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.ingredients import Ingredients
from app.modules.schema.public.recipes import Recipes

from app.modules.db_context import Base


class RecipeIngredients(Base):
    __tablename__ = 'recipe_ingredients'
    __table_args__ = (
        Index("ix_recipe_ingredients_recipe_id", "recipe_id"),
        Index("ix_recipe_ingredients_ingredient_id", "ingredient_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, nullable=False)

    ingredient_id = Column(String, ForeignKey("public.ingredients.id", ondelete="CASCADE"), nullable=True)
    ingredient = relationship("app.modules.schema.public.ingredients.Ingredients",
                              backref="fk_recipe_ingredients_ingredients_ingredient_id")

    recipe_id = Column(String, ForeignKey("public.recipes.id", ondelete="CASCADE"), nullable=True)
    recipe = relationship("app.modules.schema.public.recipes.Recipes",
                          backref="fk_recipe_ingredients_recipes_recipe_id")

    amount = Column(String, nullable=True)
    position = Column(Integer, nullable=False)
    property = Column(String, nullable=True)

    def __init__(self, *args, **kwargs):
        super(RecipeIngredients, self).__init__(*args, **kwargs)
