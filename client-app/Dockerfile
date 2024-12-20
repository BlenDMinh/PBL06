FROM node:20-alpine3.20 AS base

# Install the necessary dependencies
# RUN apk update
RUN apk add --no-cache libc6-compat
# RUN apk add --no-cache python3 make g++ gcc
COPY package.json ./pnpm-lock.yaml* /app/
RUN apk add dos2unix

WORKDIR /app
# Install dependencies

COPY . .

RUN corepack enable pnpm && pnpm i --frozen-lockfile
RUN pnpm install ts-node

# Copy the rest of the application files
# COPY ./client-app/. /app/
# COPY ../.env.docker.local /app/.env

# Apply and seeding database
# RUN npx prisma generate

# Build the application
RUN pnpm build

# Expose the application port
EXPOSE 3000

# Start the application
RUN dos2unix /app/run.sh
RUN chmod +x /app/run.sh
# CMD [ "ls", "/app" ]
ENTRYPOINT [ "/app/run.sh" ]