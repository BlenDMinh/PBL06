import pytest
from lib.data.database import Base
from lib.data.models import Plan
from test.test import engine, client, TestingSessionLocal

TEST_TRIALS = 10

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def setup_plans():
    db = TestingSessionLocal()
    test_plans = [
        Plan(
            name=f"Test Plan {i}",
            monthy_token=i * 1000,
            daily_token=i * 100,
            price=float(i * 10)
        )
        for i in range(TEST_TRIALS)
    ]
    db.add_all(test_plans)
    db.commit()
    for plan in test_plans:
        db.refresh(plan)
    yield test_plans
    db.query(Plan).delete()
    db.commit()
    db.close()

def test_create_plan(setup_database):
    plan_data = {
        "name": "New Plan",
        "monthy_token": 5000,
        "daily_token": 500,
        "price": 99.99
    }
    response = client.post("/api/plans/", json=plan_data)
    assert response.status_code == 201
    assert response.json()["name"] == plan_data["name"]
    assert response.json()["monthy_token"] == plan_data["monthy_token"]
    assert response.json()["daily_token"] == plan_data["daily_token"]
    assert float(response.json()["price"]) == plan_data["price"]

def test_get_all_plans(setup_database, setup_plans):
    response = client.get("/api/plans/")
    assert response.status_code == 200
    assert len(response.json()) == min(10, TEST_TRIALS)

def test_get_plan_by_id(setup_database, setup_plans):
    test_plan = setup_plans[0]
    response = client.get(f"/api/plans/{test_plan.id}")
    assert response.status_code == 200
    assert response.json()["id"] == test_plan.id
    assert response.json()["name"] == test_plan.name

def test_get_nonexistent_plan(setup_database):
    response = client.get("/api/plans/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Plan not found"

def test_update_plan(setup_database, setup_plans):
    test_plan = setup_plans[0]
    update_data = {
        "name": "Updated Plan",
        "monthy_token": 7000,
        "daily_token": 700,
        "price": 149.99
    }
    response = client.put(f"/api/plans/{test_plan.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    assert response.json()["monthy_token"] == update_data["monthy_token"]
    assert float(response.json()["price"]) == update_data["price"]

def test_update_nonexistent_plan(setup_database):
    update_data = {
        "name": "Invalid Plan",
        "monthy_token": 1000,
        "daily_token": 100,
        "price": 49.99
    }
    response = client.put("/api/plans/99999", json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Plan not found"

def test_delete_plan(setup_database, setup_plans):
    test_plan = setup_plans[0]
    response = client.delete(f"/api/plans/{test_plan.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == "Plan deleted"
    
    # Verify deletion
    get_response = client.get(f"/api/plans/{test_plan.id}")
    assert get_response.status_code == 404

def test_delete_nonexistent_plan(setup_database):
    response = client.delete("/api/plans/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Plan not found"

def test_pagination(setup_database, setup_plans):
    # Test limit
    response = client.get("/api/plans/?limit=5")
    assert response.status_code == 200
    assert len(response.json()) == 5

    # Test skip
    response = client.get("/api/plans/?skip=5")
    assert response.status_code == 200
    assert len(response.json()) == min(5, TEST_TRIALS)

    # Test skip and limit together
    response = client.get("/api/plans/?skip=2&limit=3")
    assert response.status_code == 200
    assert len(response.json()) == 3
