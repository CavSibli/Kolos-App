# Messagerie Mongo (T11) — pourquoi documentaire + exemple JSON

## Pourquoi Mongo (documentaire) pour la messagerie ?

- **Schéma évolutif** : un message peut gagner des champs (pièces jointes, lectures, réactions) sans migration SQL lourde.
- **Fil par mission** : une `conversation` = un document ancré sur `missionId` ; les messages s’ajoutent en append-only.
- **Pas de double vérité** : Postgres reste source des missions / participants ; Mongo ne stocke que des **références** (`missionId`, `userId`).
- **Hors relationnel volontaire** : le MPD Semaine 1 (tables `conversations` / `messages` PG) a été retiré du MPD actif (T07) — Option C.

Health Mongo / `MongoModule` : **inchangés**.

## API

| Méthode | Route | Droits |
|---------|-------|--------|
| `GET` | `/v1/missions/:id/messages` | participant (demandeur ou aidant) + mission `CONFIRMED` |
| `POST` | `/v1/missions/:id/messages` | idem ; body `{ "body": "…" }` |

Seed démo : `pnpm --filter @kolos/api seed:mongo`  
(variables optionnelles : `MONGO_SEED_MISSION_ID`, `MONGO_SEED_DEMANDEUR_ID`, `MONGO_SEED_AIDANT_ID`).

## Exemple de documents (densité type preuve dossier)

### Conversation

```json
{
  "_id": "68d8f2a1c4e7b91a2f0e1001",
  "missionId": 42,
  "participantIds": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  ],
  "createdAt": "2026-09-28T14:02:11.000Z",
  "updatedAt": "2026-09-28T14:02:11.000Z"
}
```

### Message

```json
{
  "_id": "68d8f2b7c4e7b91a2f0e1002",
  "conversationId": "68d8f2a1c4e7b91a2f0e1001",
  "missionId": 42,
  "userId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "body": "Bonjour, je confirme mon arrivée vers 14h devant le magasin Carrefour République.",
  "createdAt": "2026-09-28T14:05:44.000Z"
}
```

UI : `/app/missions/:missionId/messages` (design system Kolos).
