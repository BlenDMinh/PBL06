import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from lib.util.auth import authenticate
from lib.data.database import get_db
from lib.data.models import User, Account, Subscription
from lib.schema.data import SubscriptionCreate
from lib.schema.auth import LoginRequest, RegisterRequest, ChangePasswordRequest
from lib.util.jwt_util import make_access_token, make_refresh_token

router = APIRouter()

@router.post("/auth/login/")
def login(login_request: LoginRequest = None, db: Session = Depends(get_db)):
    if not login_request or not login_request.email or not login_request.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    account = db.query(Account).join(User).filter(User.email == login_request.email).first()
    if not account:
        raise HTTPException(status_code=404, detail="User not found")
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    if not pwd_context.verify(login_request.password, account.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    refresh_token = make_refresh_token(account.user.id)
    access_token = make_access_token(refresh_token)

    subscription = db.query(Subscription).filter(Subscription.user_id == account.user.id).first()
    return {
        "message": "Login successful",
        "data": {
            "user": account.user,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "subscription": subscription
        }
    }

@router.post("/auth/register/")
def register(register_request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email and password are provided
    if not register_request.email or not register_request.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Check if password meets basic security requirements (e.g., length)
    if len(register_request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == register_request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username is provided
    if not register_request.username:
        raise HTTPException(status_code=400, detail="Username is required")
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(register_request.password)
    
    new_user = User(email=register_request.email, username=register_request.username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    new_account = Account(user_id=new_user.id, password=hashed_password)
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    
    # Subscribe the user to the plan with ID 0
    subscription = SubscriptionCreate(user_id=new_user.id, plan_id=0)
    db_subscription = Subscription(**subscription.model_dump())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    db.refresh(new_user)
    return {
        "message": "Registration successful",
        "data": {
            "user": new_user,
            "subscription": db_subscription
        }
    }

@router.get("/auth/me")
def get_me(response: Response, user: User = Depends(authenticate), db: Session = Depends(get_db)):
    if user:
        subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        return {
            "message": "User already logged in",
            "data": {
                "user": user,
                "subscription": subscription
            }
        }
    response.status_code = 403
    return {
        "error": "Unauthorized",
        "message": "Access token is invalid"
    }

@router.post("/auth/refresh")
def refresh_access_token(response: Response, refresh_token: str):
    access_token = make_access_token(refresh_token)
    if not access_token:
        response.status_code = 400
        return {
            "error": "Bad request",
            "message": "Refresh token is invalid"
        }
    return {
        "message": "Successfully refresh access token",
        "data": {
            "access_token": access_token
        }
    }

@router.post("/auth/change-password/")
def change_password(change_password_request: ChangePasswordRequest, user: User = Depends(authenticate), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    account = db.query(Account).filter(Account.user_id == user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    if not pwd_context.verify(change_password_request.current_password, account.password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(change_password_request.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")

    if change_password_request.current_password == change_password_request.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    hashed_new_password = pwd_context.hash(change_password_request.new_password)
    account.password = hashed_new_password
    db.commit()
    db.refresh(account)

    return {
        "message": "Password changed successfully"
    }
