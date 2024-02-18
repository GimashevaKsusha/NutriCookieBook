from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, Integer
from sqlalchemy.orm import relationship

from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class MappingHistory(Base):
    __tablename__ = 'mapping_history'
    __table_args__ = (
        Index("ix_mapping_history_author_id", "author_id"),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    page = Column(Integer, nullable=False)
    letter = Column(String, nullable=False)

    author_id = Column(String, ForeignKey("public.users.id", ondelete="CASCADE"), nullable=True)
    author = relationship("app.modules.schema.public.users.Users",
                          backref="fk_mapping_history_users_author_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(MappingHistory, self).__init__(*args, **kwargs)
