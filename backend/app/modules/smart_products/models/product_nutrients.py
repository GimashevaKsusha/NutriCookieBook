from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.modules.db_context import Base


class Nutrients(Base):
    __tablename__ = 'product_nutrients'

    id_nutrient = Column(Integer, primary_key=True)
    nutrient_name = Column(String, nullable=False)
    header_id = Column(Integer, ForeignKey("product_headers.id_header", ondelete="RESTRICT", onupdate="CASCADE"),
                       nullable=False)
    header = relationship("Headers", backref="product_headers")

    def __init__(self, *args, **kwargs):
        super(Nutrients, self).__init__(*args, **kwargs)
