# UNCHK — Plateforme de Gestion Académique

**Université Numérique Cheikh Hamidou Kane**  
Projet d'évaluation — Cours Technologie d'Application Web 2025-2026  
Deadline : 20 juin 2026

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND  Angular 20                          :4200         │
│  ├── Login / Dashboard / Étudiants / Formations              │
│  ├── Formateurs / Communication / Insertion / Admin          │
│  └── Angular Material UI · JWT · Composants standalone       │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP REST + JWT Bearer
┌──────────────────────▼───────────────────────────────────────┐
│  API GATEWAY  Express.js                       :3000         │
│  ├── Authentification JWT · Rate limiting · CORS             │
│  ├── /api/auth  /api/students  /api/formations               │
│  ├── /api/formateurs  /api/communication  /api/stats         │
│  ├── /api/insertion  /api/admin                              │
│  └── Proxy HTTP → Spring Boot                                │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP interne
┌──────────────────────▼───────────────────────────────────────┐
│  BACKEND  Spring Boot 3.2                      :8080         │
│  ├── Spring Security + JWT Filter                            │
│  ├── JPA / Hibernate → MySQL                                 │
│  └── Export PDF (iText) · Export Excel (Apache POI)          │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│  BASE DE DONNÉES  MySQL 8                      :3306         │
│  └── unchk_db                                                │
└──────────────────────────────────────────────────────────────┘
```

> **Le frontend dépend intégralement du backend.**  
> Si le serveur Express (port 3000) ou Spring Boot (port 8080) est arrêté,  
> le frontend affiche une erreur explicite — aucune donnée fictive n'est utilisée.

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 20.x — `npm install -g @angular/cli@20` |
| Java JDK | 17+ |
| Maven | 3.8+ |
| MySQL | 8.0+ |

---

## Installation et démarrage

Les 3 couches doivent être démarrées **dans cet ordre** : MySQL → Spring Boot → Express → Angular.

---

### 1. Base de données MySQL

```sql
CREATE DATABASE unchk_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'uck_user'@'localhost' IDENTIFIED BY 'uck_password';
GRANT ALL PRIVILEGES ON unchk_db.* TO 'uck_user'@'localhost';
FLUSH PRIVILEGES;
```

Le schéma complet (tables + données initiales) est dans :
```
backend/src/main/resources/schema.sql
```
Il est exécuté automatiquement au premier démarrage de Spring Boot (`ddl-auto=update`).

---

### 2. Backend Spring Boot

```bash
cd backend
mvn spring-boot:run
```

Vérifier que le backend répond :
```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

**Variables d'environnement (optionnel — valeurs par défaut fonctionnelles en dev) :**

| Variable | Défaut | Description |
|---|---|---|
| `DB_USERNAME` | `uck_user` | Utilisateur MySQL |
| `DB_PASSWORD` | `uck_password` | Mot de passe MySQL |
| `JWT_SECRET` | *(valeur dev incluse)* | Clé de signature JWT — **à changer en production** |
| `UPLOAD_PATH` | `./uploads` | Dossier fichiers uploadés |
| `CORS_ORIGINS` | `http://localhost:4200,http://localhost:3000` | Origines CORS autorisées |

---

### 3. API Express

```bash
cd api
cp .env.example .env
```

Éditer `.env` — valeurs minimales à renseigner :
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:8080
JWT_SECRET=remplacer-par-une-cle-longue-et-aleatoire
JWT_EXPIRES=24h
```

```bash
npm install
npm start
```

Vérifier :
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api
```

---

### 4. Frontend Angular

```bash
cd frontend
npm install
ng serve
```

Accéder à : **http://localhost:4200**

Le proxy Angular redirige automatiquement `/api/*` vers `http://localhost:3000` (configuré dans `src/proxy.conf.json`).

---

## Comptes utilisateurs

Les comptes sont insérés par `schema.sql` au démarrage du backend.

