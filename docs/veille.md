# Journal de veille sécurité — Kolos (T23 / §11)

**Auteur :** Sibli Cav (projet Kolos / 3WA)  
**Périmètre techno :** NestJS 11 + Node ≥20 / 22, PostgreSQL 16, MongoDB 7, React 19 (stack réelle `docs/architecture-polyglotte.md`)  
**Fréquence :** revue hebdomadaire + alertes Dependabot / GitHub Advisory + blogs constructeurs  
**Date de constitution du journal :** 2026-09-28  
**Ne pas coller dans** `dossier_projet_kolos.md` (gelé → collage en T99)

---

## Méthode (comment je me renseigne)

| Canal | Usage |
|-------|--------|
| GitHub Dependabot + Security Advisories | Alertes sur le monorepo `CavSibli/Kolos-App` |
| Node.js Security Releases | Blog officiel `nodejs.org/en/blog/vulnerability/` |
| NestJS GitHub Security Advisories | `github.com/nestjs/nest/security/advisories` |
| PostgreSQL Security | `postgresql.org/support/security/` |
| NVD / GitHub Advisory Database | Fiche CVE + versions corrigées |
| OWASP Top 10 | Référentiel risques applicatifs web |

---

## Entrées datées

### 2026-09-28 — OWASP Top 10:2021 (référentiel)

- **Sujet :** grille de risques applicatifs (A01 Broken Access Control → A10 SSRF).
- **Pourquoi Kolos :** le parcours livré (JWT, rôles demandeur/aidant/admin, signalements, messagerie) se mappe surtout sur **A01** (contrôle d’accès), **A02** (mots de passe / JWT), **A03** (injection via TypeORM/Mongoose), **A07** (auth).
- **Action Kolos :** conserver guards `@Roles`, ownership JE-09, bcrypt pour hash, throttling Nest ; pas d’exposition Mongo hors Docker.
- **Source :** https://owasp.org/Top10/2021/  
- **Réf. :** OWASP Top 10:2021

---

### 2026-09-28 — Node.js security releases (juillet 2026)

- **Sujet :** correctifs HIGH sur les lignes 22.x / 24.x / 26.x (ex. CVE-2026-56846 mémoire HTTP/2, CVE-2026-56848 heap-use-after-free HTTP/2, CVE-2026-58043 Permission Model).
- **Versions patchées citées :** Node.js **v22.23.2**, v24.18.1, v26.5.1.
- **Pourquoi Kolos :** API Nest tourne sur Node (`engines` ≥20 ; image Docker `node:22-alpine`). Les failles HTTP/2 / DoS concernent le runtime sous-jacent même si l’app n’utilise pas le Permission Model.
- **Action Kolos :** viser une image / runtime Node **22.x à jour** (patch security) ; suivre le blog à chaque release ; CI GitHub Actions déjà en place (T19) pour détecter des builds cassés après bump.
- **Source :** https://nodejs.org/en/blog/vulnerability/july-2026-security-releases/  
- **Réfs. CVE :** CVE-2026-56846, CVE-2026-56848, CVE-2026-58043 (liste complète sur la page)

---

### 2026-09-28 — NestJS `@nestjs/core` SSE injection (CVE-2026-35515)

- **Sujet :** injection dans le protocole SSE (`SseStream._transform`) si `type` / `id` d’événement sont influencés par des données non sanitisées ; corrigé en **`@nestjs/core@11.1.18`**.
- **Pourquoi Kolos :** monorepo sur Nest **11** (`@nestjs/core` `^11.0.0`). Kolos n’expose pas de flux SSE métier aujourd’hui, mais la dépendance reste dans l’arbre.
- **Action Kolos :** s’assurer que le lockfile résout **≥ 11.1.18** ; ne pas brancher SSE sans valider les champs `id`/`type`.
- **Source :** https://github.com/advisories/GHSA-36XV-JGW5-4Q75  
- **Réf. NVD :** https://nvd.nist.gov/vuln/detail/CVE-2026-35515  
- **Réf. CVE :** CVE-2026-35515

---

### 2026-09-28 — NestJS Fastify middleware bypass (contexte adapter)

