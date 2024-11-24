import logging
from fastapi import Depends, HTTPException, Request, logger, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
import regex
from lib.data.models import User
import jwt
from jwt import InvalidTokenError
from env import config
from lib.data.database import get_db

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, token: str) -> bool:
        isTokenValid: bool = False

        try:
            payload = jwt.decode(token, config["JWT_SECRET"], algorithms=["HS256"])
        except:
            payload = None
        if payload:
            isTokenValid = True

        return isTokenValid

jwt_scheme = JWTBearer()

async def authenticate(token: str = Depends(jwt_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config["JWT_SECRET"], algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    db = next(get_db())
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user
    