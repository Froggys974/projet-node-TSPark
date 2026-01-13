# Fitness Park API

API REST Node.js/Express + MongoDB pour la gestion de salles de sport, workouts, challenges et gamification.

**GitHub**: https://github.com/Froggys974/projet-node-TSPark

## Stack Technique

- Node.js + Express + TypeScript
- MongoDB + Mongoose (via Docker)
- JWT Authentication (jsonwebtoken)
- bcrypt password hashing
- Docker pour la containerisation

## Installation

```bash
npm install
```

## Configuration

Creer un fichier `.env` a la racine:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitness_park
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
ADMIN_DEFAULT_PASSWORD=Admin123!
```

**Admin par defaut**: Au premier lancement (base vide), un admin est cree automatiquement:
- Email: `admin@fitnesspark.com`
- Password: valeur de `ADMIN_DEFAULT_PASSWORD` ou `Admin123!`

## Docker

**MongoDB en Docker**: La base MongoDB est containerisée avec Docker pour simplifier le setup :

```bash
# Demarrer MongoDB + API en developpement
npm run dev:up
# -> Lance le conteneur MongoDB et l'API Node.js
# -> La base MongoDB est accessible sur mongodb://localhost:27017

# Arreter et nettoyer
npm run down
# -> Arrete les conteneurs et supprime les volumes MongoDB
```

**Configuration Docker**: Le fichier `docker-compose.yaml` defini le service MongoDB avec :
- Image officielle MongoDB
- Port expose: `27017`
- Volume persiste pour les donnees
- Variables d'environnement preconfigurées

## Lancement

```bash
# Mode developpement (avec Docker MongoDB)
npm run dev:up

# Arreter les conteneurs et supprimer les volumes
npm run down

# Build and start
npm run build
npm start
npm run bs # Build + Start
```

# Tests
npm test
npm test -- --watch   # Mode watch (re-run automatique)
npm test tests/unit/controllers (Unit Test Controllers)
```

## CI/CD

Une **GitHub Actions CI** est configurée pour lancer les tests automatiquement :
- ✅ Sur chaque push vers `main` ou `develop`
- ✅ Sur chaque pull request
- ✅ Tests executés avec Node.js 20.x

Fichier de configuration : `.github/workflows/test.yml`

## Methologie de Developpement

Le projet suit un **GitHub Flow** strict :
- Chaque feature/amelioration est developpee sur une nouvelle branche
- Les changements sont integres via Pull Requests avec CI automatique
- Fusion vers `develop` pour l'integration, puis `main` pour la production

## Architecture du Projet

```
src/
  index.ts                    # Point d'entree, configuration Express
  controllers/                # Routes HTTP et logique metier
    auth.controller.ts        # Authentification (register, login)
    user.controller.ts        # Gestion utilisateurs (ADMIN)
    gym.controller.ts         # Gestion salles (GYM_OWNER)
    exercise.controller.ts    # Gestion exercices (ADMIN)
    workout.controller.ts     # Gestion programmes
    ...
  middlewares/
    auth.middleware.ts        # JWT verification + role-based access
    validations.middleware.ts # Validation des donnees
    error.middleware.ts       # Gestion centralisee des erreurs
  models/                     # Interfaces TypeScript
  services/mongoose/
    schema/                   # Schemas Mongoose avec indexes
    services/                 # Couche CRUD (data access)
  types/
    index.ts                  # Enums et interfaces globaux
    express.d.ts              # Extension du type Request
  utils/
    security.utils.ts         # Hachage password, validation
    validation.utils.ts       # Validation email, etc.
```

## Systeme de Roles

L'API utilise 3 roles avec des permissions specifiques:

**USER** (utilisateur standard)
- Creer des workouts prives (sans gym, visibility: private)
- Ne peut PAS utiliser d'equipement dans ses workouts
- Participer aux challenges
- Gerer ses sessions d'entrainement

