from fastapi import APIRouter, UploadFile

router = APIRouter()

@router.get("/img2txt")
def get_text_from_image(image: UploadFile):
  print(image.filename)
  print(image.size)
  return {
    "message": "success",
    "content": "A null image"
  }