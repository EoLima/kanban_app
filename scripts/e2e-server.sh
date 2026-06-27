#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "[e2e] Building frontend static export..."
( cd "$ROOT/frontend" && npm run build )

echo "[e2e] Syncing frontend export into backend/public..."
rm -rf "$ROOT/backend/public"
cp -r "$ROOT/frontend/out" "$ROOT/backend/public"

echo "[e2e] Building backend..."
( cd "$ROOT/backend" && npm run build )

echo "[e2e] Starting backend on port 3000..."
( cd "$ROOT/backend" && npm run start:prod )
