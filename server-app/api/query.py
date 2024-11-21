from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from lib.data.database import get_db
from lib.data.models import Query, User
from lib.schema.data import QueryCreate, QuerySchema
from lib.dependencies import authenticate

router = APIRouter()

@router.get("/queries/", response_model=List[QuerySchema])
def get_user_queries(skip: int = 0, limit: int = 10, user: User = Depends(authenticate), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    queries = db.query(Query).filter(Query.user_id == user.id).offset(skip).limit(limit).all()
    if not queries:
        raise HTTPException(status_code=404, detail="No queries found for this user")
    return queries

@router.post("/queries/", response_model=QuerySchema)
def create_query(query: QueryCreate, response: Response, db: Session = Depends(get_db)):
    db_query = Query(**query.model_dump())
    db.add(db_query)
    db.commit()
    db.refresh(db_query)
    # Set status code to 201
    response.status_code = 201
    return db_query

@router.get("/queries/{query_id}", response_model=QuerySchema)
def read_query(query_id: int, db: Session = Depends(get_db)):
    query = db.query(Query).filter(Query.id == query_id).first()
    if query is None:
        raise HTTPException(status_code=404, detail="Query not found")
    return query

@router.put("/queries/{query_id}", response_model=QuerySchema)
def update_query(query_id: int, query: QueryCreate, db: Session = Depends(get_db)):
    db_query = db.query(Query).filter(Query.id == query_id).first()
    if db_query is None:
        raise HTTPException(status_code=404, detail="Query not found")
    for key, value in query.model_dump().items():
        setattr(db_query, key, value)
    db.commit()
    db.refresh(db_query)
    return db_query

@router.delete("/queries/{query_id}", response_model=dict)
def delete_query(query_id: int, db: Session = Depends(get_db)):
    db_query = db.query(Query).filter(Query.id == query_id).first()
    if db_query is None:
        raise HTTPException(status_code=404, detail="Query not found")
    db.delete(db_query)
    db.commit()
    return {"detail": "Query deleted"}
