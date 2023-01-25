from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.modules.db_context import Base


class Products(Base):
    __tablename__ = 'products'

    id_product = Column(Integer, primary_key=True)
    product_name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.id_category", ondelete="RESTRICT", onupdate="CASCADE"),
                         nullable=False)
    category = relationship("Categories", backref="product_categories")
    source = Column(String, nullable=False)
    link = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Products, self).__init__(*args, **kwargs)
