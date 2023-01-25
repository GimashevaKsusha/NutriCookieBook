from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.modules.db_context import Base


class Compositions(Base):
    __tablename__ = 'product_compositions'

    id_composition = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id_product", ondelete="RESTRICT", onupdate="CASCADE"),
                        nullable=False)
    product = relationship("Products", backref="products")
    nutrient_id = Column(Integer, ForeignKey("product_nutrients.id_nutrient", ondelete="RESTRICT", onupdate="CASCADE"),
                         nullable=False)
    nutrient = relationship("Nutrients", backref="product_nutrients")
    amount = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    rsp_percent = Column(Integer, nullable=True)

    def __init__(self, *args, **kwargs):
        super(Compositions, self).__init__(*args, **kwargs)
