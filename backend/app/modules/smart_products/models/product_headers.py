from sqlalchemy import Column, Integer, String

from app.modules.db_context import Base


class Headers(Base):
    __tablename__ = 'product_headers'

    id_header = Column(Integer, primary_key=True)
    header_name = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Headers, self).__init__(*args, **kwargs)
