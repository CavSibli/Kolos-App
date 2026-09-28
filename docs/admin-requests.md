# Admin demandes (Lot 3)

Soft CRUD uniquement — **pas** de `DELETE` SQL. Annulation → statut `CANCELLED`.

## API (`@Roles('admin')`)

| Method | Path |
|--------|------|
| GET | `/v1/admin/requests` (pagination, filtre `status`) |
| GET | `/v1/admin/requests/:id` |
| POST | `/v1/admin/requests` (au nom d’un `demandeurId`) |
| PATCH | `/v1/admin/requests/:id` (champs métier, hors contournement statut) |
| POST | `/v1/admin/requests/:id/cancel` → `CANCELLED` |

## UI

`/admin/requests` — liste, création, édition titre, annulation soft. Lien messagerie si mission `CONFIRMED` (Lot 4).
