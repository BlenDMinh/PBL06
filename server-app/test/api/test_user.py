import pytest
from lib.data.models import User
from lib.schema.data import UserCreate, UserSchema
from test.test import client
from test.test_data.user import init_users, add_users
from env import load_env
from lib.data.database import create_db_and_tables, get_db

@pytest.fixture(scope="session", autouse=True)
def setup_env():
    load_env(".env.test")
    yield

@pytest.fixture(scope="session", autouse=True)
def create_table():
    create_db_and_tables()
    db = next(get_db())
    db.add_all(init_users)
    db.commit()
    for user in init_users:
        db.refresh(user)
    yield db
    db.query(User).delete()
    db.commit()

import random
TEST_TRIALS = 10

def test_get_user():
    response = client.get("api/users/")
    assert response.status_code == 200

    # Test default limit == 10
    assert len(response.json()) == 10
    for i in range(10):
        assert response.json()[i]["id"] in map(lambda x: x.id, init_users)

def test_get_user_with_limit():
    with next(get_db()) as db:
        for _ in range(TEST_TRIALS):
            limit = random.randint(1, 10)
            response = client.get(f"api/users/?limit={limit}")
            assert response.status_code == 200
            assert len(response.json()) == limit


            for i in range(limit):
                assert response.json()[i]["id"] in map(lambda x: x.id, init_users)
                assert UserSchema.model_validate(response.json()[i])
                user = db.query(User).filter(User.id == response.json()[i]["id"]).first()
                assert user is not None
                assert user.id == response.json()[i]["id"]
                assert user.username == response.json()[i]["username"]
                assert user.email == response.json()[i]["email"]

def test_get_user_with_skip():
    with next(get_db()) as db:
        for _ in range(TEST_TRIALS):
            skip = random.randint(1, 10)
            response = client.get(f"api/users/?skip={skip}")
            assert response.status_code == 200
            assert len(response.json()) == 10

            for i in range(10):
                assert response.json()[i]["id"] in map(lambda x: x.id, init_users)
                assert UserSchema.model_validate(response.json()[i])
                user = db.query(User).filter(User.id == response.json()[i]["id"]).first()
                assert user is not None
                assert user.id == response.json()[i]["id"]
                assert user.username == response.json()[i]["username"]
                assert user.email == response.json()[i]["email"]

def test_get_user_with_skip_and_limit():
    with next(get_db()) as db:
        for _ in range(TEST_TRIALS):
            skip = random.randint(1, 10)
            limit = random.randint(1, 10)
            response = client.get(f"api/users/?skip={skip}&limit={limit}")
            assert response.status_code == 200
            assert len(response.json()) == limit

            for i in range(limit):
                assert response.json()[i]["id"] in map(lambda x: x.id, init_users)
                assert UserSchema.model_validate(response.json()[i])
                user = db.query(User).filter(User.id == response.json()[i]["id"]).first()
                assert user is not None
                assert user.id == response.json()[i]["id"]
                assert user.username == response.json()[i]["username"]
                assert user.email == response.json()[i]["email"]

def test_get_user_by_id():
    for user in init_users:
        response = client.get(f"api/users/{user.id}")
        assert response.status_code == 200
        assert response.json()["id"] == user.id
        assert response.json()["username"] == user.username
        assert response.json()["email"] == user.email

def test_get_user_by_id_with_invalid_id():
    response = client.get("api/users/100000")
    assert response.status_code == 404

def test_post_user():
    with next(get_db()) as db:
        for user in add_users:
            data = UserCreate.model_validate(user)
            response = client.post("api/users/", json=data.model_dump())
            assert response.status_code == 201
            assert response.json()["username"] == user["username"]
            assert response.json()["email"] == user["email"]

            user = db.query(User).filter(User.id == response.json()["id"]).first()
            assert user is not None
            assert user.id == response.json()["id"]
            assert user.username == response.json()["username"]
            assert user.email == response.json()["email"]

def test_post_user_with_invalid_data():
    for user in add_users:
        data = UserCreate.model_validate(user)
        data.username = "a" * 100
        response = client.post("api/users/", json=data.model_dump())
        assert response.status_code == 422

        data = UserCreate.model_validate(user)
        data.email = "a" * 100
        response = client.post("api/users/", json=data.model_dump())
        assert response.status_code == 422

def test_post_user_with_duplicate_data():
    with next(get_db()) as db:
        for user in init_users:
            data = UserCreate.model_validate(user)
            response = client.post("api/users/", json=data.model_dump())
            assert response.status_code == 409

def test_update_user():
    with next(get_db()) as db:
        for user in init_users[:5]:
            data = UserSchema.model_validate(user)
            data.username = f"changed_{user.id}"
            data.email = f"change_{user.id}@test.com"
            response = client.put(f"api/users/{user.id}", json=data.model_dump())
            assert response.status_code == 200
            assert response.json()["id"] == user.id
            assert response.json()["username"] == data.username
            assert response.json()["email"] == data.email

            user = db.query(User).filter(User.id == response.json()["id"]).first()
            assert user is not None
            assert user.id == response.json()["id"]
            assert user.username == response.json()["username"]
            assert user.email == response.json()["email"]

def test_update_user_with_invalid_data():
    with next(get_db()) as db:
        for user in init_users[:5]:
            data = UserSchema.model_validate(user)
            data.username = "a" * 100
            response = client.put(f"api/users/{user.id}", json=data.model_dump())
            assert response.status_code == 422

            data = UserSchema.model_validate(user)
            data.email = "a" * 100
            response = client.put(f"api/users/{user.id}", json=data.model_dump())
            assert response.status_code == 422

def test_update_user_with_duplicate_data():
    with next(get_db()) as db:
        for user in init_users[:5]:
            data = UserSchema.model_validate(user)
            data.username = init_users[5].username
            response = client.put(f"api/users/{user.id}", json=data.model_dump())
            assert response.status_code == 409

            data = UserSchema.model_validate(user)
            data.email = init_users[5].email
            response = client.put(f"api/users/{user.id}", json=data.model_dump())
            assert response.status_code == 409

def test_delete_user():
    with next(get_db()) as db:
        for user in init_users[:5]:
            response = client.delete(f"api/users/{user.id}")
            assert response.status_code == 200

            user = db.query(User).filter(User.id == user.id).first()
            assert user is None

def test_delete_user_with_invalid_id():
    response = client.delete("api/users/100000")
    assert response.status_code == 404