- **Sujet :** plusieurs advisories **`@nestjs/platform-fastify`** (ex. trailing slash CVE-2026-54281, HEAD CVE-2026-33011) permettant de contourner un middleware Nest.
- **Pourquoi Kolos :** Kolos utilise **`@nestjs/platform-express`**, pas Fastify — **non exposé** à ces CVE Fastify. La veille sert à ne pas migrer d’adapter sans relecture sécu.
- **Action Kolos :** rester sur Express tant que le besoin Fastify n’est pas justifié ; si migration un jour → version patchée + tests des guards.
- **Sources :**  
  - https://nvd.nist.gov/vuln/detail/CVE-2026-54281  
  - https://github.com/nestjs/nest/security/advisories/GHSA-wf42-42fg-fg84  

---

### 2026-09-28 — PostgreSQL `pg_dump` / client (CVE-2025-8714 & suite 2026)

- **Sujet :** un dump malveillant peut entraîner l’exécution de méta-commandes `psql` côté client (CVE-2025-8714, corrigé 17.6 / **16.10** / … le 2025-08-14). Suite 2026 : CVE-2026-18408 (`\unrestrict`) corrigé notamment en **16.15** (2026-08-13).
- **Pourquoi Kolos :** Postgres **16** via Docker (`postgres:16-alpine`) ; les dumps / restores font partie du cycle de travail étudiant.
- **Action Kolos :** pull régulier de l’image mineure 16.x ; ne pas restaurer un dump d’origine non fiable ; privilégier des dumps d’environnements contrôlés.
- **Sources :**  
  - https://www.postgresql.org/support/security/CVE-2025-8714/  
  - https://www.postgresql.org/support/security/CVE-2026-18408/  
  - Liste PG 16 : https://www.postgresql.org/support/security/16/  

---

### 2026-09-28 — MongoDB « MongoBleed » (CVE-2025-14847) + authz aggregation (CVE-2026-82074)

- **Sujet :**  
  - **CVE-2025-14847** (fin 2025) : lecture mémoire non initialisée via messages zlib — exploitation observée ; corriger **7.0 ≥ 7.0.28** (parmi d’autres branches).  
  - **CVE-2026-82074** (2026-09-08) : mauvaise autorisation dans l’aggregation framework — utilisateur authentifié peut lire des données hors périmètre ; branches 7.0 affectées **&lt; 7.0.41**.
- **Pourquoi Kolos :** Option C — Mongo **7** pour messagerie + `moderation_actions` ; Mongo ne doit **pas** être exposé public.
- **Action Kolos :** image `mongo:7` à jour (tag digéré / patch mineur) ; bind Docker local uniquement ; comptes app avec privilèges minimaux ; pas d’accès aggregation admin depuis le front.
- **Sources :**  
  - https://www.bitsight.com/blog/critical-vulnerability-alert-cve-2025-14847-mongodb-mongobleed (synthèse + versions patchées)  
  - https://nvd.nist.gov/vuln/detail/cve-2026-82074  

---

### 2026-09-28 — Lien veille → contrôles déjà en place dans Kolos

| OWASP / thème | Mesure Kolos (preuve code / tests) |
|---------------|-------------------------------------|
| A01 Access control | Guards rôles + ownership JE-09 (T17) |
| A02 Crypto | `bcryptjs` mots de passe ; JWT access court + refresh httpOnly |
| A03 Injection | TypeORM paramétré ; Mongoose schémas ; validation DTO |
| A05 Misconfig | `.env` hors git ; Docker Compose local ; pas de secrets dans le dossier |
| A06 Outdated components | Dependabot + CI lint/tests (T19) |
| A07 Authn | Login / refresh / revoke ; ban admin users |
| Rate abuse | `@nestjs/throttler` |

---

## Synthèse actions à suivre (hors T23 code)

1. Vérifier versions résolues Nest ≥ 11.1.18 et Node 22 patché security.  
2. Mettre à jour images Docker Postgres 16.x / Mongo 7.x vers les mineures patchées.  
3. Continuer la revue Dependabot hebdomadaire.  
4. Coller des extraits de ce journal dans le dossier en **T99** uniquement.

---

*Fin du journal T23 — entrées sourcées, aucune CVE fictive.*