**GYM_OWNER** (proprietaire de salle)
- Creer et gerer ses salles de sport
- Creer des workouts pour sa gym (avec ou sans equipement)
- L'equipement doit appartenir a la meme gym que le workout
- Gerer les equipements de ses salles
- Creer des challenges pour sa gym

**ADMIN** (administrateur)
- Acces complet a toutes les ressources
- Seul autorise a creer/modifier ExerciseCategory et Exercise
- Gerer les badges
- Approuver/rejeter les salles
- Activer/desactiver les comptes

## Regles Metier Importantes

### Exercises (ADMIN only)
Les exercices sont des types d'activites (pompes, squats, course...) crees uniquement par l'admin. Ils servent de base pour construire des workouts.

### Workouts
- **GYM_OWNER**: DOIT specifier un gymId (sa propre salle)
- **USER**: NE PEUT PAS specifier de gymId, workout automatiquement prive
- **ADMIN**: Peut creer avec ou sans gym

### Workout Steps
- Les steps sont lies a un workout
- L'equipement ne peut etre ajoute que si le workout a un gymId
- L'equipement doit appartenir a la meme gym
- Les USER ne peuvent jamais ajouter d'equipement

### Sessions
- Workflow: PLANNED -> IN_PROGRESS -> COMPLETED/ABANDONED
- Le calcul des calories se fait a la completion

### Badges et Participations
⚠️ **Note**: Les fonctionnalites de badges et de participations aux challenges sont partiellement implementees. Certaines fonctionnalites avancees (attribution automatique de badges, mise a jour des classements en temps reel) ne sont pas totalement operationnelles.

## API Endpoints

### Authentification
```
POST /auth/register/user          Inscription utilisateur
POST /auth/register/gym-owner     Inscription proprietaire salle
POST /auth/login                  Connexion (tous roles)
POST /auth/login/gym-owner        Connexion GYM_OWNER uniquement
POST /auth/login/admin            Connexion ADMIN uniquement
GET  /auth/me                     Profil connecte
```

### Users (ADMIN only)
```
GET    /users                     Liste tous les users
GET    /users/:id                 User par ID
PUT    /users/:id                 Modifier user
DELETE /users/:id                 Supprimer user
POST   /users/:id/activate        Activer compte
POST   /users/:id/deactivate      Desactiver compte
GET    /users/:id/participations  Participations du user
```

### Gyms
```
GET    /gyms                      Liste salles (public)
GET    /gyms/:id                  Salle par ID (public)
POST   /gyms                      Creer salle (GYM_OWNER/ADMIN)
PUT    /gyms/:id                  Modifier (owner/ADMIN)
DELETE /gyms/:id                  Supprimer (ADMIN)
POST   /gyms/:id/approve          Approuver (ADMIN)
POST   /gyms/:id/reject           Rejeter (ADMIN)
```

### Exercise Categories (ADMIN only)
```
GET    /exercise-categories       Liste categories (public)
GET    /exercise-categories/:id   Categorie par ID (public)
POST   /exercise-categories       Creer categorie
PUT    /exercise-categories/:id   Modifier categorie
DELETE /exercise-categories/:id   Supprimer categorie
```

### Equipments
```
GET    /equipments                Liste equipements (public)
GET    /equipments?gymId=xxx      Filtrer par salle
GET    /equipments/:id            Equipement par ID (public)
POST   /equipments                Creer (GYM_OWNER/ADMIN)
PUT    /equipments/:id            Modifier (owner/ADMIN)
DELETE /equipments/:id            Supprimer (owner/ADMIN)
```

### Exercises (ADMIN only pour ecriture)
```
GET    /exercises                 Liste exercices (public)
GET    /exercises?categoryId=xxx  Filtrer par categorie
GET    /exercises/:id             Exercice par ID (public)
POST   /exercises                 Creer exercice (ADMIN)
PUT    /exercises/:id             Modifier (ADMIN)
DELETE /exercises/:id             Supprimer (ADMIN)
```

### Workouts
```
GET    /workouts                  Liste workouts (public)
GET    /workouts/:id              Workout par ID (public)
GET    /workouts/:id/steps        Steps du workout
POST   /workouts                  Creer workout
PUT    /workouts/:id              Modifier (creator/ADMIN)
DELETE /workouts/:id              Supprimer (creator/ADMIN)
```

