import logging
from fastapi import Depends
from typing_extensions import Annotated
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from env import config

engine = create_engine(config.get('DATABASE_URL', 'sqlite:///./test.db'), echo=config.get("APP_ENV") == "Development" and config.get("SERVER_AI_DATABASE_ECHO") == "1")
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()