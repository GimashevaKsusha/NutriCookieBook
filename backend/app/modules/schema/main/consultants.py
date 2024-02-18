from sqlalchemy import Column, String, Index

from app.modules.db_context import Base


class Consultants(Base):
    __tablename__ = 'consultants'
    __table_args__ = (
        Index("ix_consultants_id", "id", unique=True),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)

    def __init__(self, *args, **kwargs):
        super(Consultants, self).__init__(*args, **kwargs)
