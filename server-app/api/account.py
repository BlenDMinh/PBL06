from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from lib.data.database import get_db
from lib.data.models import Account, User
from lib.schema.data import AccountCreate, AccountSchema

router = APIRouter()

@router.post("/accounts/", response_model=AccountSchema)
def create_account(account: AccountCreate, response: Response, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == account.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    # Check if account already exists
    existing_account = db.query(Account).filter(Account.user_id == account.user_id).first()
    if existing_account:
        raise HTTPException(status_code=400, detail="Account already exists for this user")
        
    db_account = Account(**account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    response.status_code = 201
    return db_account

# Update get accounts endpoint with pagination validation:
@router.get("/accounts/", response_model=list[AccountSchema])
def get_all_accounts(
    skip: int = Query(default=0, ge=0, description="Skip first N items"),
    limit: int = Query(default=10, ge=1, le=100, description="Limit the number of items"),
    db: Session = Depends(get_db)
):
    accounts = db.query(Account).offset(skip).limit(limit).all()
    return accounts

@router.get("/accounts/{account_id}", response_model=AccountSchema)
def read_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/accounts/{account_id}", response_model=AccountSchema)
def update_account(account_id: int, account: AccountCreate, db: Session = Depends(get_db)):
    # First check if account exists
    db_account = db.query(Account).filter(Account.id == account_id).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
        
    # Validate user exists
    user = db.query(User).filter(User.id == account.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Proceed with update
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