| Email | Mot de passe | Rôle | Accès |
|---|---|---|---|
| `admin@unchk.edu.sn` | `admin123` | `ADMIN` | Tout |
| `admin2@unchk.edu.sn` | `admin123` | `ADMINISTRATIF` | Gestion, courriers, RH |
| `enseignant@unchk.edu.sn` | `admin123` | `ENSEIGNANT` | Étudiants, formations, communication |
| `etudiant@unchk.edu.sn` | `admin123` | `ETUDIANT` | Dashboard, insertion |

> Changer ces mots de passe avant tout déploiement.

---

## Modules

| Module | Route | Rôles autorisés | Fonctionnalités |
|---|---|---|---|
| **Authentification** | `/auth/login` | Tous | Connexion JWT, guards par rôle |
| **Dashboard** | `/dashboard` | Tous | Stats temps réel, activités récentes, navigation |
| **Étudiants** | `/students` | Admin, Administratif, Enseignant | CRUD, filtres, pagination, export PDF/Excel |
| **Formations** | `/formations` | Admin, Administratif, Responsable | CRUD, suivi budget, répartition H/F |
| **Formateurs** | `/formateurs` | Admin, Administratif | CRUD, suivi heures, types (enseignant, associé, tuteur) |
| **Communication** | `/communication` | Tous (création : Admin, Resp.) | Comptes rendus, circulaires, séminaires, webinaires |
| **Insertion** | `/insertion` | Admin, Appui Insertion, Étudiant | Stages, partenaires, taux d'insertion |
| **Administration** | `/admin` | Admin, Administratif | Courriers, budget, ressources humaines |

---

## Endpoints API

### Authentification
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Non | Connexion — retourne JWT + refresh token |
| `POST` | `/api/auth/refresh` | Non | Renouveler le token |
| `POST` | `/api/auth/logout` | Oui | Déconnexion |
| `GET` | `/api/auth/me` | Oui | Profil de l'utilisateur connecté |
| `GET` | `/api/auth/users` | Oui (Admin) | Liste des utilisateurs |

### Étudiants
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Liste paginée |
| `GET` | `/api/students/:id` | Détail étudiant |
| `POST` | `/api/students` | Créer un étudiant |
| `PUT` | `/api/students/:id` | Modifier un étudiant |
| `DELETE` | `/api/students/:id` | Supprimer un étudiant |
| `GET` | `/api/students/export/pdf` | Export PDF |

### Formations
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/formations` | Liste formations |
| `GET` | `/api/formations/:id` | Détail formation |
| `POST` | `/api/formations` | Créer |
| `PUT` | `/api/formations/:id` | Modifier |
| `DELETE` | `/api/formations/:id` | Supprimer |

### Formateurs
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/formateurs` | Liste formateurs |
| `GET` | `/api/formateurs/:id` | Détail formateur |
| `POST` | `/api/formateurs` | Créer |
| `PUT` | `/api/formateurs/:id` | Modifier |

### Communication
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/communication/comptes-rendus` | Liste documents |
| `POST` | `/api/communication/comptes-rendus` | Créer un document |
| `PATCH` | `/api/communication/comptes-rendus/:id/lu` | Marquer comme lu |

### Insertion
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/insertion/stages` | Liste des stages |
| `GET` | `/api/insertion/partenaires` | Liste des partenaires |
| `POST` | `/api/insertion/stages` | Créer un stage |
| `POST` | `/api/insertion/partenaires` | Créer un partenaire |

