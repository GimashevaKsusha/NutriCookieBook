from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.recipe_list_categories import RecipeListCategories
from app.modules.schema.main.recipes import Recipes

from app.modules.db_context import Base


class RecipeCategories(Base):
    __tablename__ = 'recipe_categories'
    __table_args__ = (
        Index("ix_recipe_categories_categories_id", "categories_id"),
        Index("ix_recipe_categories_recipe_id", "recipe_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    categories_id = Column(String, ForeignKey("main.recipe_list_categories.id"), nullable=False)
    categories = relationship("app.modules.schema.main.recipe_list_categories.RecipeListCategories",
                              backref="fk_recipe_categories_recipe_list_categories_categories_id")

    recipe_id = Column(String, ForeignKey("main.recipes.id", ondelete="CASCADE"), nullable=False)
    recipe = relationship("app.modules.schema.main.recipes.Recipes",
                          backref="fk_recipe_categories_recipes_recipe_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(RecipeCategories, self).__init__(*args, **kwargs)
