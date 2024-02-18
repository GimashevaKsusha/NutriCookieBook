from sqlalchemy import Column, String, DateTime

from app.modules.db_context import Base


class TagsReference(Base):
    __tablename__ = 'tags_reference'
    __table_args__ = (
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=True)

    def __init__(self, *args, **kwargs):
        super(TagsReference, self).__init__(*args, **kwargs)
