from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from starlette.requests import Request


def create_db_engine():
    return create_engine("postgresql://postgres:1234@db/nutricookiebook")


def create_session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db(request: Request):
    return request.state.db


Base = declarative_base()
