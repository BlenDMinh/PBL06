import datetime
from fastapi import APIRouter, Depends, HTTPException, logger
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from lib.dependencies import authenticate
from lib.data.database import get_db
from lib.data.models import User, Account
from lib.schema.auth import LoginRequest

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