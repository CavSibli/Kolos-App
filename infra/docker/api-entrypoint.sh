#!/bin/sh
set -eu

# IMPORTANT: ne jamais réutiliser le nom PORT (env Docker Nest = process.env.PORT).
# Avant: PORT="${POSTGRES_PORT}" écrasait PORT=3000 → Nest écoutait 5432.
HOST="${POSTGRES_HOST:-postgres}"
PG_WAIT_PORT="${POSTGRES_PORT:-5432}"

# #region agent log
echo "DBG_KOLOS {\"sessionId\":\"27b403\",\"hypothesisId\":\"H2\",\"location\":\"api-entrypoint.sh:start\",\"message\":\"env before wait\",\"data\":{\"PORT\":\"${PORT:-}\",\"POSTGRES_PORT\":\"${POSTGRES_PORT:-}\",\"PG_WAIT_PORT\":\"${PG_WAIT_PORT}\",\"NODE_ENV\":\"${NODE_ENV:-}\"},\"timestamp\":$(date +%s000)}"
# #endregion

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

# #region agent log
echo "DBG_KOLOS {\"sessionId\":\"27b403\",\"hypothesisId\":\"H1\",\"location\":\"api-entrypoint.sh:pre-migrate\",\"message\":\"starting migrations\",\"data\":{\"PORT\":\"${PORT:-}\",\"POSTGRES_PORT\":\"${POSTGRES_PORT:-}\"},\"timestamp\":$(date +%s000)}"
# #endregion

echo "Running TypeORM migrations..."
node ./apps/api/dist/shared/infrastructure/postgres/run-migrations.js

# #region agent log
echo "DBG_KOLOS {\"sessionId\":\"27b403\",\"hypothesisId\":\"H1\",\"location\":\"api-entrypoint.sh:post-migrate\",\"message\":\"migrations finished\",\"data\":{\"PORT\":\"${PORT:-}\"},\"timestamp\":$(date +%s000)}"
# #endregion

if [ "${RUN_SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding admin user (RUN_SEED_ON_START=true)..."
  node ./apps/api/dist/shared/infrastructure/postgres/seeds/seed-admin-user.js || true
fi

# #region agent log
echo "DBG_KOLOS {\"sessionId\":\"27b403\",\"hypothesisId\":\"H2\",\"location\":\"api-entrypoint.sh:pre-start\",\"message\":\"starting nest\",\"data\":{\"PORT\":\"${PORT:-}\",\"POSTGRES_PORT\":\"${POSTGRES_PORT:-}\"},\"timestamp\":$(date +%s000)}"
# #endregion

echo "Starting Kolos API..."
exec node ./apps/api/dist/main.js
