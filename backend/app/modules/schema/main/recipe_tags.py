from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.recipes import Recipes
from app.modules.schema.main.recipe_dish_tags_reference import RecipeDishTagsReference

from app.modules.db_context import Base


class RecipeTags(Base):
    __tablename__ = 'recipe_tags'
    __table_args__ = (
        Index("ix_recipe_tags_dish_tag_id", "dish_tag_id"),
        Index("ix_recipe_tags_recipe_id_dish_tag_id", "recipe_id", "dish_tag_id", unique=True),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    recipe_id = Column(String, ForeignKey("main.recipes.id", ondelete="CASCADE"), nullable=False)
    recipe = relationship("app.modules.schema.main.recipes.Recipes",
                          backref="fk_recipe_tags_recipes_recipe_id")

    dish_tag_id = Column(String, ForeignKey("main.recipe_dish_tags_reference.id", ondelete="CASCADE"),
                         nullable=False)
    tag = relationship("app.modules.schema.main.recipe_dish_tags_reference.RecipeDishTagsReference",
                       backref="fk_recipe_tags_recipe_dish_tags_reference_dish_tag_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(RecipeTags, self).__init__(*args, **kwargs)
