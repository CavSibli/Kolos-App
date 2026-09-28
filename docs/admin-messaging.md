# Admin messagerie mission (Lot 4)

Admin lit et écrit sur une conversation de mission **CONFIRMED** sans être participant métier.

## API (`@Roles('admin')`)

| Method | Path |
|--------|------|
| GET | `/v1/admin/missions/:id/messages` |
| POST | `/v1/admin/missions/:id/messages` `{ body }` |

- Bypass check participant ; mission toujours `CONFIRMED`
- `userId` du message = admin ; auteur enrichi via Identity
- Routes produit `/v1/missions/:id/messages` inchangées (demandeur/aidant)

## UI

`/admin/missions/:missionId/messages` — fil + envoi. Entrées depuis demandes / signalements.
