# Preuve polyglotte T14 — action admin → Mongo + PG

## Parcours bout-en-bout

1. Participant crée un signalement → **Postgres** `signalements` (`OPEN`)
2. Admin ouvre `/admin` → liste via `GET /v1/admin/reports` (PG)
3. Admin clique **Classer / Masquer / Rejeter** → `POST /v1/admin/reports/:id/actions`
4. API :
   - insert **Mongo** `moderation_actions` (journal append-only)
   - update **Postgres** statut signalement

| Action | Statut PG |
|--------|-----------|
| `CLASSIFY` | `RESOLVED` |
| `DISMISS` | `REJECTED` |
| `MASK` | `IN_REVIEW` |

## Exemple réponse API

```json
{
  "id": "68d8f4a1c4e7b91a2f0e3001",
  "reportId": 12,
  "adminId": "00000000-0000-4000-8000-000000000099",
  "action": "CLASSIFY",
  "reason": "Signalement fondé",
  "payload": {
    "previousStatus": "OPEN",
    "nextStatus": "RESOLVED",
    "source": "admin"
  },
  "createdAt": "2026-09-28T20:15:00.000Z",
  "reportStatus": "RESOLVED"
}
```

## Accès

- UI : `/admin` (rôle `admin`)
- Credentials : `admin@example.com` / `Admin1234!` (`seed:postgres`)
- Voir aussi `docs/admin-backoffice.md` · `docs/moderation-actions-mongo.md`
