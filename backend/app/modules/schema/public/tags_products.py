from sqlalchemy import Column, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.tags_reference import TagsReference
from app.modules.schema.public.products import Products

from app.modules.db_context import Base


class TagsProducts(Base):
    __tablename__ = 'tags_products'
    __table_args__ = (
        Index("ix_tags_products_tag_id", "tag_id"),
        Index("ix_tags_products_product_id", "product_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)

    tag_id = Column(String, ForeignKey("public.tags_reference.id", ondelete="CASCADE"),
                    nullable=False)
    tag = relationship("app.modules.schema.public.tags_reference.TagsReference",
                       backref="fk_tags_products_tags_reference_tag_id")

    product_id = Column(String, ForeignKey("public.products.id", ondelete="CASCADE"),
                        nullable=False)
    product = relationship("app.modules.schema.public.products.Products",
                           backref="fk_tags_products_products_product_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(TagsProducts, self).__init__(*args, **kwargs)
