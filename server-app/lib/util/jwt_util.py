import datetime

import jwt
from env import config

def verify_token(token):
    try:
        payload = jwt.decode(token, config["JWT_SECRET"], algorithms=["HS256"])
        return payload
    except Exception as e:
        return None

def make_refresh_token(sub):
    now = datetime.datetime.now(datetime.timezone.utc)
    iat = now.timestamp()
    refresh_exp = (now + datetime.timedelta(days=float(config["REFRESH_TOKEN_EXPI"]))).timestamp()
    refresh_token = jwt.encode(
        {
            "sub": sub,
            "iss": "api",
            "iat": iat,
            "exp": refresh_exp
        }, 
        config["JWT_SECRET"], 
        algorithm="HS256",
    )

    return refresh_token

def make_access_token(refresh_token: str):
    refresh_payload = verify_token(refresh_token)
    if not refresh_token:
        return None
    
    now = datetime.datetime.now(datetime.timezone.utc)
    iat = now.timestamp()

    access_exp = (now + datetime.timedelta(minutes=float(config["ACCESS_TOKEN_EXPI"]))).timestamp()
    
    access_token = jwt.encode(
        {
            "sub": refresh_payload["sub"],
            "iss": "api",
            "iat": iat,
            "exp": access_exp
        }, 
        config["JWT_SECRET"], 
        algorithm="HS256",
    )

    return access_token