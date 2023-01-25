from sqlalchemy import Column, Integer, String

from app.modules.db_context import Base


class Recipes(Base):
    __tablename__ = 'recipes'

    id_recipe = Column(Integer, primary_key=True)
    recipe_name = Column(String, nullable=False)
    cooking_method = Column(String, nullable=False)
    source = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Recipes, self).__init__(*args, **kwargs)
