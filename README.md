# Fitness Park API

API REST Node.js/Express + MongoDB pour la gestion de salles de sport, workouts, challenges et gamification.

## Stack Technique

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication (jsonwebtoken)
- bcrypt password hashing

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

## Lancement

```bash
# Mode developpement (avec Docker MongoDB)
npm run dev:up

# Arreter les conteneurs et supprimer les volumes
npm run down

# Build production
npm run build
npm start

# Tests
npm test
npm test -- --watch   # Mode watch (re-run automatique)
```

## CI/CD

Une **GitHub Actions CI** est configurée pour lancer les tests automatiquement :
- ✅ Sur chaque push vers `main` ou `develop`
- ✅ Sur chaque pull request
- ✅ Tests executés avec Node.js 20.x

Fichier de configuration : `.github/workflows/test.yml`

## Methologie de Developpement

Le projet suit un **GitHub Flow** strict :
- Chaque feature/amelioration est developpee sur une branche dedicace (`feature/xxx`, `fix/xxx`, `improvement/xxx`, etc.)
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

## Postman

### Importer la Collection et l'Environnement

1. **Ouvrir Postman**
   - Cliquer sur "Import" en haut à gauche
   - Selectionner "Upload Files"

2. **Importer les fichiers dans cet ordre :**
   - D'abord `TP_Park_Postman_Environment.json` (Variables d'environnement)
   - Puis `TP_Park_Postman_Collection.json` (Collection complète)

3. **Selectionner l'environnement**
   - En haut à droite, dans le dropdown "Environments", selectionner `TP_Park_Postman_Environment`
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

### Importer les fichiers:
- `TP_Park_Postman_Collection.json` - Collection complete avec exemples
- `TP_Park_Postman_Environment.json` - Variables d'environnement (mise à jour auto)

Les tokens JWT sont captures automatiquement apres login/register et stockes dans `auth_token`.

