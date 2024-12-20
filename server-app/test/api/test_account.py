import pytest
from lib.data.database import Base
from lib.data.models import Account, User
from test.test import engine, client, TestingSessionLocal

TEST_TRIALS = 10

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def setup_accounts():
    db = TestingSessionLocal()
    # Create test users first
    test_users = [
        User(email=f"test_user_{i}@test.com", username=f"test_user_{i}")
        for i in range(TEST_TRIALS)
    ]
    db.add_all(test_users)
    db.commit()
    
    # Create test accounts
    test_accounts = [
        Account(user_id=user.id, password=f"password_{i}")
        for i, user in enumerate(test_users)
    ]
    db.add_all(test_accounts)
    db.commit()
    
    for account in test_accounts:
        db.refresh(account)
    yield test_accounts
    
    db.query(Account).delete()
    db.query(User).delete()
    db.commit()
    db.close()

def test_get_all_accounts(setup_database, setup_accounts):
    response = client.get("/api/accounts/")
    assert response.status_code == 200
    assert len(response.json()) == TEST_TRIALS

def test_get_accounts_with_pagination(setup_database, setup_accounts):
    # Test different limit values
    for limit in [1, 5, TEST_TRIALS]:
        response = client.get(f"/api/accounts/?limit={limit}")
        assert response.status_code == 200
        assert len(response.json()) == limit

    # Test skip
    response = client.get(f"/api/accounts/?skip=5")
    assert response.status_code == 200
    assert len(response.json()) == TEST_TRIALS - 5

    # Test combined skip and limit
    response = client.get(f"/api/accounts/?skip=2&limit=3")
    assert response.status_code == 200
    assert len(response.json()) == 3

def test_create_account(setup_database):
    # Create test user first
    user_data = {
        "email": "new_user@test.com",
        "username": "new_user"
    }
    user_response = client.post("/api/users/", json=user_data)
    assert user_response.status_code == 201
    user_id = user_response.json()["id"]
    
    # Create account
    account_data = {
        "user_id": user_id,
        "password": "test_password"
    }
    response = client.post("/api/accounts/", json=account_data)
    assert response.status_code == 201
    assert response.json()["user_id"] == user_id

def test_create_account_invalid_user(setup_database):
    account_data = {
        "user_id": 99999,  # Non-existent user
        "password": "test_password"
    }
    response = client.post("/api/accounts/", json=account_data)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_create_duplicate_account(setup_database, setup_accounts):
    existing_account = setup_accounts[0]
    account_data = {
        "user_id": existing_account.user_id,
        "password": "test_password"
    }
    response = client.post("/api/accounts/", json=account_data)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_get_accounts_invalid_pagination(setup_database):
    # Test negative skip
    response = client.get("/api/accounts/?skip=-1")
    assert response.status_code == 422

    # Test negative limit
    response = client.get("/api/accounts/?limit=-1")
    assert response.status_code == 422

    # Test zero limit
    response = client.get("/api/accounts/?limit=0")
    assert response.status_code == 422

def test_read_account(setup_database, setup_accounts):
    test_account = setup_accounts[0]
    response = client.get(f"/api/accounts/{test_account.id}")
    assert response.status_code == 200
    assert response.json()["id"] == test_account.id
    assert response.json()["user_id"] == test_account.user_id

def test_read_nonexistent_account(setup_database):
    response = client.get("/api/accounts/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Account not found"

def test_update_account(setup_database, setup_accounts):
    test_account = setup_accounts[0]
    update_data = {
        "user_id": test_account.user_id,
        "password": "new_password"
    }
    response = client.put(f"/api/accounts/{test_account.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["id"] == test_account.id
    assert response.json()["user_id"] == update_data["user_id"]
    
    # Verify in database
    db = TestingSessionLocal()
    updated_account = db.query(Account).filter(Account.id == test_account.id).first()
    assert updated_account.password == update_data["password"]

def test_update_nonexistent_account(setup_database):
    update_data = {
        "user_id": 1,
        "password": "new_password"
    }
    response = client.put("/api/accounts/99999", json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Account not found"

def test_update_account_invalid_user(setup_database, setup_accounts):
    test_account = setup_accounts[0]
    update_data = {
        "user_id": 99999,  # Non-existent user
        "password": "new_password"
    }
    response = client.put(f"/api/accounts/{test_account.id}", json=update_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "User not found"

def test_delete_account(setup_database, setup_accounts):
    test_account = setup_accounts[0]
    response = client.delete(f"/api/accounts/{test_account.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == "Account deleted"
    
    # Verify deletion
    db = TestingSessionLocal()
    deleted_account = db.query(Account).filter(Account.id == test_account.id).first()
    assert deleted_account is None

def test_delete_nonexistent_account(setup_database):
    response = client.delete("/api/accounts/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Account not found"
