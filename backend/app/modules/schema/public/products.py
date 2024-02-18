from sqlalchemy import Column, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.product_list_categories import ProductListCategories
from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class Products(Base):
    __tablename__ = 'products'
    __table_args__ = (
        Index("ix_products_category_id", "category_id"),
        Index("ix_products_author_id", "author_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    category_id = Column(String, ForeignKey("public.product_list_categories.id", ondelete="CASCADE"),
                         nullable=False)
    category = relationship("app.modules.schema.public.product_list_categories.ProductListCategories",
                            backref="fk_products_product_list_categories_category_id")

    source = Column(String, nullable=False)
    link = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    author_id = Column(String, ForeignKey("public.users.id"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users", backref="fk_products_users_author_id")

    def __init__(self, *args, **kwargs):
        super(Products, self).__init__(*args, **kwargs)
