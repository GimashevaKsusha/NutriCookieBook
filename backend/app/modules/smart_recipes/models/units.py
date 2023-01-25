from sqlalchemy import Column, Integer, String

from app.modules.db_context import Base


class Units(Base):
    __tablename__ = 'units'

    id_unit = Column(Integer, primary_key=True)
    unit_name = Column(String, nullable=False)
    unit_abbr = Column(String, nullable=True)

    def __init__(self, *args, **kwargs):
        super(Units, self).__init__(*args, **kwargs)
