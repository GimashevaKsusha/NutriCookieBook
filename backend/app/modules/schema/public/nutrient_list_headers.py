from sqlalchemy import Column, String, Boolean, DateTime

from app.modules.db_context import Base


class NutrientListHeaders(Base):
    __tablename__ = 'nutrient_list_headers'
    __table_args__ = (
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    displayed = Column(Boolean, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(NutrientListHeaders, self).__init__(*args, **kwargs)
