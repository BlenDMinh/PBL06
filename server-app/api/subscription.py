from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from lib.data.database import get_db
from lib.data.models import Subscription
from lib.schema.data import SubscriptionCreate, SubscriptionSchema

router = APIRouter()

@router.get("/subscriptions/", response_model=list[SubscriptionSchema])
def get_all_subscriptions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    subscriptions = db.query(Subscription).offset(skip).limit(limit).all()
    return subscriptions

@router.post("/subscriptions/", response_model=SubscriptionSchema)
def create_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db)):
    db_subscription = Subscription(**subscription.model_dump())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionSchema)
def read_subscription(subscription_id: int, db: Session = Depends(get_db)):
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription

@router.put("/subscriptions/{subscription_id}", response_model=SubscriptionSchema)
def update_subscription(subscription_id: int, subscription: SubscriptionCreate, db: Session = Depends(get_db)):
    db_subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if db_subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    for key, value in subscription.model_dump().items():
        setattr(db_subscription, key, value)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

@router.delete("/subscriptions/{subscription_id}", response_model=dict)
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    db_subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if db_subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(db_subscription)
    db.commit()
    return {"detail": "Subscription deleted"}