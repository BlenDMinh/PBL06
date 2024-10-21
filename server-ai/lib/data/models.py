from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from lib.data.database import Base

class Account(Base):
    __tablename__ = 'Account'

    id = Column(Integer, primary_key=True, autoincrement=True)
    password = Column(String(191), nullable=False)
    user_id = Column(Integer, ForeignKey('User.id'), unique=True)
    user = relationship("User", back_populates="account")


class User(Base):
    __tablename__ = 'User'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(191), unique=True, nullable=False)
    username = Column(String(191), nullable=True)
    avatar_id = Column(Integer, ForeignKey('Image.id'), nullable=True)
    avatar = relationship("Image", back_populates="users")
    queries = relationship("Query", back_populates="user")
    account = relationship("Account", back_populates="user", uselist=False)
    subscription = relationship("Subscription", back_populates="user", uselist=False)


class Image(Base):
    __tablename__ = 'Image'

    id = Column(Integer, primary_key=True, autoincrement=True)
    image_url = Column(String(191), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    users = relationship("User", back_populates="avatar")
    queries = relationship("Query", back_populates="image")

class Query(Base):
    __tablename__ = 'Query'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('User.id'))
    user = relationship("User", back_populates="queries")
    image_id = Column(Integer, ForeignKey('Image.id'))
    image = relationship("Image", back_populates="queries")
    result = Column(String(191), default='PENDING')
    content = Column(String(191), nullable=True)
    used_token = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Subscription(Base):
    __tablename__ = 'Subscription'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('User.id'), unique=True)
    user = relationship("User", back_populates="subscription")
    plan_id = Column(Integer, ForeignKey('Plan.id'))
    plan = relationship("Plan", back_populates="subscriptions")
    created_at = Column(DateTime, server_default=func.now())


class Plan(Base):
    __tablename__ = 'Plan'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(191), nullable=False)
    monthy_token = Column(Integer, nullable=False)
    daily_token = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    subscriptions = relationship("Subscription", back_populates="plan")