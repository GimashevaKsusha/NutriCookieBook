from sqlalchemy import Column, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.nutrient_list_headers import NutrientListHeaders

from app.modules.db_context import Base


class Nutrients(Base):
    __tablename__ = 'nutrients'
    __table_args__ = (
        Index("ix_nutrients_header_id", "header_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    header_id = Column(String, ForeignKey("public.nutrient_list_headers.id", ondelete="CASCADE"),
                       nullable=False)
    header = relationship("app.modules.schema.public.nutrient_list_headers.NutrientListHeaders",
                          backref="fk_nutrients_nutrient_list_headers_header_id")

    created_at = Column(DateTime, nullable=False)
    unit = Column(String, nullable=True)

    def __init__(self, *args, **kwargs):
        super(Nutrients, self).__init__(*args, **kwargs)
