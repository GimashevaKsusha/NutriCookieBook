from sqlalchemy import Column, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.products import Products
from app.modules.schema.public.ingredients import Ingredients

from app.modules.db_context import Base


class ProductsIngredients(Base):
    __tablename__ = 'products_ingredients'
    __table_args__ = (
        Index("ix_products_ingredients_product_id", "product_id"),
        Index("x_products_ingredients_ingredient_id", "ingredient_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)

    product_id = Column(String, ForeignKey("public.products.id", ondelete="CASCADE"),
                        nullable=False)
    product = relationship("app.modules.schema.public.products.Products",
                           backref="fk_products_ingredients_products_product_id")

    ingredient_id = Column(String, ForeignKey("public.ingredients.id", ondelete="CASCADE"),
                           nullable=False)
    ingredient = relationship("app.modules.schema.public.ingredients.Ingredients",
                              backref="fk_products_ingredients_ingredients_ingredient_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(ProductsIngredients, self).__init__(*args, **kwargs)
