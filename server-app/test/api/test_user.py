import pytest
from lib.data.database import Base
from lib.data.models import User
import random
from test.test import TestingSessionLocal, engine, client

TEST_TRIALS = 10

@pytest.fixture(scope="module")
def setup_database():
    # Ensure that the database tables are created
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def setup_users():
    db = TestingSessionLocal()
    init_users = [
        User(email=f"test_user_{i}@test.com", username=f"test_user_{i}")
        for i in range(TEST_TRIALS)
    ]
    db.add_all(init_users)
    db.commit()
    for user in init_users:
        db.refresh(user)
    yield init_users
    db.query(User).delete()
    db.commit()
    db.close()

def test_get_user(setup_database, setup_users):
    response = client.get("/api/users/")
    assert response.status_code == 200

    # Test default limit == TEST_TRIALS
    assert len(response.json()) == TEST_TRIALS
    for i in range(TEST_TRIALS):
        assert response.json()[i]["id"] in map(lambda x: x.id, setup_users)

def test_get_user_with_limit(setup_database, setup_users):
    for _ in range(TEST_TRIALS):
        limit = random.randint(1, TEST_TRIALS)
        response = client.get(f"/api/users/?limit={limit}")
        assert response.status_code == 200
        assert len(response.json()) == limit

def test_get_user_with_skip(setup_database, setup_users):
    for _ in range(TEST_TRIALS):
        skip = random.randint(0, 9)
        response = client.get(f"/api/users/?skip={skip}")
        assert response.status_code == 200
        assert len(response.json()) == TEST_TRIALS - skip

def test_get_user_with_skip_and_limit(setup_database, setup_users):
    for _ in range(TEST_TRIALS):
        skip = random.randint(0, 9)
        limit = random.randint(1, TEST_TRIALS - skip)
        response = client.get(f"/api/users/?skip={skip}&limit={limit}")
        assert response.status_code == 200
        assert len(response.json()) == limit

def test_get_user_by_id(setup_database, setup_users):
    for user in setup_users:
        response = client.get(f"/api/users/{user.id}")
        assert response.status_code == 200
        assert response.json()["id"] == user.id

def test_post_user(setup_database):
    user_data = {"email": "new_user@test.com", "username": "new_user"}
    response = client.post("/api/users/", json=user_data)
    assert response.status_code == 201
    assert response.json()["email"] == user_data["email"]
    assert response.json()["username"] == user_data["username"]

def test_post_user_with_invalid_data(setup_database):
    user_data = {"email": "invalid_email", "username": "new_user"}
    response = client.post("/api/users/", json=user_data)
    assert response.status_code == 422

def test_post_user_with_duplicate_data(setup_database, setup_users):
    user_data = {"email": setup_users[0].email, "username": "duplicate_user"}
    response = client.post("/api/users/", json=user_data)
    assert response.status_code == 400

def test_update_user(setup_database, setup_users):
    user = setup_users[0]
    update_data = {"email": "updated_user@test.com", "username": "updated_user"}
    response = client.put(f"/api/users/{user.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["email"] == update_data["email"]
    assert response.json()["username"] == update_data["username"]

def test_update_user_with_invalid_data(setup_database, setup_users):
    user = setup_users[0]
    update_data = {"email": "invalid_email", "username": "updated_user"}
    response = client.put(f"/api/users/{user.id}", json=update_data)
    assert response.status_code == 422

def test_update_user_with_duplicate_data(setup_database, setup_users):
    user = setup_users[0]
    duplicate_user = setup_users[1]
    update_data = {"email": duplicate_user.email, "username": "duplicate_user"}
    response = client.put(f"/api/users/{user.id}", json=update_data)
    assert response.status_code == 400

def test_delete_user(setup_database, setup_users):
    user = setup_users[0]
    response = client.delete(f"/api/users/{user.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == "User deleted"
    response = client.get(f"/api/users/{user.id}")
    assert response.status_code == 404
