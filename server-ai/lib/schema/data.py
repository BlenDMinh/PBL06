from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class AccountBase(BaseModel):
    password: str
    user_id: int


class AccountCreate(AccountBase):
    pass


class AccountSchema(AccountBase):
    id: int

    class Config:
        from_attributes = True


class ImageBase(BaseModel):
    image_url: str


class ImageCreate(ImageBase):
    pass


class ImageSchema(ImageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class QueryBase(BaseModel):
    user_id: int
    image_id: int
    result: str = "PENDING"
    content: Optional[str]
    used_token: int


class QueryCreate(QueryBase):
    pass


class QuerySchema(QueryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionSchema(SubscriptionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PlanBase(BaseModel):
    name: str
    monthy_token: int
    daily_token: int
    price: float


class PlanCreate(PlanBase):
    pass


class PlanSchema(PlanBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: str
    username: Optional[str]


class UserCreate(UserBase):
    pass


class UserSchema(UserBase):
    id: int
    avatar_id: Optional[int]
    queries: List[QuerySchema] = []
    account: Optional[AccountSchema]
    subscription: Optional[SubscriptionSchema]

    class Config:
        from_attributes = True
