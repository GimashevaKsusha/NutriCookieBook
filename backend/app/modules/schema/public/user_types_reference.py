from sqlalchemy import Column, String, DateTime, Index

from app.modules.db_context import Base


class UserTypesReference(Base):
    __tablename__ = 'user_types_reference'
    __table_args__ = (
        Index("ix_user_types_reference_type", "type", unique=True),
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(UserTypesReference, self).__init__(*args, **kwargs)
