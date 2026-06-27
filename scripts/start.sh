#!/bin/bash
set -e
echo "Stopping existing container if any..."
docker stop pm-container >/dev/null 2>&1 || true
docker rm pm-container >/dev/null 2>&1 || true
echo "Building docker image pm-app..."
docker build -t pm-app .
echo "Starting docker container on port 3000..."
docker run -d -p 3000:3000 --env-file .env -e DATABASE_URL="file:/app/backend/prisma/dev.db" --name pm-container pm-app
echo "Server started at http://localhost:3000"
