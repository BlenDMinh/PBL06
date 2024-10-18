from fastapi import FastAPI
import api
import api.img2txt

app = FastAPI()

app.include_router(api.img2txt.router, prefix='/api')

origins = [
  'http://localhost'
]

@app.get("/")
def index():
  return {"message": "Hello World"}