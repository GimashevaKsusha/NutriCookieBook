from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.ingredients import Ingredients
from app.modules.schema.main.recipes import Recipes
from app.modules.schema.main.recipe_dish_units_reference import RecipeDishUnitsReference

from app.modules.db_context import Base


class RecipeIngredients(Base):
    __tablename__ = 'recipe_ingredients'
    __table_args__ = (
        Index("ix_recipe_ingredients_ingredient_id_recipe_id", "ingredient_id", "recipe_id", unique=True),
        Index("ix_recipe_ingredients_recipe_id", "recipe_id"),
        Index("ix_recipe_ingredients_unit_volume_id", "unit_volume_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    ingredient_id = Column(String, ForeignKey("main.ingredients.id", ondelete="CASCADE"), nullable=False)
    ingredient = relationship("app.modules.schema.main.ingredients.Ingredients",
                              backref="fk_recipe_ingredients_ingredients_ingredient_id")

    recipe_id = Column(String, ForeignKey("main.recipes.id", ondelete="CASCADE"), nullable=False)
    recipe = relationship("app.modules.schema.main.recipes.Recipes", backref="fk_recipe_ingredients_recipes_recipe_id")

    volume = Column(Numeric, nullable=False)

    unit_volume_id = Column(String, ForeignKey("main.recipe_dish_units_reference.id", ondelete="CASCADE"),
                            nullable=False)
    unit = relationship("app.modules.schema.main.recipe_dish_units_reference.RecipeDishUnitsReference",
                        backref="fk_recipe_ingredients_recipe_dish_units_reference_unit_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(RecipeIngredients, self).__init__(*args, **kwargs)
