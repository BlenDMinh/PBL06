
import pytest
from lib.data.database import Base
from lib.data.models import Subscription, User, Plan
from test.test import engine, client, TestingSessionLocal

TEST_TRIALS = 10

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def setup_subscriptions():
    db = TestingSessionLocal()
    # Create test users and plans first
    test_users = [
        User(email=f"test_user_{i}@test.com", username=f"test_user_{i}")
        for i in range(TEST_TRIALS)
    ]
    db.add_all(test_users)
    
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
    
    # Create test subscriptions
    test_subscriptions = [
        Subscription(user_id=user.id, plan_id=plan.id)
        for user, plan in zip(test_users, test_plans)
    ]
    db.add_all(test_subscriptions)
    db.commit()
    
    for subscription in test_subscriptions:
        db.refresh(subscription)
    yield test_subscriptions
    
    db.query(Subscription).delete()
    db.query(Plan).delete()
    db.query(User).delete()
    db.commit()
    db.close()

def test_get_all_subscriptions(setup_database, setup_subscriptions):
    response = client.get("/api/subscriptions/")
    assert response.status_code == 200
    assert len(response.json()) == min(10, TEST_TRIALS)

def test_get_subscription_by_id(setup_database, setup_subscriptions):
    test_subscription = setup_subscriptions[0]
    response = client.get(f"/api/subscriptions/{test_subscription.id}")
    assert response.status_code == 200
    assert response.json()["id"] == test_subscription.id
    assert response.json()["user_id"] == test_subscription.user_id
    assert response.json()["plan_id"] == test_subscription.plan_id

def test_get_nonexistent_subscription(setup_database):
    response = client.get("/api/subscriptions/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Subscription not found"

def test_update_subscription(setup_database, setup_subscriptions):
    test_subscription = setup_subscriptions[0]
    # Create a new plan for update
    db = TestingSessionLocal()
    new_plan = Plan(name="New Plan", monthy_token=5000, daily_token=500, price=99.99)
    db.add(new_plan)
    db.commit()
    
    update_data = {
        "user_id": test_subscription.user_id,
        "plan_id": new_plan.id
    }
    response = client.put(f"/api/subscriptions/{test_subscription.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["plan_id"] == new_plan.id

def test_update_nonexistent_subscription(setup_database):
    update_data = {
        "user_id": 1,
        "plan_id": 1
    }
    response = client.put("/api/subscriptions/99999", json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Subscription not found"

def test_delete_subscription(setup_database, setup_subscriptions):
    test_subscription = setup_subscriptions[0]
    response = client.delete(f"/api/subscriptions/{test_subscription.id}")
    assert response.status_code == 200
    assert response.json()["detail"] == "Subscription deleted"
    
    # Verify deletion
    get_response = client.get(f"/api/subscriptions/{test_subscription.id}")
    assert get_response.status_code == 404

def test_delete_nonexistent_subscription(setup_database):
    response = client.delete("/api/subscriptions/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Subscription not found"

def test_pagination(setup_database, setup_subscriptions):
    # Test limit
    response = client.get("/api/subscriptions/?limit=5")
    assert response.status_code == 200
    assert len(response.json()) == 5

    # Test skip
    response = client.get("/api/subscriptions/?skip=5")
    assert response.status_code == 200
    assert len(response.json()) == min(5, TEST_TRIALS)

    # Test skip and limit together
    response = client.get("/api/subscriptions/?skip=2&limit=3")
    assert response.status_code == 200
    assert len(response.json()) == 3
