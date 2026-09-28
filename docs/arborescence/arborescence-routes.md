# Arborescence des routes / pages Kolos (T20 — §5.3.1)

Source de vérité code : `apps/user-web/src/app/router.tsx` (2026-09-28).

```text
/
├── /                              Landing publique (Visiteur)
├── /mentions-legales              Mentions légales
├── /confidentialite               Confidentialité
├── /login                         Connexion (guest)
├── /register                      Inscription (guest)
│
├── /app                           Shell connecté (AuthGuard + AppShell)
│   ├── /app                       Dashboard (Home)
│   ├── /app/profile/aidant        Profil aidant          [rôle: aidant]
│   ├── /app/requests              Liste demandes pub.    [rôle: aidant]
│   ├── /app/requests/new          Publier une demande    [rôle: demandeur]
│   ├── /app/requests/mine         Mes demandes           [rôle: demandeur]
│   ├── /app/requests/mine/:id     Candidats + mission    [rôle: demandeur]
│   ├── /app/applications/mine     Mes candidatures       [rôle: aidant]
│   ├── /app/applications/mine/:id Détail candidature     [rôle: aidant]
│   └── /app/missions/:id/messages Messagerie Mongo       [demandeur|aidant]
│
├── /admin                         Shell admin (AdminGuard + AdminShell)
│   ├── /admin                     Dashboard stats
│   ├── /admin/users               Utilisateurs (ban soft)
│   ├── /admin/requests            Demandes (soft CRUD)
│   ├── /admin/reports             Signalements + actions Mongo
│   └── /admin/missions/:id/messages  Messagerie (lecture/participation)
│
└── *                              404
```

## Redirections legacy (compat)

| Ancienne | Nouvelle |
|----------|----------|
| `/requests` | `/app/requests` |
| `/requests/new` | `/app/requests/new` |
| `/requests/mine` | `/app/requests/mine` |
| `/requests/mine/:id` | `/app/requests/mine/:id` |
| `/applications/mine` | `/app/applications/mine` |
| `/applications/mine/:id` | `/app/applications/mine/:id` |
| `/profile/aidant` | `/app/profile/aidant` |

## Captures associées (T20)

Voir `docs/captures-ui/README.md` et `Kolos Soutenance Final/Annexes/`.
