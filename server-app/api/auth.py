import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, logger
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from lib.dependencies import authenticate
from lib.data.database import get_db
from lib.data.models import User, Account
from lib.schema.auth import LoginRequest, RegisterRequest

from env import config
from lib.util.jwt_util import make_access_token, make_refresh_token


router = APIRouter()

@router.post("/auth/login/")
def login(login_request: LoginRequest = None, user: User = Depends(authenticate), db: Session = Depends(get_db)):
    if user:
        return {
            "message": "User already logged in",
            "data": {
                "user": user
            }
        }
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

    return {
        "message": "Login successful",
        "data": {
            "user": account.user,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    }

@router.post("/auth/register/")
def register(register_request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email and password are provided
    if not register_request.email or not register_request.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Check if email is valid (basic validation)
    if "@" not in register_request.email or "." not in register_request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if password meets basic security requirements (e.g., length)
    if len(register_request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == register_request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username are provided
    if not register_request.username:
        raise HTTPException(status_code=400, detail="Username are required")
    
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
    db.refresh(new_user)
    return {
        "message": "Registration successful",
        "data": {
            "user": new_user
        }
    }

@router.get("/auth/me")
def get_me(response: Response, user: User = Depends(authenticate)):
    if user:
        return {
            "message": "User already logged in",
            "data": {
                "user": user
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