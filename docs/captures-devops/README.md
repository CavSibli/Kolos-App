# Captures DevOps / outils / Compass (T22)

**Date :** 2026-09-28  
**Dossier gelé :** non modifié.

## Fichiers

| Fichier | Preuve | Source réelle |
|---------|--------|---------------|
| `mongo-compass-kolos-business.png` | MongoDB Compass — connexion locale, base **`kolos_business`** (liste Databases + tailles) | Compass 1.x ; données clonées depuis le volume Docker Kolos (`messages`, `conversations`, `moderation_actions`) — port temporaire `27018` car `127.0.0.1:27017` est occupé par un autre `mongod` hôte |
| `mongo-sample-documents.json` | Extraits documents collections (complément lisible) | `mongosh` sur le clone T22 / même contenu que `kolos-app-mongo-1` |
| `ci-github-actions-run-vert.png` | Run CI **vert** T19 | https://github.com/CavSibli/Kolos-App/actions/runs/36487414107 |
| `ci-github-actions-liste.png` | Liste des workflow runs Actions | https://github.com/CavSibli/Kolos-App/actions |
| `outil-github-repo.png` | Outil collab / versions — dépôt GitHub | https://github.com/CavSibli/Kolos-App |

Voir aussi frise : [`../frise/frise-semaines-kolos.md`](../frise/frise-semaines-kolos.md).

## Note technique Compass / ports

Sur le poste de démo, `127.0.0.1:27017` est pris par un MongoDB hôte (autres bases hors Kolos). Le Mongo **Docker** Kolos (`kolos-app-mongo-1`) expose aussi `27017` via docker-proxy. Pour la capture Compass sans toucher au `mongod` hôte (accès refusé à l’arrêt), dump/restore temporaire sur **`27018`** → même DB `kolos_business`.
