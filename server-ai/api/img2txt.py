from datetime import datetime
import logging
import sys
from fastapi import APIRouter, BackgroundTasks, Depends, Response, UploadFile
from lib import git
from io import BytesIO
from PIL import Image
from sqlalchemy.orm import Session
from lib.data.database import get_db
from lib.data.models import Query, User
from lib.dependencies import authenticate
from lib.service.image_service import ImageService, get_image_service

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
    query.result = "ERROR_IMG2TXT_PROCESS"
    db.commit()

@router.get("/img2txt")
async def get_text_from_image(
  upload_image: UploadFile, 
  background_tasks: BackgroundTasks, 
  response: Response,
  db: Session = Depends(get_db),
  user: User = Depends(authenticate),
  image_service: ImageService = Depends(get_image_service)
):
  if not user:
    response.status_code = 403
    return {
      "message": "User not authenticated",
      "error": "Unauthorized"
    }
  if not upload_image.content_type.startswith("image/") or upload_image.size <= 0:
    response.status_code = 400
    return {
      "message": "Invalid image",
      "error": "Bad Request"
    }
  contents = await upload_image.read()

  image_bytes = BytesIO(contents)
  image_pil = Image.open(image_bytes)
  
  image = image_service.upload(contents)

  query = Query(
    user_id=user.id,
    image_id=image.id,
    result="PENDING",
    content=None,
    used_token=0,
    created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
  )

  db.add(query)
  db.commit()
  db.refresh(query)

  background_tasks.add_task(create_img2txt_task, image_pil, query.id, db)

  return {
    "message": "Success",
    "data": {
      "query": query
    }
  }