from sqlalchemy import Column, Integer, String

from app.modules.db_context import Base


class Categories(Base):
    __tablename__ = 'product_categories'

    id_category = Column(Integer, primary_key=True)
    category_name = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Categories, self).__init__(*args, **kwargs)
