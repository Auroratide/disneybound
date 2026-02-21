#!/bin/sh
set -e

PB_DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"
PB_ORIGINS="${PB_ORIGINS:-http://localhost:3000}"

if [ -n "$PB_SUPERUSER_EMAIL" ] && [ -n "$PB_SUPERUSER_PASSWORD" ]; then
  /pb/pocketbase superuser create "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD" \
    --dir="$PB_DATA_DIR" 2>/dev/null \
    && echo "Superuser created" \
    || echo "Superuser already exists, skipping"
fi

exec /pb/pocketbase serve \
  --http=0.0.0.0:8090 \
  --dir="$PB_DATA_DIR" \
  --origins="$PB_ORIGINS"
