from datetime import datetime
import logging
import sys
from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile
from lib import git
from io import BytesIO
from PIL import Image
from sqlalchemy.orm import Session
from lib.data.database import get_db
from lib.data.models import Query

router = APIRouter()
logger = logging.getLogger(__name__)

async def create_img2txt_task(image: Image, query_id: int, db: Session):
  logger.debug("Starting processing image to text. Query ID: %s", query_id)
  content = git.git_inferer.infer_pil(image)

  try:
    query = db.query(Query).filter(Query.id == query_id).first()
    query.content = content
    query.result = "SUCCESS"
    
    db.commit()
    db.refresh(query)
    logger.debug("Task completed. Query ID: %s", query_id)
  except Exception as e:
    logger.error("Error while processing image to text. Query ID: %s", query_id)
    logger.error(e)
    query.result = "ERROR"
    db.commit()

@router.get("/img2txt")
async def get_text_from_image(image: UploadFile, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
  contents = await image.read()
  image = BytesIO(contents)
  image = Image.open(image)
  query = Query(
    user_id=1,
    image_id=1,
    result="PENDING",
    content=None,
    used_token=0,
    created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
  )

  db.add(query)
  db.commit()
  db.refresh(query)

  background_tasks.add_task(create_img2txt_task, image, query.id, db)

  return {
    "message": "success",
    "query": query
  }