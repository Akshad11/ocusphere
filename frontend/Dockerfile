# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Stage 2: Development
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Builder
FROM deps AS builder
WORKDIR /app
COPY . .
ARG VITE_API_BASE_URL=http://localhost:3001/api/v1
ARG VITE_DATA_MODE=api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DATA_MODE=$VITE_DATA_MODE
RUN npm run build

# Stage 4: Production Web Server
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