### Administration
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/courriers` | Liste des courriers |
| `POST` | `/api/admin/courriers` | Enregistrer un courrier |

### Statistiques
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Stats globales (dashboard) |
| `GET` | `/api/stats/activities` | Activités récentes |
| `GET` | `/api/stats/insertion` | Stats insertion professionnelle |

> Tous les endpoints (sauf `/api/auth/login` et `/api/auth/refresh`) requièrent le header :
> ```
> Authorization: Bearer <token>
> ```

---

## Structure du projet

```
unchk-project/
│
├── frontend/                        # Angular 20 — port 4200
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.scss              # Thème Material + variables UNCHK
│       ├── assets/
│       │   └── unchk-logo.png       # Logo officiel UNCHK
│       ├── environments/
│       │   └── environment.ts       # apiUrl = http://localhost:3000/api
│       └── app/
│           ├── app.component.ts/html/scss   # Splash screen + toasts
│           ├── app.config.ts        # provideAnimationsAsync, JWT interceptor
│           ├── app.routes.ts        # Routes lazy-loaded
│           ├── core/
│           │   ├── guards/          # AuthGuard, RoleGuard
│           │   ├── interceptors/    # JwtInterceptor (inject Bearer token)
│           │   └── services/
│           │       ├── auth.service.ts         # Login, logout, session
│           │       ├── error.service.ts        # Gestion centralisée erreurs HTTP
│           │       └── notification.service.ts # Toasts
│           └── modules/
│               ├── auth/            # login.component.ts/html/scss
│               ├── dashboard/       # dashboard.component.ts/html/scss
│               ├── students/        # students.component.ts/html/scss
│               ├── formations/      # formations.component.ts/html/scss
│               ├── formateurs/      # formateurs.component.ts/html/scss
│               ├── communication/   # communication.component.ts/html/scss
│               ├── insertion/       # insertion.component.ts/html/scss
│               └── admin/           # admin.component.ts/html/scss
│
├── api/                             # Express.js — port 3000
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                 # Point d'entrée, middlewares, routes
│       ├── middleware/
│       │   └── auth.middleware.js   # Vérification JWT
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── student.routes.js
│       │   ├── formation.routes.js
│       │   ├── formateur.routes.js
│       │   ├── communication.routes.js
│       │   ├── insertion.routes.js
│       │   ├── admin.routes.js
│       │   └── stats.routes.js
│       └── utils/
│           └── logger.js
│
└── backend/                         # Spring Boot 3.2 — port 8080
    ├── pom.xml                      # dépendances : iText PDF, Apache POI, Spring Security
    └── src/main/
        ├── resources/
        │   ├── application.properties
        │   └── schema.sql           # Schéma + données initiales
        └── java/sn/uck/
            ├── UckApplication.java
            ├── config/              # SecurityConfig, ApplicationConfig
            ├── controller/          # AuthController, EtudiantController...
            ├── dto/                 # AuthRequest, AuthResponse
            ├── entity/              # Utilisateur, Etudiant, Formation, Formateur, CompteRendu
            ├── exception/           # ResourceNotFoundException, GlobalExceptionHandler
            ├── repository/          # 5 interfaces JpaRepository
            ├── security/            # JwtService, JwtAuthenticationFilter
            └── service/             # AuthService, EtudiantService
```

---

## Charte graphique

Basée sur les couleurs du logo UNCHK :

| Variable CSS | Valeur | Usage |
|---|---|---|
| `--unchk-blue` | `#1565c0` | Couleur principale, boutons, liens |
| `--unchk-green` | `#2e7d32` | Accent, succès, formations |
| `--unchk-orange` | `#e65100` | Avertissements, highlights |
| `--unchk-navy` | `#0d2137` | Textes titres, sidenav |

---

## Notes techniques

**Angular 20 — points clés**
- Tous les composants sont **standalone** (`standalone: true`)
- Chaque composant est séparé en **3 fichiers** : `.ts`, `.html`, `.scss`
- Routing **lazy-loaded** avec `loadComponent()`
- `provideAnimationsAsync()` au lieu de `provideAnimations()`
- `moduleResolution: "bundler"` dans `tsconfig.json`

**Gestion des erreurs HTTP**
- Le `JwtInterceptor` injecte le token Bearer sur chaque requête
- Le `ErrorService` centralise les messages d'erreur selon le code HTTP
- Aucun fallback sur des données locales — toute erreur est affichée à l'utilisateur

**Sécurité**
- Tokens JWT signés avec `HS256`, expiration 24h (configurable)
- Refresh token 7 jours
- Rate limiting sur `/api` (général) et `/api/auth` (renforcé)
- CORS restreint aux origines déclarées dans `.env`
- Helmet.js activé sur l'API Express

---

*Université Numérique Cheikh Hamidou Kane — Année universitaire 2025-2026*
