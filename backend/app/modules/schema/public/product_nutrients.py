from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.products import Products
from app.modules.schema.public.nutrients import Nutrients
from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class ProductNutrients(Base):
    __tablename__ = 'product_nutrients'
    __table_args__ = (
        Index("ix_product_nutrients_product_id", "product_id"),
        Index("ix_product_nutrients_nutrient_id", "nutrient_id"),
        Index("ix_product_nutrients_author_id", "author_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)

    product_id = Column(String, ForeignKey("public.products.id", ondelete="CASCADE"),
                        nullable=False)
    product = relationship("app.modules.schema.public.products.Products",
                           backref="fk_product_nutrients_products_product_id")

    nutrient_id = Column(String, ForeignKey("public.nutrients.id", ondelete="CASCADE"),
                         nullable=False)
    nutrient = relationship("app.modules.schema.public.nutrients.Nutrients",
                            backref="fk_product_nutrients_nutrients_nutrient_id")

    amount = Column(Numeric, nullable=True)
    unit = Column(String, nullable=True)
    rsp_percent = Column(Numeric, nullable=True)
    created_at = Column(DateTime, nullable=False)

    author_id = Column(String, ForeignKey("public.users.id"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users", backref="fk_product_nutrients_users_author_id")

    def __init__(self, *args, **kwargs):
        super(ProductNutrients, self).__init__(*args, **kwargs)
