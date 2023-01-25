from sqlalchemy import Column, Integer, String

from app.modules.db_context import Base


class Ingredients(Base):
    __tablename__ = 'ingredients'

    id_ingredient = Column(Integer, primary_key=True)
    ingredient_name = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Ingredients, self).__init__(*args, **kwargs)
