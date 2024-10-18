from fastapi import FastAPI
import routers
import routers.img2txt

app = FastAPI()

app.include_router(routers.img2txt.router, prefix='/api')

@app.get("/")
def index():
  return {"message": "Hello World"}