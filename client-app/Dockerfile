FROM node:20-alpine3.20 AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./pnpm-lock.yaml* ./

# Install dependencies
RUN corepack enable pnpm && pnpm i --frozen-lockfile
RUN pnpm install ts-node

# Copy the rest of the application files
COPY . .

# Apply and seeding database
RUN npx prisma generate

# Build the application
RUN pnpm build

# Expose the application port
EXPOSE 3000

# Start the application
RUN chmod +x /app/run.sh
# CMD [ "ls", "/app" ]
ENTRYPOINT [ "/app/run.sh" ]