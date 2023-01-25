from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.modules.db_context import Base


class Compositions(Base):
    __tablename__ = 'recipe_compositions'

    id_composition = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id_recipe", ondelete="CASCADE", onupdate="CASCADE"),
                       nullable=False)
    recipe = relationship("Recipes", backref="recipes")
    ingredient_id = Column(Integer, ForeignKey("ingredients.id_ingredient", ondelete="RESTRICT", onupdate="CASCADE"),
                           nullable=False)
    ingredient = relationship("Ingredients", backref="ingredients")
    amount = Column(Float, nullable=True)
    unit_id = Column(Integer, ForeignKey("units.id_unit", ondelete="RESTRICT", onupdate="CASCADE"),
                     nullable=False)
    unit = relationship("Units", backref="units")

    def __init__(self, *args, **kwargs):
        super(Compositions, self).__init__(*args, **kwargs)
