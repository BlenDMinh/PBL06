### PBL06 - Image2Text

# FOR DEVELOPMENT
Create an .env file in `./`, `./client-app/`, `./server-app/` and `./server-ai/`:
```env
# Host config
MYSQL_DB_HOST=localhost
MYSQL_DB_PORT=3306
SERVER_APP_HOST=localhost
SERVER_APP_PORT=8000
SERVER_AI_HOST=localhost
SERVER_AI_PORT=8080

APP_ENV=Development

# MySQL Database env
MYSQL_USER=<username>
MYSQL_PASSWORD=<password>
MYSQL_DATABASE=<database>
DATABASE_URL=mysql+pymysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_DB_HOST}:${MYSQL_DB_PORT}/${MYSQL_DATABASE}

# Nextjs env
LOCAL_API_URL=http://localhost:3000/api
JWT_SECRET=<secret>
PING_INTERVAL=60 # 60 seconds
ACCESS_TOKEN_EXPI=30m # 30 minutes
REFRESH_TOKEN_EXPI=30d # 30 days

# FastAPI AI env
GIT_MODEL_NAME=GIT_LARGE_R_COCO
GIT_MODEL_PATH=output/${GIT_MODEL_NAME}/snapshot/model.pt
GIT_PARAM_PATH=./lib/git/aux_data/models/${GIT_MODEL_NAME}/parameter.yaml
SERVER_AI_DATABASE_ECHO=0
```
Compose up ONLY Database in Docker:
```
docker compose up database -d
```

## For FastAPI Development

### Run FastAPI server
For AI Server, run at port 8080
```
uvicorn main:app --host 0.0.0.0 --port 8080 --reload --log-config logging.config.yml --use-colors
```
For App Server, run at port 8000
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-config logging.config.yml --use-colors
```

## For NextJS Development

Run NextJS client
```
pnpm run dev
```

## Database Migration
*For now all database migration is on NextJS, this will be moved to FastAPI later*

Migrate database
```
npx prisma migrate deploy
```

Seeding database
```
npx prisma db seed
```
