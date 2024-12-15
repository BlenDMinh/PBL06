import pytest
from lib.data.database import Base
from test.test import engine, client

@pytest.fixture(scope="module")
def setup_database():
    # Ensure that the database tables are created
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_register_user(setup_database):
    user_data = {
        "email": "new_user@test.com", 
        "username": "new_user", 
        "password": "securepassword123"
    }
    response = client.post("api/auth/register/", json=user_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Registration successful"
    assert response.json()["data"]["user"]["email"] == user_data["email"]

def test_register_user_with_missing_data(setup_database):
    user_data = {"email": "new_user@test.com", "password": "securepassword123"}
    response = client.post("/auth/register/", json=user_data)
    assert response.status_code == 404

def test_register_user_with_invalid_email(setup_database):
    user_data = {
        "email": "invalid_email", 
        "username": "new_user", 
        "password": "securepassword123"
    }
    response = client.post("api/auth/register/", json=user_data)
    assert response.status_code == 422
    assert response.json()["detail"] == "Validation error"

def test_register_user_with_duplicate_email(setup_database):
    user_data = {
        "email": "duplicate_email@test.com", 
        "username": "duplicate_email", 
        "password": "securepassword123"
    }
    response = client.post("api/auth/register/", json=user_data)
    assert response.status_code == 200
    response = client.post("api/auth/register/", json=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_user(setup_database):
    login_data = {
        "email": "new_user@test.com", 
        "password": "securepassword123"
    }
    response = client.post("api/auth/login/", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]
    assert "refresh_token" in response.json()["data"]

def test_login_with_wrong_password(setup_database):
    login_data = {
        "email": "new_user@test.com", 
        "password": "wrongpassword"
    }
    response = client.post("api/auth/login/", json=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid password"

def test_change_password_with_wrong_current_password(setup_database):
    change_password_data = {
        "current_password": "wrongpassword", 
        "new_password": "newsecurepassword123"
    }
    login_data = {
        "email": "new_user@test.com", 
        "password": "securepassword123"
    }
    login_response = client.post("api/auth/login/", json=login_data)
    access_token = login_response.json()["data"]["access_token"]
    
    response = client.post(
        "api/auth/change-password/", 
        json=change_password_data, 
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Current password is incorrect"

def test_change_password(setup_database):
    change_password_data = {
        "current_password": "securepassword123",
        "new_password": "newsecurepassword123"
    }
    login_data = {
        "email": "new_user@test.com", 
        "password": "securepassword123"
    }
    login_response = client.post("api/auth/login/", json=login_data)
    access_token = login_response.json()["data"]["access_token"]
    assert login_response.status_code == 200
    response = client.post(
        "api/auth/change-password/", 
        json=change_password_data, 
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"

def test_get_me(setup_database):
    # Step 1: Register a new user
    register_data = {
        "email": "new_user_test_me@test.com", 
        "username": "new_user", 
        "password": "securepassword123"
    }
    register_response = client.post("api/auth/register/", json=register_data)
    # assert register_response.status_code == 200
    assert register_response.json()["message"] == "Registration successful"
    new_user = register_response.json()["data"]["user"]
    
    # Step 2: Login with the new user credentials
    login_data = {
        "email": register_data["email"], 
        "password": register_data["password"]
    }
    login_response = client.post("api/auth/login/", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json()["data"]["access_token"]

    # Step 3: Get the current user data using the access token
    response = client.get(
        "api/auth/me", 
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.json() == 200
    assert response.json()["data"]["user"]["email"] == new_user["email"]
    assert response.json()["data"]["user"]["username"] == new_user["username"]
