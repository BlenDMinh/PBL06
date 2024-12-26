from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from lib.data.database import get_db
from lib.data.models import Plan
from lib.schema.data import PlanCreate, PlanSchema


router = APIRouter()

@router.get("/plans/", response_model=list[PlanSchema])
def get_all_plans(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    plans = db.query(Plan).offset(skip).limit(limit).all()
    return plans

@router.post("/plans/", response_model=PlanSchema)
def create_plan(plan: PlanCreate, response: Response, db: Session = Depends(get_db)):
    db_plan = Plan(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    # Set status code to 201
    response.status_code = 201
    return db_plan

@router.get("/plans/{plan_id}", response_model=PlanSchema)
def read_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.put("/plans/{plan_id}", response_model=PlanSchema)
def update_plan(plan_id: int, plan: PlanCreate, db: Session = Depends(get_db)):
    db_plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    for key, value in plan.model_dump().items():
        setattr(db_plan, key, value)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/plans/{plan_id}", response_model=dict)
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if db_plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(db_plan)
    db.commit()
    return {"detail": "Plan deleted"}