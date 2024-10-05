# PBL06 - Image2Text

# Setup by Docker

### Environment

First of all, you need to make an env file `.env.docker.local` base on the example below:

```env
# MySQL Database env
MYSQL_USER=<your_mysql_user>
MYSQL_PASSWORD=<your_mysql_password>
MYSQL_DATABASE=<your_mysql_database>
MYSQL_DB_PORT=<your_mysql_port>

# Nextjs env
APP_ENV=<Development or Production>
LOCAL_API_URL=<your_local_api_url> # http://localhost:3000
DATABASE_URL=<your_database_url> # mysql://user:password@host:port/schema,
# For docker: mysql://user:password@database:port/schema,

JWT_SECRET=<your_jwt_secret>
PING_INTERVAL=<seconds> # 60 seconds
ACCESS_TOKEN_EXPI=<minutes> # 30 minutes
REFRESH_TOKEN_EXPI=<days> # 30 days
```

...and `init-user.sql`:

```SQL
-- init-user.sql

-- Grant ALL privileges to the user on all databases
GRANT ALL PRIVILEGES ON *.* TO '<username>'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### Booting up

Run everything in Docker by composing up:

```bash
docker compose up -d
```

or if you want to run Database only (for Development):

```bash
docker compose -f docker-compose.databaseonly.yml up -d
```

_Note: To interact with database, you need to configure .env file in client-app. See [Client-app setup](#installation)_

# Setup Manually

## AI Server

Updating...

## Nextjs Backend and Frontend

### Installation

You can run installation script below

#### Windows

```bash
Updating...
```

#### Linux

```bash
Updating...
```

#### ...or setup manually

```bash
cd client-app
```

Before jumping into the server setup, you need to install nextjs and ts-node manually:

```bash
pnpm install next@latest react@latest react-dom@latest
pnpm install -g ts-node
```

Once it is done, you are ready to go

First create a file named **_.env_** with the content below:

```bash
LOCAL_API_URL=<your_local_api_url> # http://localhost:3000
DATABASE_URL=<your_database_url> # mysql://user:password@host:port/database
JWT_SECRET=<your_jwt_secret>
PING_INTERVAL=<seconds> # 60 seconds
ACCESS_TOKEN_EXPI=<minutes> # 30 minutes
REFRESH_TOKEN_EXPI=<days> # 30 days
```

**Note**: Remeber to replace the <> with your configs

Next, migrate and seed the data

```bash
npx prisma migrate deploy
```

...or in development

```bash
npx prisma migrate dev
```

Just in case if seeding **failed** during migration phase, you can run the command below to manually seed data:

```bash
npx prisma db seed
```

#### Run the server with:

```bash
pnpm run start
```

...or in development

```bash
pnpm run dev
```
