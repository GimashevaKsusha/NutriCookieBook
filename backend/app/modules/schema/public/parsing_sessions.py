from sqlalchemy import Column, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.users import Users

from app.modules.db_context import Base


class ParsingSessions(Base):
    __tablename__ = 'parsing_sessions'
    __table_args__ = (
        Index("ix_parsing_sessions_filename", "filename", unique=True),
        Index("ix_parsing_sessions_user_id", "user_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, nullable=False)

    user_id = Column(String, ForeignKey("public.users.id", ondelete="CASCADE"),
                     nullable=False)
    user = relationship("app.modules.schema.public.users.Users",
                        backref="fk_parsing_sessions_users_user_id")

    filename = Column(String, nullable=False)
    type = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(ParsingSessions, self).__init__(*args, **kwargs)
