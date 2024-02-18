from sqlalchemy import Column, String, DateTime

from app.modules.db_context import Base


class Files(Base):
    __tablename__ = 'files'
    __table_args__ = (
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    path = Column(String, nullable=False)
    name = Column(String, nullable=False)
    sha256hash = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Files, self).__init__(*args, **kwargs)
