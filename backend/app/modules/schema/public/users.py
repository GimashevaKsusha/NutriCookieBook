from sqlalchemy import Column, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

from app.modules.schema.public.user_types_reference import UserTypesReference

from app.modules.db_context import Base


class Users(Base):
    __tablename__ = 'users'
    __table_args__ = (
        Index("ix_users_login", "login", unique=True),
        Index("ix_users_type_id", "type_id"),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    login = Column(String, nullable=False)
    password = Column(String, nullable=False)

    type_id = Column(String, ForeignKey("public.user_types_reference.id", ondelete="CASCADE"), nullable=True)
    type = relationship("app.modules.schema.public.user_types_reference.UserTypesReference",
                        backref="fk_users_user_types_reference_type_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Users, self).__init__(*args, **kwargs)
