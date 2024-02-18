from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.public.products import Products
from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class ReferenceIngredients(Base):
    __tablename__ = 'reference_ingredients'
    __table_args__ = (
        Index("ix_reference_ingredients_reference_id", "reference_id"),
        Index("ix_reference_ingredients_primary_id", "primary_id"),
        Index("ix_reference_ingredients_author_id", "author_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    reference_id = Column(String, ForeignKey("public.products.id", ondelete="CASCADE"), nullable=False)
    reference = relationship("app.modules.schema.public.products.Products",
                             backref="fk_reference_ingredients_products_reference_id")

    primary_id = Column(String, ForeignKey("main.primary_ingredients.id", ondelete="CASCADE"), nullable=False)
    primary = relationship("app.modules.schema.main.primary_ingredients.PrimaryIngredients",
                           backref="fk_reference_ingredients_primary_ingredients_primary_id")

    created_at = Column(DateTime, nullable=False)

    author_id = Column(String, ForeignKey("public.users.id"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users", backref="fk_reference_ingredients_users_author_id")

    def __init__(self, *args, **kwargs):
        super(ReferenceIngredients, self).__init__(*args, **kwargs)
