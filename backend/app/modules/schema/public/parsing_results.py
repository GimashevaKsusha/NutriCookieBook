from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.modules.schema.public.attributes import Attributes
from app.modules.schema.public.entities import Entities
from app.modules.schema.public.values import Values
from app.modules.schema.public.parsing_sessions import ParsingSessions

from app.modules.db_context import Base


class ParsingResults(Base):
    __tablename__ = 'parsing_results'
    __table_args__ = (
        {"schema": "public"}
    )

    id = Column(String, primary_key=True)

    entity_id = Column(String, ForeignKey("public.entities.id", ondelete="CASCADE"), nullable=False)
    entity = relationship("app.modules.schema.public.entities.Entities",
                          backref="fk_parsing_results_entities_entity_id")

    attribute_id = Column(String, ForeignKey("public.attributes.id", ondelete="CASCADE"), nullable=False)
    attribute = relationship("app.modules.schema.public.attributes.Attributes",
                             backref="fk_parsing_results_attributes_attribute_id")

    value_id = Column(String, ForeignKey("public.values.id", ondelete="CASCADE"), nullable=False)
    value = relationship("app.modules.schema.public.values.Values",
                         backref="fk_parsing_results_values_value_id")

    session_id = Column(String, ForeignKey("public.parsing_sessions.id", ondelete="CASCADE"), nullable=False)
    session = relationship("app.modules.schema.public.parsing_sessions.ParsingSessions",
                         backref="fk_parsing_results_parsing_sessions_session_id")

    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(ParsingResults, self).__init__(*args, **kwargs)
