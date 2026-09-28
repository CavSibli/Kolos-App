# Mongo `moderation_actions` (T12) — schéma + extrait

## Pourquoi Mongo (journal append-only) ?

- **Audit admin** : chaque décision (masquer / classer / rejeter) est un document immuable.
- **Payload souple** : métadonnées (`previousStatus`, cible UI, etc.) sans migration SQL.
- **Refs métier** : `reportId` → signalement Postgres ; `adminId` → user admin PG. Pas de double vérité sur le signalement lui-même.

Health Mongo / `MongoModule` : **inchangés**. Pas d’UI admin ici (T13) ; l’écriture depuis `/admin` arrive en **T14**.

## Schéma document

| Champ | Type | Rôle |
|-------|------|------|
| `reportId` | number | FK logique → `signalements.id` (PG) |
| `adminId` | string (UUID) | Admin ayant agi |
| `action` | string | `MASK` \| `CLASSIFY` \| `DISMISS` |
| `reason` | string \| null | Motif libre |
| `payload` | object \| null | Contexte JSON |
| `createdAt` | date | Horodatage append-only |

## Couche application (onion)

- Port : `ModerationActionRepository` (`insert`, `listByReportId`, `listRecent`)
- Use cases : `CreateModerationActionUseCase`, `ListModerationActionsUseCase`
- Module Nest : `ModerationModule` (exporté pour T14) — **pas de controller HTTP** en T12

Seed démo : `pnpm --filter @kolos/api seed:mongo`  
(variables optionnelles : `MONGO_SEED_REPORT_ID`, `MONGO_SEED_ADMIN_ID`).

## Exemple JSON (densité type preuve dossier)

```json
{
  "_id": "68d8f3c1c4e7b91a2f0e2001",
  "reportId": 1,
  "adminId": "00000000-0000-4000-8000-000000000099",
  "action": "CLASSIFY",
  "reason": "Démo T12 — signalement classé sans suite UI admin (T13).",
  "payload": {
    "source": "seed:mongo",
    "previousStatus": "OPEN",
    "nextStatus": "RESOLVED"
  },
  "createdAt": "2026-09-28T18:10:00.000Z"
}
```

Couplage prévu : liste signalements PG en T13 → une action admin écrit ce document en T14.
