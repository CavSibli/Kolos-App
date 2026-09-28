# Back-office admin — liste signalements (T13)

## Accès

| Élément | Valeur |
|---------|--------|
| URL UI | `/admin` |
| API | `GET /v1/admin/reports` |
| Rôle requis | `admin` (JWT) |
| Non-admin UI | redirect → `/app` (`AdminGuard`) |
| Non-admin API | **403** (`RolesGuard`) |

## Credentials démo

Seed : `pnpm --filter @kolos/api seed:postgres`

| Variable | Défaut (README / `.env.example`) |
|----------|----------------------------------|
| `ADMIN_SEED_EMAIL` | `admin@example.com` |
| `ADMIN_SEED_PASSWORD` | `Admin1234!` |

Connexion via `/login`, puis ouvrir `/admin` (lien « Admin » dans l’AppShell si le rôle est présent).

## Contenu T13

- Liste paginée des signalements **Postgres** (motif, statut, priorité, description, mission, auteur).
- Design system Kolos (`AdminShell` + cards).
- Actions de modération (Mongo + maj statut) : **T14** — `docs/admin-moderation-polyglotte.md`.
