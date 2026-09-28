# CI GitHub Actions (T19)

Workflow : [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

## Déclencheurs

- `push` sur `main` et `feat/**`
- `pull_request` vers `main`

## Étapes

1. Install pnpm + Node 20
2. `pnpm install --frozen-lockfile`
3. Build `@kolos/shared-types` + `@kolos/http-client`
4. **Lint réel** ESLint (`pnpm lint` — plus de `echo`)
5. Tests unitaires API (`pnpm test`)
6. Migrations Postgres + seed admin
7. Tests E2E API (`pnpm test:e2e`) avec services Postgres 16 + Mongo 7

## Lint local

```bash
pnpm lint
```

Configs : `packages/eslint-config/{base,nest,react}.cjs` branchées sur chaque package.
