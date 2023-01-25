from sqlalchemy import Column, Integer, String

from app.modules.db_context import Base


class Triggers(Base):
    __tablename__ = 'triggers'

    id_trigger = Column(Integer, primary_key=True)
    trigger_name = Column(String, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Triggers, self).__init__(*args, **kwargs)
   