import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import api
import api.account
import api.image
import api.plan
import api.query
import api.subscription
import api.user
import api.auth
from lib.data.database import create_db_and_tables
from fastapi_pagination import add_pagination

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Database
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
add_pagination(app)
log = logging.Logger("AIServer")


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
  return JSONResponse(
    status_code=422,
    content={"detail": "Validation error", "errors": exc.errors()}
  )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
  return JSONResponse(
    status_code=exc.status_code,
    content={"detail": exc.detail}
  )

# Middlewares
async def log_request_middleware(request: Request, call_next):
    request_start_time = time.monotonic()
    response = await call_next(request)
    request_duration = time.monotonic() - request_start_time
    log_data = {
        "method": request.method,
        "path": request.url.path,
        "duration": request_duration
    }
    log.info(log_data)
    return response

origins = [
    "*",
]

# Register Middlewares
app.middleware("http")(log_request_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(api.plan.router, prefix='/api')
app.include_router(api.subscription.router, prefix='/api')
app.include_router(api.user.router, prefix='/api')
app.include_router(api.account.router, prefix='/api')
app.include_router(api.image.router, prefix='/api')
app.include_router(api.query.router, prefix='/api')
app.include_router(api.auth.router, prefix='/api')

origins = [
  'http://localhost'
]

@app.get("/")
def index():
  return {"message": "Hello World"}