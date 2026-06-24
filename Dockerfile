# Stage 1: Build the NestJS backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --prefix backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/public ./backend/public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "backend/dist/main"]
