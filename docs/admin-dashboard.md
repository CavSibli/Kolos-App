# Admin dashboard — stats + navigation (Lot 1)

## Routes UI

| Path | Page |
|------|------|
| `/admin` | Tableau de bord (stats) |
| `/admin/users` | Utilisateurs (Lot 2) |
| `/admin/requests` | Demandes (Lot 3) |
| `/admin/reports` | Signalements (T13/T14) |

## API

`GET /v1/admin/stats` — `@Roles('admin')`

Compteurs : users, demandes (+ répartition statut), missions, signalements ouverts/total, messages Mongo.
