# Stage 1: Build the Next.js static frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the NestJS backend
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --unsafe-perm
COPY backend/ ./
RUN npx prisma generate
RUN chmod +x node_modules/.bin/*
RUN npm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --ignore-scripts --prefix backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=frontend-builder /app/frontend/out ./backend/public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "backend/dist/main"]
