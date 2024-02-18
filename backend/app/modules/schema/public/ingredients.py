from sqlalchemy import Column, Numeric, String, DateTime, ForeignKey

from app.modules.db_context import Base


class Ingredients(Base):
    __tablename__ = 'ingredients'
    __table_args__ = (
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, nullable=False)
    name = Column(String, nullable=True)
    price = Column(Numeric, nullable=False)
    preview_url = Column(String, nullable=True)

    def __init__(self, *args, **kwargs):
        super(Ingredients, self).__init__(*args, **kwargs)
