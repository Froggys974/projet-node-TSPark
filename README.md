# TP Hôpital - Node.js & MongoDB

API REST pour la gestion d'un système de salles d'entraînement et de défis.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev:up
```

## Arrêt

```bash
npm run down
```

## Technologies

- Node.js
- Express
- MongoDB
- TypeScript

## Tests

Ce projet utilise **Jest** comme framework de test.

### Prérequis

Assurez-vous d'avoir installé les dépendances du projet :
```bash
npm install
```

### Lancer les tests

En local :
```bash
npm test
```

Via Docker :
```bash
npm run test:docker
```

### Structure des tests

Les tests sont situés dans le dossier `tests/` à la racine du projet qui miroite la structure du dossier `src/` :

```
tests/
└── unit/                       # Tests unitaires
    └── challengeParticipation.controller.test.ts
```

### Écrire un test

1. Créez un fichier avec l'extension `.test.ts` dans le dossier approprié (ex: `tests/unit/`).
2. Utilisez `describe` pour grouper vos tests et `it` pour définir un cas de test.
3. Pour les contrôleurs et services, nous utilisons des **Mocks** pour isoler le code testé de la base de données.

### Rapports

Le résultat des tests est affiché directement dans la console.
