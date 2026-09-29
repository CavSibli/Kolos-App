#!/bin/sh
set -eu

# Ne jamais réutiliser le nom PORT : Docker Nest lit process.env.PORT.
# Avant: PORT="${POSTGRES_PORT}" écrasait PORT=3000 → Nest écoutait 5432.
HOST="${POSTGRES_HOST:-postgres}"
PG_WAIT_PORT="${POSTGRES_PORT:-5432}"

echo "Waiting for Postgres at ${HOST}:${PG_WAIT_PORT}..."
i=0
while [ "$i" -lt 60 ]; do
  if nc -z "$HOST" "$PG_WAIT_PORT" 2>/dev/null; then
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
node ./apps/api/dist/shared/infrastructure/postgres/run-migrations.js

if [ "${RUN_SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding admin user (RUN_SEED_ON_START=true)..."
  node ./apps/api/dist/shared/infrastructure/postgres/seeds/seed-admin-user.js || true
fi

echo "Starting Kolos API..."
exec node ./apps/api/dist/main.js
