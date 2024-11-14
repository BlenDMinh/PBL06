from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from lib.data.database import get_db
from lib.data.models import Account
from lib.schema.data import AccountCreate, AccountSchema

router = APIRouter()

@router.get("/accounts/", response_model=list[AccountSchema])
def get_all_accounts(skip: int = Query(0), limit: int = Query(10), db: Session = Depends(get_db)):
    accounts = db.query(Account).offset(skip).limit(limit).all()
    return accounts

@router.post("/accounts/", response_model=AccountSchema)
def create_account(account: AccountCreate, response: Response, db: Session = Depends(get_db)):
    db_account = Account(**account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    # Set status code to 201
    response.status_code = 201
    return db_account

@router.get("/accounts/{account_id}", response_model=AccountSchema)
def read_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/accounts/{account_id}", response_model=AccountSchema)
def update_account(account_id: int, account: AccountCreate, db: Session = Depends(get_db)):
    db_account = db.query(Account).filter(Account.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    for key, value in account.model_dump().items():
        setattr(db_account, key, value)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.delete("/accounts/{account_id}", response_model=dict)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    db_account = db.query(Account).filter(Account.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(db_account)
    db.commit()
    return {"detail": "Account deleted"}