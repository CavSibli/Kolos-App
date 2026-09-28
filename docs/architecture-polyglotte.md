# Architecture polyglotte Kolos (Postgres + Mongo)

**Statut :** note de conception (complétion app, T06)  
**Décision Mongo :** Option C — messagerie post-mission **et** journal `moderation_actions`  
**Hors scope :** marketplace en Mongo, Stripe prod, géoloc, 31 tables MPD, avis, clôture complète, `DISPUTED`

---

## 1. Pourquoi deux bases

Kolos sépare les **données transactionnelles de la marketplace** (identité, demandes, candidatures, missions, paiements, signalements PG) des **données documentaires / journal** (fil de messages post-mission, actions de modération admin).

| Store | Rôle | Critères |
|-------|------|----------|
| **PostgreSQL** | Source de vérité relationnelle marketplace | Transactions ACID, contraintes FK, enums/statuts, parcours publier → candidater → sélectionner → `AWAITING_PAYMENT` (+ signalement PG, mock paiement) |
| **MongoDB** | Documents souples liés par refs métier | Conversation / messages (schéma évolutif), append-only `moderation_actions` ; pas de double vérité avec PG pour le même objet |

Les IDs métier (`userId`, `missionId`, `reportId`…) restent ancrés côté Postgres ; Mongo ne stocke que des **références** (UUID / bigint selon le domaine) sans remplacer les tables transactionnelles.

---

## 2. Répartition des responsabilités

### PostgreSQL (transactionnel)

Déjà en place via TypeORM + migrations :

- Identity : utilisateurs, rôles, refresh tokens, profil aidant  
- Marketplace : demandes, candidatures, missions, participations, tables de statuts  
- À venir (backlog) : signalements + mock paiement (sortie de `AWAITING_PAYMENT`) — toujours en PG

### MongoDB (Option C)

Infra déjà branchée (`MongoModule` + health) ; collections métier à livrer :

| Collection (cible) | Usage | Tâche |
|--------------------|-------|-------|
| Conversations / Messages | Fil post-mission entre participants | T11 |
| `moderation_actions` | Journal d’actions admin (ex. classer / masquer un signalement) | T12 / T14 |

**Règle :** pas de marketplace (demandes, candidatures, missions) en Mongo.

---

## 3. Écart MPD messages — **traité (T07)**

Le MPD Semaine 1 modélisait la messagerie en tables relationnelles (`conversations`, `participant_conversation`, `messages`, `lectures_message`).

**Amendement T07 :** ces tables sont **hors MPD PostgreSQL** ; stockage cible = **MongoDB** (Option C).  
Détail du diff : [`mpd-messagerie-mongo.md`](./mpd-messagerie-mongo.md).  
Fichiers Semaine 1 annotés en conséquence. **Pas de double vérité** PG+Mongo pour les messages (aucune table messages en PG dans le code ni dans le MPD actif).

---

## 4. Schéma logique (haut niveau)

```text
[user-web React] ──HTTP /v1──► [API Nest Onion]
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             PostgreSQL 16                 MongoDB 7
          identity + marketplace      messages + moderation_actions
          (+ reports / mock pay)      (refs userId / missionId)
```

---

## 5. Tableau des versions (sources repo — non inventées)

Versions lues dans les fichiers du monorepo. Les plages `^` viennent des `package.json` ; la colonne « Résolu » = `pnpm list` local au moment de la rédaction (indicatif).

| Techno | Déclaré (source) | Résolu / image | Fichier source |
|--------|------------------|----------------|----------------|
| **Node.js** | `>=20` (`engines`) ; image Docker `node:22-alpine` | contrainte repo + Dockerfile | `package.json`, `infra/docker/api.Dockerfile` |
| **NestJS** | `@nestjs/core` `^11.0.0` | `11.1.28` | `apps/api/package.json` |
| **React** | `react` `^19.0.0` | `19.2.7` | `apps/user-web/package.json` |
| **Vite** | `vite` `^7.0.0` | `7.3.6` | `apps/user-web/package.json` |
| **TypeORM** | `typeorm` `^0.3.31` | `0.3.30`* | `apps/api/package.json` |
| **Mongoose** | `mongoose` `^8.0.0` | `8.24.1` | `apps/api/package.json` |
| **PostgreSQL** | image `postgres:16-alpine` | 16 (Alpine) | `docker-compose.yml` |
| **MongoDB** | image `mongo:7` | 7 | `docker-compose.yml` |

\* Le lockfile peut résoudre une patch antérieure à la borne basse du `package.json` ; la source de vérité déclarée reste `^0.3.31`.

Autres contraintes documentées dans le README : **pnpm 9+**, Docker Compose pour Postgres + Mongo.

---

## 6. État d’avancement vs cible

| Couche | Aujourd’hui | Cible Option C |
|--------|-------------|----------------|
| Postgres marketplace | Opérationnel (parcours jusqu’à `AWAITING_PAYMENT`) | + mock paiement (T09) + signalement (T10) |
| Mongo connexion | `MongoModule` + health | inchangé |
| Mongo métier | Absent | Messagerie (T11) + `moderation_actions` (T12) + écriture admin (T14) |
| Conception MPD | Messages hors MPD PG (T07) ; amendement `docs/mpd-messagerie-mongo.md` | Cohérence Option C tenue |
| UML UC / séquences | Partiel Semaine 1 | T08 : messagerie, admin, signalement |

---

## 7. Références internes

- Plan d’exécution : `Kolos Soutenance Final/Source/plan_prompts_completion.md` (T06–T14)  
- Périmètre produit : `ce_qu'il_reste_à_faire.md` §2 Option C  
- MPD Semaine 1 : `Kolos Semaine 1 - Conception/MCD MLD et MPD/`  
- Code : `apps/api` (Nest Onion), `apps/user-web` (React), `docker-compose.yml`
)
