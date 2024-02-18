from sqlalchemy import Column, String, Text, DateTime, ARRAY

from app.modules.db_context import Base


class Recipes(Base):
    __tablename__ = 'recipes'
    __table_args__ = (
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, nullable=False)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    method = Column(String, nullable=True)
    preview_url = Column(String, nullable=True)
    tags = Column(ARRAY(Text), nullable=True)

    def __init__(self, *args, **kwargs):
        super(Recipes, self).__init__(*args, **kwargs)
