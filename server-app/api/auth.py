import datetime
from fastapi import APIRouter, Depends, HTTPException, logger
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from lib.dependencies import authenticate
from lib.data.database import get_db
from lib.data.models import User, Account
from lib.schema.auth import LoginRequest, RegisterRequest

from env import config


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
    now = datetime.datetime.now(datetime.timezone.utc)
    iat = datetime.datetime.now(datetime.timezone.utc).timestamp()
    refresh_exp = (now + datetime.timedelta(days=float(config["REFRESH_TOKEN_EXPI"]))).timestamp()
    access_exp = (now + datetime.timedelta(minutes=float(config["ACCESS_TOKEN_EXPI"]))).timestamp()
    refresh_token = jwt.encode(
        {
            "sub": account.user.id,
            "iss": "api",
            "iat": iat,
            "exp": refresh_exp
        }, 
        config["JWT_SECRET"], 
        algorithm="HS256",
    )
    access_token = jwt.encode(
        {
            "sub": account.user.id,
            "iss": "api",
            "iat": iat,
            "exp": access_exp
        }, 
        config["JWT_SECRET"], 
        algorithm="HS256",
    )
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
