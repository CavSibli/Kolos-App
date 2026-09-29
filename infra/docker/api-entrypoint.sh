#!/bin/sh
set -eu

HOST="${POSTGRES_HOST:-postgres}"
PORT="${POSTGRES_PORT:-5432}"

echo "Waiting for Postgres at ${HOST}:${PORT}..."
i=0
while [ "$i" -lt 60 ]; do
  if nc -z "$HOST" "$PORT" 2>/dev/null; then
    echo "Postgres is up."
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$i" -eq 60 ]; then
  echo "Postgres did not become ready in time." >&2
  exit 1
fi

echo "Running TypeORM migrations..."
node ./node_modules/typeorm/cli.js migration:run \
  -d ./apps/api/dist/shared/infrastructure/postgres/postgres.data-source.js

if [ "${RUN_SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding admin user (RUN_SEED_ON_START=true)..."
  node ./apps/api/dist/shared/infrastructure/postgres/seeds/seed-admin-user.js || true
fi

echo "Starting Kolos API..."
exec node ./apps/api/dist/main.js
