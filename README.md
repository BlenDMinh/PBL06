# PBL06 - Image2Text
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

First create a file named ***.env*** with the content below:
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
