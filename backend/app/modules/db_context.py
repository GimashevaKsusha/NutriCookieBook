from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from starlette.requests import Request
from dotenv import load_dotenv
import os


def create_db_engine():
    load_dotenv()
    return create_engine(os.getenv("DATABASE_URL"))


def create_session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db(request: Request):
    return request.state.db


Base = declarative_base()
