from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.modules.db_context import Base


class ParsingThemes(Base):
    __tablename__ = 'parsing_themes'
    __table_args__ = (
        Index("ix_parsing_themes_first_category_second_category", "first_category", "second_category", unique=True),
        Index("ix_parsing_themes_filename", "filename", unique=True),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    first_category = Column(String, nullable=False)
    second_category = Column(String, nullable=False)
    connection = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(ParsingThemes, self).__init__(*args, **kwargs)