### Workout Steps
```
GET    /workout-steps/:id         Step par ID
POST   /workout-steps             Creer step
PUT    /workout-steps/:id         Modifier (creator/ADMIN)
DELETE /workout-steps/:id         Supprimer (creator/ADMIN)
```

### Workout Sessions
```
GET    /workout-sessions          Toutes sessions (ADMIN)
GET    /workout-sessions/me       Mes sessions
GET    /workout-sessions/:id      Session par ID
POST   /workout-sessions          Creer session
POST   /workout-sessions/:id/start     Demarrer
POST   /workout-sessions/:id/complete  Terminer
POST   /workout-sessions/:id/abandon   Abandonner
PUT    /workout-sessions/:id      Modifier
DELETE /workout-sessions/:id      Supprimer (ADMIN)
```

### Challenges
```
GET    /challenges                Liste challenges (public)
GET    /challenges/active         Challenges actifs
GET    /challenges/:id            Challenge par ID (public)
POST   /challenges                Creer challenge
PUT    /challenges/:id            Modifier (creator/ADMIN)
DELETE /challenges/:id            Supprimer (creator/ADMIN)
```

### Participations
```
GET    /participations            Liste (ADMIN)
GET    /participations/:id        Par ID
POST   /participations            Rejoindre challenge
POST   /participations/:id/submit Soumettre score
PUT    /participations/:id        Modifier (ADMIN)
DELETE /participations/:id        Quitter
```

### Badges (ADMIN)
```
GET    /badges                    Liste badges (public)
GET    /badges/:id                Badge par ID (public)
POST   /badges                    Creer badge
PUT    /badges/:id                Modifier badge
DELETE /badges/:id                Supprimer badge
```

## Valeurs des Enums

### Difficulty
`beginner`, `intermediate`, `advanced`, `expert`

### ExerciseType
`strength`, `cardio`, `flexibility`, `technique`

### EquipmentType
`barbell`, `dumbbell`, `machine`, `bodyweight`, `cable`, `kettlebell`, `resistance_band`, `other`

### Visibility
`public`, `gym_only`, `private`

### StepType
`exercise`, `rest`, `superset`, `circuit`, `warmup`, `cooldown`

### SessionStatus
`planned`, `in_progress`, `completed`, `abandoned`

### GymStatus
`pending`, `approved`, `rejected`

### Gender
`MALE`, `FEMALE`, `OTHER`

## Use Cases - Exemples d'Utilisation

### 1. ADMIN - Gerer la Plateforme Complète

**Scenario**: Un administrateur gere et controle toute la plateforme. L'ADMIN a **TOUS les pouvoirs** incluant ceux des GYM_OWNER.

```
1. ADMIN se connecte (POST /auth/login/admin)

2. Gere le contenu officiel:
   - Cree les ExerciseCategories (POST /exercise-categories)
   - Ajoute les exercises officiels (POST /exercises)
     (Pompes, Squats, Courses, etc.)
   - Cree et gere les badges (POST /badges)

3. Gere les salles:
   - Approuve/rejette les salles en attente (POST /gyms/:id/approve, POST /gyms/:id/reject)
   - Peut modifier/supprimer n'importe quelle salle (PUT/DELETE /gyms/:id)
   - Peut ajouter des equipements a n'importe quelle salle
   
4. Gere les users:
   - Consulte tous les users (GET /users)
   - Active/desactive les comptes (POST /users/:id/activate, /deactivate)
   - Modifie les informations de n'importe quel user

5. Gere les challenges et workouts:
   - Peut creer/modifier/supprimer n'importe quel challenge
   - Peut creer/modifier/supprimer n'importe quel workout (meme ceux des autres)
   - Peut moderer les participations aux challenges

6. Acces complet en lecture:
   - Voir toutes les sessions d'entrainement
   - Voir tous les classements et participations
   - Consulter les statistiques completes
```

