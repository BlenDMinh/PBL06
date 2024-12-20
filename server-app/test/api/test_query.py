from passlib.context import CryptContext
import pytest
from lib.data.database import Base
from lib.data.models import Query, User, Image, Account
from test.test import engine, client, TestingSessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def auth_headers(setup_database):
    db = TestingSessionLocal()
    
    # Clean up any existing data
    db.query(Query).delete()
    db.query(Account).delete()
    db.query(User).delete()
    db.commit()
    
    # Create test user and account
    test_user = User(email="test@example.com", username="testuser")
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Create account with hashed password
    hashed_password = pwd_context.hash("testpass123")
    test_account = Account(
        user_id=test_user.id, 
        password=hashed_password
    )
    db.add(test_account)
    db.commit()

    # Login to get token
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    response = client.post("/api/auth/login/", json=login_data)
    token = response.json()["data"]["access_token"]
    
    yield {"Authorization": f"Bearer {token}"}
    
    # Cleanup
    db.query(Query).delete()
    db.query(Account).delete()
    db.query(User).delete()
    db.commit()
    db.close()

@pytest.fixture(scope="function")
def setup_queries(auth_headers):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "test@example.com").first()
    
    test_queries = []
    for i in range(10):
        query = Query(
            user_id=user.id,
            content=f"Test query {i}",
            used_token=i * 100,
            result="PENDING"
        )
        db.add(query)
        db.commit()
        db.refresh(query)
        test_queries.append(query)
    
    yield test_queries
    
    # Cleanup
    for query in test_queries:
        db.delete(query)
    db.commit()
    db.close()

def test_get_query_with_image(setup_database, setup_queries, auth_headers):
    db = TestingSessionLocal()
    test_query = setup_queries[0]
    
    # Create and link image
    test_image = Image(image_url="http://test.jpg")
    db.add(test_image)
    db.commit()
    db.refresh(test_image)
    
    test_query = db.merge(test_query)  # Reattach to session
    test_query.image_id = test_image.id
    db.commit()
    
    response = client.get(f"/api/queries/{test_query.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["image"] is not None
    assert response.json()["image"]["image_url"] == "http://test.jpg"

def test_get_all_queries(setup_database, setup_queries, auth_headers):
    response = client.get("/api/queries/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_pagination(setup_database, setup_queries, auth_headers):
    # Test limit
    response = client.get("/api/queries/?limit=5", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == min(5, len(setup_queries))

    # Test skip
    response = client.get("/api/queries/?skip=2", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == max(0, len(setup_queries) - 2)

    # Test combined
    response = client.get("/api/queries/?skip=1&limit=2", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_create_query(setup_database, auth_headers):
    # Get user from database
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "test@example.com").first()
    
    query_data = {
        "user_id": user.id,
        "content": "Test query creation", 
        "used_token": 100,
        "result": "PENDING"
    }
    
    response = client.post("/api/queries/", 
                          json=query_data,
                          headers=auth_headers)
    
    assert response.status_code == 201
    assert response.json()["content"] == query_data["content"]
    assert response.json()["used_token"] == query_data["used_token"]
    assert response.json()["result"] == "PENDING"
    assert response.json()["user_id"] == user.id
    assert response.json()["result"] == "PENDING"

def test_get_query_by_id(setup_database, setup_queries):
    test_query = setup_queries[0]
    response = client.get(f"/api/queries/{test_query.id}")
    assert response.status_code == 200
    assert response.json()["id"] == test_query.id
    assert response.json()["content"] == test_query.content

def test_get_nonexistent_query(setup_database):
    response = client.get("/api/queries/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Query not found"

def test_update_query(setup_database, setup_queries):
    test_query = setup_queries[0]
    update_data = {
        "user_id": test_query.user_id,
        "content": "Updated query content",
        "used_token": 200,
        "result": "COMPLETED"
    }
    response = client.put(f"/api/queries/{test_query.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["content"] == update_data["content"]
    assert response.json()["result"] == update_data["result"]

def test_update_nonexistent_query(setup_database):
    update_data = {
        "user_id": 1,
        "content": "Invalid query",
        "used_token": 100,
        "result": "PENDING"
    }
    response = client.put("/api/queries/99999", json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Query not found"

def test_delete_query(setup_database, setup_queries):
    test_query = setup_queries[0]
    response = client.delete(f"/api/queries/{test_query.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == "Query deleted"
    
    # Verify deletion
    get_response = client.get(f"/api/queries/{test_query.id}")
    assert get_response.status_code == 404

def test_delete_nonexistent_query(setup_database):
    response = client.delete("/api/queries/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Query not found"
