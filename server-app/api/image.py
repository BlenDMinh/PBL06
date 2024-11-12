import logging
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from lib.data.database import get_db
from lib.data.models import Image
from lib.schema.data import ImageCreate, ImageSchema
from lib.service.cloudinary_service import CloudinaryService, get_cloudinary_service


router = APIRouter()
log = logging.Logger(__name__)

@router.get("/images/", response_model=list[ImageSchema])
def get_all_images(skip: int = Query(0), limit: int = Query(10), db: Session = Depends(get_db)):
    images = db.query(Image).offset(skip).limit(limit).all()
    return images

async def create_image_upload_task(
        image_bytes: bytes, 
        image_id: int,
        cloudinary_service: CloudinaryService,
        db: Session
    ):
    image = db.query(Image).filter(Image.id == image_id).first()
    log.info("Uploading image to cloudinary")
    url = cloudinary_service.upload(image_bytes)
    log.info(f"Image uploaded to {url}")
    image.image_url = url
    db.commit()
    db.refresh(image)

@router.post("/images/upload", response_model=ImageSchema)
async def upload_image(
    image: UploadFile, 
    background_tasks: BackgroundTasks,
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service), 
    db: Session = Depends(get_db),
):
    image_bytes = await image.read()
    image = Image(
        image_url="Upload in progress...",
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    log.info(f"Image {image.id} uploaded to database")
    background_tasks.add_task(create_image_upload_task, image_bytes, image.id, cloudinary_service, db)
    return image

@router.post("/images/", response_model=ImageSchema)
def create_image(image: ImageCreate, db: Session = Depends(get_db)):
    db_image = Image(**image.model_dump())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.get("/images/{image_id}", response_model=ImageSchema)
def read_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(Image).filter(Image.id == image_id).first()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@router.put("/images/{image_id}", response_model=ImageSchema)
def update_image(image_id: int, image: ImageCreate, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == image_id).first()
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    for key, value in image.model_dump().items():
        setattr(db_image, key, value)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/images/{image_id}", response_model=dict)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == image_id).first()
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(db_image)
    db.commit()
    return {"detail": "Image deleted"}