**Classes impliquees**:
- `UserService` : Gestion complete des users et activation
- `GymService` : Approbation et gestion de toutes les salles
- `ExerciseCategoryService` : Creation des categories
- `ExerciseService` : Creation des exercises officiels
- `BadgeService` : Gestion des badges
- `EquipmentService` : Gestion complete de tous les equipements (toutes salles)
- `WorkoutService` : Modification de tous les workouts
- `ChallengeService` : Creation et moderation des defis
- `WorkoutSessionService` : Consultation de toutes les sessions

---

### 2. GYM_OWNER - Creer une Salle et ses Programmes

**Scenario**: Un proprietaire de salle veut setup sa salle avec equipement et programmes.

```
1. GYM_OWNER se connecte (POST /auth/login/gym-owner)
2. Cree sa salle (POST /gyms)
3. Ajoute des equipements (POST /equipments)
   - Chaque equipement est lie a sa salle (gymId)
4. Cree des workouts avec equipement (POST /workouts)
   - Specifie son gymId
   - Peut inclure les equipements de sa salle
5. Creer des challenges pour les members (POST /challenges)
   - Les users peuvent participer (POST /participations)
6. Suit les participations des users (GET /participations?challengeId=xxx)
```

**Classes impliquees**:
- `GymService` : Gestion des salles
- `EquipmentService` : Gestion des equipements par salle
- `WorkoutService` : Workouts avec gymId
- `ChallengeService` : Creation et gestion des defis
- `ChallengeParticipationService` : Suivi des participants

---

### 3. User Standard - Creer un Workout Privé

**Scenario**: Un utilisateur veut creer un programme d'entrainement personnel.

```
1. USER se connecte (POST /auth/login)
2. Recupere la liste des exercises (GET /exercises)
3. Cree un workout PRIVE (POST /workouts)
   - Sans gymId (workout automatiquement prive)
   - Selectionnne les exercices souhaitees
4. Ajoute des steps au workout (POST /workout-steps)
5. Cree une session d'entrainement (POST /workout-sessions)
6. Demarre la session (POST /workout-sessions/:id/start)
7. Termine et voit les calories brulees (POST /workout-sessions/:id/complete)
```

**Classes impliquees**: 
- `UserService` : Gestion du profil utilisateur
- `WorkoutService` : CRUD des workouts
- `WorkoutStepService` : Gestion des etapes
- `WorkoutSessionService` : Suivi des entrainements et calcul calories


## Postman

### Importer la Collection et l'Environnement

1. **Ouvrir Postman**
   - Cliquer sur "Import" en haut à gauche
   - Selectionner "Upload Files"

2. **Importer les fichiers dans cet ordre :**
   - D'abord `Postman_Environment.json` (Variables d'environnement)
   - Puis `Postman_Collection.json` (Collection complète)

3. **Selectionner l'environnement**
   - En haut à droite, dans le dropdown "Environments", selectionner `Postman_Environment`
   - Verifier que les variables sont visibles (icône "eye" en haut)

### Utilisation de la Collection

La collection inclut des exemples complets pour tous les endpoints. Les variables d'environnement se **mettent à jour automatiquement** :

- **`auth_token`** : Sauvegardée automatiquement après login/register
- **`base_url`** : URL de l'API (par défaut `http://localhost:3000`)
- **`userId`** : ID du user connecté (mis à jour automatiquement)

### Workflow Recommandé

1. **Authentification** : Executer un endpoint de login/register
   - Le token JWT est automatiquement sauvegardé dans `auth_token`
   - Les autres endpoints l'utiliseront automatiquement

2. **Utiliser les endpoints**
   - Tous les endpoints protected utilisent `{{auth_token}}` automatiquement
   - Les variables d'environnement se mettent à jour en temps réel

3. **Tester les roles**
   - Des exemples sont fournis pour chaque role (USER, GYM_OWNER, ADMIN)
   - Switcher entre les roles en changeant le token via login


Les tokens JWT sont captures automatiquement apres login/register et stockes dans `auth_token`.

