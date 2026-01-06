# TP Park - Node.js & MongoDB

Une API REST complète pour la gestion d'un écosystème de salles d'entraînement sportif, de défis communautaires et de gamification. Ce projet permet de connecter des salles de sport, des propriétaires et des utilisateurs autour de défis sportifs.

## Fonctionnalités

### 👑 Super Admin

Le Super Admin possède les droits globaux sur la plateforme :

- **Gestion des Salles d'Entraînement** : Création, modification, suppression et approbation des demandes d'ouverture de salles. Définition des caractéristiques (capacité, équipements).
- **Gestion des Types d'Exercices** : Ajout et configuration des exercices (nom, description, muscles ciblés).
- **Système de Gamification** : Création dynamique de badges et récompenses virtuelles basées sur des règles d'accomplissement.
- **Modération Utilisateurs** : Gestion des comptes utilisateurs et propriétaires (désactivation, suppression).

### 🏋️ Propriétaire de Salle de Sport

Les gérants de salles peuvent promouvoir leur établissement :

- **Gestion du Profil de la Salle** : Administration des informations (nom, adresse, contact) et description des installations/équipements.
- **Création de Défis Spécifiques** : Proposition de défis liés aux équipements de la salle pour engager la communauté et augmenter le score de l'établissement.

### 🏃 Utilisateur Client

Les sportifs peuvent interagir avec la communauté et suivre leur progression :

- **Création et Partage** : Création de défis personnalisés (objectifs, durée, exercices) à partager avec la communauté.
- **Exploration** : Recherche de défis avec filtres (difficulté, type, durée).
- **Suivi d'Entraînement** : Enregistrement des séances, suivi des statistiques (calories brûlées, progression).
- **Social** : Invitation d'amis, participation à des défis collaboratifs et duels.
- **Récompenses** : Obtention de badges et classement dans les leaderboards.

## Prérequis

- **Docker** & **Docker Compose**
- **Node.js** (v20+ recommandé)
- **NPM**

## Installation

```bash
npm install
```

## Démarrage

Pour lancer l'environnement de développement (Base de données MongoDB + API) :

```bash
npm run dev:up
```

## Arrêt

Pour arrêter les conteneurs Docker :

```bash
npm run down
```

## Tests

Le projet inclut une suite de tests unitaires avec **Jest**.

Pour lancer les tests :

```bash
npm test
```

## Utilisation avec Postman

Un fichier de collection Postman `TP_Park_Postman_Collection.json` est fourni à la racine du projet.

1. **Ouvrez Postman**.
2. Cliquez sur **Import** (en haut à gauche).
3. Glissez-déposez le fichier `TP_Park_Postman_Collection.json`.
4. Assurez-vous que votre serveur tourne (`npm run dev:up`).
5. Vous pouvez maintenant lancer les requêtes depuis la collection importée "TP Park API".
   - La variable `{{baseUrl}}` est configurée par défaut sur `http://localhost:3000`.

## Technologies

- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB (avec Mongoose)
- **Langage** : TypeScript
- **Tests** : Jest

## Auteurs

- **Grondin Florent**
- **VANDERLYNDEN Louis-Martin**
- **DIAWARA Adama**
