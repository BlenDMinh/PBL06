from fastapi import Request, logger
import regex
from lib.data.models import User
import jwt
from env import config
from lib.data.database import get_db

async def authenticate(request: Request):
    bearer = request.headers.get("Authorization")
    if not bearer:
        return None
    parts = bearer.split(" ")
    if len(parts) != 2:
        return None
    scheme, token = parts
    if not regex.match(r"^Bearer$", scheme):
        return None
    if not token:
        return None
    try:
        payload = jwt.decode(token, config["JWT_SECRET"], algorithms=["HS256"])
        db = next(get_db())
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return user
    except Exception as e:
        logger.logger.error(e)
        return None
