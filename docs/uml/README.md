# UML complétion Kolos (T08)

**Statut :** amendement conception Option C / MVP complétion  
**Ne remplace pas** l’intégralité des UML Semaine 1 ; complète UC + 1 activité + 1 séquence pour messagerie Mongo, admin modération et signalement.

## Artefacts

| Fichier | Type | Contenu |
|---------|------|---------|
| `uc-kolos-completion.puml` | Cas d’utilisation | UC global annoté MVP / hors MVP ; messagerie & journal modération → Mongo |
| `activite-post-mission-option-c.puml` | Activité | Flux post-sélection : mock paiement → messagerie Mongo **ou** signalement PG → admin → `moderation_actions` Mongo |
| `sequence-signalement-admin-messagerie.puml` | Séquence | `POST /missions/{id}/reports` (PG) ; action admin → Mongo ; list/post messages Mongo |

Sources Semaine 1 alignées (annotations / correctif URL) :
- `Kolos Semaine 1 - Conception/UML Corrigé/Diagramme de cas d'utilisation global - Kolos.txt`
- `…/Diagramme de séquence - Clôturer, noter et signaler.txt` (URL signalement corrigée)

## Décisions tranchées (T08)

| Sujet | Décision |
|-------|----------|
| **URL signalement** | `POST /missions/:id/reports` (figée ; plus `POST /reports`) |
| **Signalement** | PostgreSQL (T10) |
| **Messagerie** | MongoDB Conversations/Messages (T11) |
| **Action admin** | Écrit `moderation_actions` Mongo (T12/T14) ; liste lit les signalements PG |
| **Mock paiement** | Sortie de `AWAITING_PAYMENT` sans Stripe (T09) — prérequis démo messagerie |
| **`IN_PROGRESS`** | **Hors MVP** — absent des enums code (`statuts_mission` : pas de `IN_PROGRESS`) |
| **Multi-aidants** | **Hors MVP** — `nb_aidants_requis` existe en schéma ; parcours livré = 1 aidant sélectionné ; pas de workflow multi-participations complet |
| **Avis / clôture complète / `DISPUTED` plein / Stripe prod** | Hors scope complétion (GAP dossier) |

## Acteurs (cohérents Option C)

- Demandeur / Aidant (participants mission) → signalement, messagerie post-mission  
- Administrateur → liste signalements PG + 1 action → Mongo  
- Système : Postgres (marketplace + reports) + Mongo (messages + moderation_actions)

## Suite code

T09 mock paiement → T11 messagerie → T12 moderation_actions → T10 signalement → T13–T14 admin.
