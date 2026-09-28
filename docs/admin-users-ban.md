# Admin users + soft ban (Lot 2)

## Soft ban

- `users.banned_at`, `ban_until`, `ban_reason`
- `ban_until` null = définitif ; date future = temporaire
- Login → **403** si banni ; sessions refresh révoquées au ban
- Pas de hard-delete

## API (`@Roles('admin')`)

| Method | Path |
|--------|------|
| GET | `/v1/admin/users` |
| POST | `/v1/admin/users` (demandeur/aidant only) |
| PATCH | `/v1/admin/users/:id` |
| POST | `/v1/admin/users/:id/ban` |
| POST | `/v1/admin/users/:id/unban` |

UI : `/admin/users`
