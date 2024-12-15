from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
