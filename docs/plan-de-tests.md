# Plan de tests Kolos (repo) — T18

Document de pilotage des tests **dans le dépôt** (pas le dossier projet gelé).  
Commandes : depuis la racine monorepo, Docker Postgres + Mongo up.

## Commandes

```bash
# Unitaires API (Jest)
pnpm --filter @kolos/api test

# E2E API (Supertest + Postgres + Mongo)
pnpm --filter @kolos/api test:e2e

# Ciblé Mongo E2E (T18)
pnpm --filter @kolos/api test:e2e -- mongo.e2e-spec.ts

# Ciblé marketplace (JE-01..JE-09)
pnpm --filter @kolos/api test:e2e -- marketplace.e2e-spec.ts
```

## JE marketplace (E2E)

| ID | Scénario | Attendu | Spec |
|----|----------|---------|------|
| JE-01 | Aidant candidature valide | 201 `PENDING` | `marketplace.e2e-spec.ts` |
| JE-02 | Doublon candidature | 409 | idem |
| JE-03 | Demandeur candidate | 403 | idem |
| JE-04 | Aidant liste ses candidatures | 200 + contexte | idem |
| JE-05 | Demandeur liste ses demandes | 200 + compteurs | idem |
| JE-06 | Acceptation (quota 1) | `ACCEPTED` + `ASSIGNED` | idem |
| JE-07 | Mission créée | `AWAITING_PAYMENT` | idem |
| JE-08 | Détail aidant enrichi | mission + participation | idem |
| JE-09 | Demandeur B sur ressource A | 403 ownership | idem (T17) |

Autres E2E marketplace : mock paiement owner/non-owner, signalements, messagerie HTTP.

## Mongo Option C (unit + E2E)

| Couche | Cible | Fichiers |
|--------|-------|----------|
| Unit | Accès messagerie (participant / admin / statut) | `mission-messaging-access.service.spec.ts` |
| Unit | List / post messages | `list-messages.use-case.spec.ts`, `post-message.use-case.spec.ts` |
| Unit | Create / list `moderation_actions` | `create-moderation-action.use-case.spec.ts`, `list-moderation-actions.use-case.spec.ts` |
| E2E | Assert docs `conversations` + `messages` après POST | `mongo.e2e-spec.ts` |
| E2E | Assert doc `moderation_actions` après MASK admin | `mongo.e2e-spec.ts` |
| E2E (complément) | CLASSIFY admin → Mongo + PG | `admin-moderation.e2e-spec.ts` |
| E2E (complément) | Messagerie participants HTTP | `marketplace.e2e-spec.ts`, `admin-messaging.e2e-spec.ts` |

## Frontend — absence assumée

- **Pas de suite Jest/Vitest/Playwright** sur `apps/user-web` (pas de script `test` dans `package.json`).
- Priorité volontaire : cœur API + ownership + Mongo Option C.
- Smoke UI = build (`pnpm --filter @kolos/user-web build`) + parcours manuel ; pas de couverture front inventée.

## Hors scope tests (GAP)

Clôture mission complète, `DISPUTED`, Stripe prod, géoloc, avis, UC_Edit / UC_Withdraw.
