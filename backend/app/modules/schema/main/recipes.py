from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.recipe_dish_preparation_methods_reference import RecipeDishPreparationMethodsReference
from app.modules.schema.main.files import Files
from app.modules.schema.main.consultants import Consultants
from app.modules.schema.main.recipe_dish_units_reference import RecipeDishUnitsReference

from app.modules.db_context import Base


class Recipes(Base):
    __tablename__ = 'recipes'
    __table_args__ = (
        Index("ix_recipes_consultant_id", "consultant_id"),
        Index("ix_recipes_method_id", "method_id"),
        Index("ix_recipes_photo_file_id", "photo_file_id"),
        Index("ix_recipes_unit_volume_id", "unit_volume_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)

    method_id = Column(String, ForeignKey("main.recipe_dish_preparation_methods_reference.id", ondelete="CASCADE"),
                       nullable=False)
    method = relationship(
        "app.modules.schema.main.recipe_dish_preparation_methods_reference.RecipeDishPreparationMethodsReference",
        backref="fk_recipes_recipe_dish_preparation_methods_reference_method_id")

    preview_url = Column(String, nullable=True)

    photo_file_id = Column(String, ForeignKey("main.files.id"), nullable=True)
    file = relationship("app.modules.schema.main.files.Files", backref="fk_recipes_files_photo_file_id")

    consultant_id = Column(String, ForeignKey("main.consultants.id", ondelete="CASCADE"), nullable=True)
    consultant = relationship("app.modules.schema.main.consultants.Consultants",
                              backref="fk_recipes_consultants_consultant_id")

    volume = Column(Numeric, nullable=False)

    unit_volume_id = Column(String, ForeignKey("main.recipe_dish_units_reference.id", ondelete="CASCADE"),
                            nullable=False)
    unit = relationship("app.modules.schema.main.recipe_dish_units_reference.RecipeDishUnitsReference",
                        backref="fk_recipes_recipe_dish_units_reference_unit_volume_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Recipes, self).__init__(*args, **kwargs)
