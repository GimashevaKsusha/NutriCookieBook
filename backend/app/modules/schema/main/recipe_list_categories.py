from sqlalchemy import Column, Integer, String, DateTime

from app.modules.db_context import Base


class RecipeListCategories(Base):
    __tablename__ = 'recipe_list_categories'
    __table_args__ = (
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    color = Column(String, nullable=False)
    preview_url = Column(String, nullable=False)
    priority = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(RecipeListCategories, self).__init__(*args, **kwargs)
