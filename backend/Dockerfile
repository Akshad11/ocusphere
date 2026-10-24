FROM node:20-alpine AS base

# Install required dependencies for Prisma and native node-gyp builds (argon2)
RUN apk add --no-cache libc6-compat openssl python3 make g++

WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
COPY package.json ./
RUN npm install

# Stage 2: Development
FROM base AS dev
RUN apk add --no-cache wget
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Stage 3: Builder
FROM base AS builder
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Stage 4: Production Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl wget

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3001/api/v1/health || exit 1

CMD ["node", "dist/main"]
