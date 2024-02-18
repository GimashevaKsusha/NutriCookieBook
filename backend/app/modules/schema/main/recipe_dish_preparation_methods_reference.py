from sqlalchemy import Column, String, DateTime, Index

from app.modules.db_context import Base


class RecipeDishPreparationMethodsReference(Base):
    __tablename__ = 'recipe_dish_preparation_methods_reference'
    __table_args__ = (
        Index("ix_recipe_dish_preparation_methods_reference_name", "name", unique=True),
        {"schema": "main"}
    )

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    def __init__(self, *args, **kwargs):
        super(RecipeDishPreparationMethodsReference, self).__init__(*args, **kwargs)
