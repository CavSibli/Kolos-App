# Kolos

Monorepo **pnpm** pour la plateforme Kolos (demandeur / aidant), conforme à l'architecture du rapport `deep-research-report.md`.

## Stack

- **API** : NestJS 11, architecture Onion, Passport + JWT
- **Identity** : PostgreSQL + TypeORM
- **Métier (préparé)** : MongoDB + Mongoose
- **Frontend** : React 19 + Vite 7 (`user-web`)

## Structure

```text
kolos/
├─ apps/api          # API NestJS /v1
├─ apps/user-web     # Interface utilisateur
└─ packages/
   ├─ shared-types   # Types partagés
   └─ http-client    # Client HTTP + auth
```

## Démarrage local

### Prérequis

- Node.js 20+
- pnpm 9+
- Docker (PostgreSQL + MongoDB)

### Installation

```bash
cd kolos
pnpm install
cp .env.example .env
```

### Bases de données

```bash
docker compose up -d postgres mongo
pnpm --filter @kolos/api typeorm:migrate
pnpm --filter @kolos/api seed:postgres
```

> **Note** : si le port `5432` est déjà utilisé sur votre machine (autre PostgreSQL local), Kolos expose Postgres sur le port hôte **`5433`** (`POSTGRES_PORT=5433` dans `.env`). À l'intérieur de Docker, l'API utilise toujours `postgres:5432`.

### Lancer l'API et le frontend

```bash
pnpm dev
```

- API : http://localhost:3000/v1
- user-web : http://localhost:5173

## Authentification

| Route | Description |
|-------|-------------|
| `POST /v1/auth/register` | Inscription (demandeur ou aidant) |
| `POST /v1/auth/login` | Connexion |
| `POST /v1/auth/refresh` | Rotation du refresh token (cookie httpOnly) |
| `POST /v1/auth/logout` | Déconnexion |
| `GET /v1/me` | Profil courant |
| `PATCH /v1/me/profile` | Mise à jour du profil |

**Stratégie tokens** : access JWT en mémoire (Bearer) + refresh en cookie `httpOnly`.

### Compte admin (seed)

- Email : `admin@example.com`
- Mot de passe : `Admin1234!` (configurable via `.env`)

## Tests

```bash
pnpm test
pnpm test:e2e
```

Les tests e2e nécessitent PostgreSQL et MongoDB accessibles (variables `.env`).

## Scripts utiles

```bash
pnpm build
pnpm docker:up
pnpm docker:down
```
