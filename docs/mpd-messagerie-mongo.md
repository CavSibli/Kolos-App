# Amendement MPD — messagerie hors relationnel (Mongo)

**Statut :** amendement conception T07  
**Aligné :** `docs/architecture-polyglotte.md` (Option C)  
**Sources MPD Semaine 1 mises à jour :**
- `Kolos Semaine 1 - Conception/MCD MLD et MPD/MPD Merise - Kolos DBML.txt`
- `Kolos Semaine 1 - Conception/MCD MLD et MPD/MCD, MLD et MPD corrigés et cohérents pour Kolos.md`
- `Kolos Semaine 1 - Conception/MCD MLD et MPD/MLD MERISE - Kolos.txt` (note package Communication)

---

## Décision

| Élément Semaine 1 (MPD PG) | Statut après T07 |
|----------------------------|------------------|
| `conversations` | **Hors MPD relationnel** — stocké en **MongoDB** (T11) |
| `participant_conversation` | **Hors MPD relationnel** — stocké en **MongoDB** (T11) |
| `messages` | **Hors MPD relationnel** — stocké en **MongoDB** (T11) |
| `lectures_message` | **Hors MPD relationnel** — Mongo (doc Message ou champ dérivé) |
| Refs FK messagerie ↔ `missions` / `utilisateurs` | Remplacées par **références applicatives** (`missionId`, `userId`) côté Mongo |
| `signalements` | **Reste en PostgreSQL** (T10) |
| `actions_moderation` / `moderation_actions` | Cible **Mongo** (T12) ; plus de FK PG vers `messages` |

**Règle anti double-vérité :** aucune table `messages` / `conversations` n’est créée ni migrée en Postgres dans `Kolos-App`. Le MPD PostgreSQL actif ne les contient plus.

Aucune **nouvelle** table métier inventée hors plan (pas de marketplace Mongo, pas de 31 tables).

---

## Diff conception (résumé)

### Avant (Semaine 1)

MPD 100 % PostgreSQL, y compris messagerie :

```text
missions 1—1 conversations
conversations 1—* messages
utilisateurs *—* conversations (participant_conversation)
messages 1—* lectures_message
```

### Après (T07)

```text
PostgreSQL MPD actif     : identity + marketplace + (signalements T10) + mock paiement (T09)
MongoDB (hors MPD PG)    : Conversations / Messages (T11) + moderation_actions (T12)
Liens croisés            : refs missionId / userId / reportId (pas de FK SQL messagerie)
```

Dans `MPD Merise - Kolos DBML.txt` : section messagerie et refs associées **commentées** ; note projet mise à jour ; `id_message_cible` retiré du modèle PG `actions_moderation`.

---

## Cohérence avec note T06

| Point T06 | T07 |
|-----------|-----|
| Postgres = transactionnel marketplace | Inchangé |
| Mongo = messagerie + journal modération | Messagerie retirée du MPD PG |
| Écart MPD messages à traiter | **Traité** (ce document + fichiers Semaine 1) |

---

## Suite

- **T08** : UC / activité / séquence messagerie Mongo + admin + signalement  
- **T11** : schémas Mongoose + API (implémentation)  
- **T12** : collection `moderation_actions`
