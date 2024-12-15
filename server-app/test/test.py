from fastapi.testclient import TestClient
import pytest
from env import config, load_env
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from lib.data.database import Base, get_db
from main import app

# Set up the test database
config['APP_ENV'] = 'Test'
config['TEST_DATABASE_URL'] = "sqlite:///./test.db"
engine = create_engine(config['TEST_DATABASE_URL'], connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)
