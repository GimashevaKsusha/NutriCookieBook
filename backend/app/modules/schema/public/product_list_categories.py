from sqlalchemy import Column, String, DateTime

from app.modules.db_context import Base


class ProductListCategories(Base):
    __tablename__ = 'product_list_categories'
    __table_args__ = (
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(ProductListCategories, self).__init__(*args, **kwargs)
