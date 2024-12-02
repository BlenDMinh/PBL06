from typing import Optional
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
