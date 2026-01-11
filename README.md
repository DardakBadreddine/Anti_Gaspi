# 🌱 Anti-Gaspi - Application Anti-Gaspillage Alimentaire

## 📖 Description du Projet

**Anti-Gaspi** est une application mobile complète de lutte contre le gaspillage alimentaire, similaire à Too Good To Go. Cette application permet aux commerçants de vendre leurs invendus à prix réduit et aux clients de découvrir et réserver ces paniers anti-gaspi à proximité.

### Objectif du Projet

Ce projet a été développé dans le cadre d'un cours de développement mobile avec React Native. Il démontre l'implémentation de fonctionnalités avancées telles que :
- La géolocalisation en temps réel
- La génération et le scan de QR codes
- Un système de réservation avec compte à rebours
- Une architecture client-serveur complète
- Une authentification sécurisée par rôles (Client/Commerçant)

### Concept

L'application connecte deux types d'utilisateurs :
- **Les Commerçants** : Peuvent créer des paniers avec leurs invendus à prix réduit
- **Les Clients** : Peuvent rechercher, réserver et récupérer ces paniers à proximité

Chaque réservation génère un QR code unique valable pendant 1 heure, permettant au commerçant de valider la récupération du panier.

## 📱 Technologies Utilisées

- **Backend**: Node.js + Express + SQLite
- **Mobile**: React Native + Expo Go
- **Features**: Géolocalisation, QR Codes, Compte à rebours temps réel, Notifications push

## 🚀 Installation

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 14 ou supérieure) - [Télécharger Node.js](https://nodejs.org/)
- **npm** (généralement inclus avec Node.js)
- **Expo CLI** (installé globalement ou via npx)
- **Expo Go** sur votre téléphone mobile (iOS ou Android)
  - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Étapes d'Installation

#### 1. Cloner le Repository

```bash
git clone <url-du-repository>
cd Anti_Gaspi
```

#### 2. Installer les Dépendances du Backend

```bash
cd anti-gaspi-backend
npm install
```

**Note**: Si vous rencontrez des erreurs avec `bcrypt` sur Windows, c'est normal. L'application fonctionnera quand même.

#### 3. Installer les Dépendances du Mobile

```bash
cd ../anti-gaspi-app
npm install
```

## 📋 Configuration Après Clonage

### 1. Configuration de l'API (IMPORTANT)

Avant de lancer l'application mobile, vous devez configurer l'adresse IP du serveur backend :

1. **Trouver votre adresse IP locale** :
   - **Windows** : Ouvrez Command Prompt et tapez `ipconfig`
   - **Mac/Linux** : Ouvrez Terminal et tapez `ifconfig`
   - Cherchez "IPv4 Address" (ex: `192.168.1.100`)

2. **Modifier le fichier de configuration** :
   - Ouvrez `anti-gaspi-app/api/client.js`
   - À la ligne 7, remplacez `192.168.1.100` par votre adresse IP :
   ```javascript
   const API_BASE_URL = 'http://VOTRE_IP_ICI:3000/api';
   ```

### 2. Initialisation de la Base de Données

La base de données SQLite sera créée automatiquement au premier lancement du backend. Si vous souhaitez réinitialiser la base de données :

```bash
cd anti-gaspi-backend
node database/init.js
```

## 🚀 Démarrage de l'Application

### Étape 1 : Lancer le Backend

Ouvrez un terminal et exécutez :

```bash
cd anti-gaspi-backend
npm start
```

Vous devriez voir :
```
🚀 Anti-Gaspi API Server
📡 Server running on http://localhost:3000
```

**⚠️ Laissez ce terminal ouvert pendant toute la durée de l'utilisation de l'application.**

### Étape 2 : Lancer l'Application Mobile

Ouvrez un **nouveau terminal** et exécutez :

```bash
cd anti-gaspi-app
npx expo start
```

Un QR code apparaîtra dans le terminal.

### Étape 3 : Ouvrir sur Votre Téléphone

1. Ouvrez l'application **Expo Go** sur votre téléphone
2. Scannez le QR code affiché dans le terminal
3. L'application Anti-Gaspi va se charger automatiquement

**⚠️ Important** :
- Votre téléphone et votre ordinateur doivent être sur le **même réseau Wi-Fi**
- Les deux terminaux (backend et mobile) doivent rester ouverts

## ✨ Liste Complète des Fonctionnalités

### 🔐 Authentification

#### Pour Tous les Utilisateurs
- **Inscription** : Création de compte avec choix du rôle (Client ou Commerçant)
  - Nom, email, mot de passe
  - Sélection du type de compte lors de l'inscription
  - Validation des données
- **Connexion** : Authentification sécurisée avec email et mot de passe
- **Gestion de session** : 
  - JWT tokens avec expiration de 30 jours
  - Stockage persistant avec AsyncStorage
  - Déconnexion
- **Profil utilisateur** : 
  - Visualisation des informations du compte
  - Modification des données personnelles

### 🛒 Fonctionnalités Client

#### 1. Recherche et Découverte
- **Recherche de paniers** : 
  - Recherche par géolocalisation automatique
  - Filtrage par rayon (2 km, 5 km, 10 km)
  - Affichage des paniers disponibles à proximité
  - Calcul de distance en temps réel (formule Haversine)
- **Carte interactive** : 
  - Visualisation des commerces sur une carte
  - Marqueurs avec nombre de paniers disponibles
  - Navigation vers les détails d'un commerce
  - Bouton de rafraîchissement
  - Affichage de la position de l'utilisateur
- **Détails d'un panier** : 
  - Informations complètes (titre, description, prix)
  - Prix original et prix réduit
  - Quantité disponible
  - Informations du commerçant
  - Distance depuis la position actuelle

#### 2. Réservations
- **Réservation de paniers** : 
  - Réservation en un clic
  - Génération automatique d'un QR code unique (UUID)
  - Validation de la disponibilité en temps réel
- **Gestion des réservations** : 
  - Liste de toutes les réservations actives
  - Détails de chaque réservation
  - Statut de la réservation (en attente, validée, expirée)
- **QR Code de récupération** : 
  - Affichage du QR code unique pour chaque réservation
  - QR code valable pendant 1 heure
  - Code scannable par le commerçant
- **Compte à rebours en temps réel** : 
  - Timer affichant le temps restant (1 heure)
  - Mise à jour chaque seconde
  - Changement de couleur selon l'urgence :
    - Vert : Plus de 30 minutes
    - Jaune : Entre 10 et 30 minutes
    - Rouge : Moins de 10 minutes
  - Expiration automatique après 1 heure

#### 3. Favoris
- **Gestion des favoris** : 
  - Ajouter un commerçant aux favoris
  - Retirer un commerçant des favoris
  - Liste de tous les commerces favoris
- **Actions rapides sur les favoris** : 
  - Appel direct au commerçant
  - Itinéraire vers le commerce
  - Navigation vers les détails du commerce

#### 4. Navigation Client
L'application client dispose de 5 onglets principaux :
- **Accueil** : Recherche et découverte de paniers
- **Favoris** : Liste des commerces favoris
- **Réservations** : Gestion des réservations actives
- **Carte** : Vue cartographique des commerces
- **Profil** : Gestion du compte utilisateur

### 🏪 Fonctionnalités Commerçant

#### 1. Gestion des Paniers
- **Création de paniers** : 
  - Ajout de paniers avec titre et description
  - Définition du prix original
  - Définition du prix réduit
  - Spécification de la quantité disponible
  - Enregistrement automatique avec timestamp
- **Visualisation des paniers** : 
  - Liste de tous les paniers créés
  - Affichage des paniers actifs
  - Informations détaillées (prix, quantité, date de création)
- **Suppression de paniers** : 
  - Suppression des paniers non réservés
  - Protection contre la suppression de paniers réservés

#### 2. Validation des Réservations
- **Scanner QR Code** : 
  - Scanner de QR codes avec la caméra
  - Validation automatique de la réservation
  - Vérification que le QR code appartient au commerçant
  - Marquage de la réservation comme "récupérée"
- **Gestion des réservations** : 
  - Liste de toutes les réservations du commerçant
  - Filtrage par statut (en attente, validée, expirée)
  - Détails de chaque réservation
  - Informations sur le client

#### 3. Navigation Commerçant
L'application commerçant dispose de 4 onglets principaux :
- **Mes Paniers** : Gestion des paniers créés
- **Scanner** : Scanner de QR codes pour validation
- **Réservations** : Liste des réservations
- **Profil** : Gestion du compte commerçant

### 🔧 Fonctionnalités Techniques

#### Géolocalisation
- **Permissions automatiques** : Demande de permission de localisation sur iOS/Android
- **Calcul de distance** : Utilisation de la formule Haversine pour un calcul précis
- **Rayon de recherche** : Rayons ajustables (2 km, 5 km, 10 km, 50 km pour la carte)
- **Mise à jour en temps réel** : Recalcul des distances lors du changement de position

#### QR Codes
- **Génération** : Utilisation de `react-native-qrcode-svg` avec UUID unique
- **Scan** : Utilisation de `expo-camera` avec détection de codes-barres
- **Validation** : Vérification côté serveur de l'appartenance du QR code
- **Sécurité** : Chaque QR code est unique et lié à une réservation spécifique

#### Système de Timer
- **Backend** : Stockage du timestamp d'expiration (created_at + 1h)
- **Frontend** : Calcul du temps restant localement
- **Mise à jour** : Actualisation chaque seconde
- **Nettoyage automatique** : Suppression automatique des paniers expirés toutes les minutes

#### Notifications Push
- **Configuration** : Système Expo Notifications configuré
- **Enregistrement des tokens** : Sauvegarde des tokens de notification
- **Prêt pour les alertes** : Infrastructure prête pour les notifications de nouveaux paniers

#### Base de Données
- **SQLite** : Base de données légère et portable
- **Schéma complet** : Tables pour users, merchants, baskets, reservations, favorites
- **Initialisation automatique** : Création automatique au premier lancement
- **Nettoyage automatique** : Suppression des paniers expirés

#### Sécurité
- **Authentification JWT** : Tokens sécurisés avec expiration
- **Validation des rôles** : Vérification des permissions par rôle
- **Protection des routes** : Middleware d'authentification sur les routes sensibles
- **Validation des données** : Validation côté serveur avec express-validator

## 📂 Structure du Projet

```
Anti_Gaspi/
├── anti-gaspi-backend/          # API Node.js + SQLite
│   ├── routes/                  # Endpoints API
│   │   ├── auth.js              # Authentification (login, register)
│   │   ├── baskets.js           # Gestion des paniers
│   │   ├── reservations.js      # Gestion des réservations
│   │   ├── favorites.js         # Gestion des favoris
│   │   └── push_tokens.js       # Gestion des tokens de notification
│   ├── database/                # Base de données
│   │   ├── schema.sql           # Schéma de la base de données
│   │   ├── init.js              # Initialisation de la base
│   │   ├── seed.js              # Données de test (optionnel)
│   │   └── antigaspi.db         # Fichier SQLite (créé automatiquement)
│   ├── middleware/              # Middleware Express
│   │   └── auth.js            # Middleware d'authentification JWT
│   ├── utils/                   # Utilitaires
│   │   └── geo.js              # Calculs géographiques (Haversine)
│   ├── server.js                # Point d'entrée du serveur
│   └── package.json             # Dépendances backend
│
├── anti-gaspi-app/               # Application React Native
│   ├── api/                     # Services API
│   │   ├── client.js           # Configuration Axios
│   │   ├── auth.js             # API d'authentification
│   │   ├── baskets.js          # API des paniers
│   │   ├── reservations.js     # API des réservations
│   │   └── favorites.js        # API des favoris
│   ├── screens/                 # Écrans de l'application
│   │   ├── auth/               # Écrans d'authentification
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── customer/           # Écrans client
│   │   │   ├── SearchScreen.js
│   │   │   ├── BasketDetailsScreen.js
│   │   │   ├── ReservationsScreen.js
│   │   │   ├── ReservationDetailScreen.js
│   │   │   ├── FavoritesScreen.js
│   │   │   ├── MapScreen.js
│   │   │   └── ShopDetailScreen.js
│   │   ├── merchant/           # Écrans commerçant
│   │   │   ├── AddBasketScreen.js
│   │   │   ├── MerchantBasketsScreen.js
│   │   │   ├── MerchantReservationsScreen.js
│   │   │   └── ScannerScreen.js
│   │   └── ProfileScreen.js
│   ├── components/              # Composants réutilisables
│   │   ├── BasketCard.js
│   │   ├── ShopCard.js
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── CountdownTimer.js
│   │   └── LocationPicker.js
│   ├── navigation/              # Navigation
│   │   └── AppNavigator.js     # Navigation par rôles
│   ├── contexts/                # Contextes React
│   │   └── AuthContext.js      # Contexte d'authentification
│   ├── hooks/                   # Hooks personnalisés
│   │   └── usePushNotifications.js
│   ├── utils/                   # Utilitaires
│   │   ├── location.js         # Gestion de la géolocalisation
│   │   └── distance.js         # Calculs de distance
│   ├── constants/               # Constantes
│   │   └── theme.ts            # Thème de l'application
│   ├── App.js                   # Point d'entrée de l'app
│   └── package.json             # Dépendances mobile
│
├── DEMARRAGE-RAPIDE.md          # Guide de démarrage rapide
├── LANCER-APP.md                # Instructions détaillées de lancement
└── README.md                    # Ce fichier
```

## 🎨 Design et Interface

- **Thème écologique** : Vert vibrant (#22c55e) pour symboliser l'écologie
- **Gradients modernes** : Design moderne et attrayant
- **Ombres et coins arrondis** : Interface iOS/Android native
- **Animations fluides** : Transitions et animations optimisées
- **Responsive** : Adaptation à différentes tailles d'écran
- **Navigation intuitive** : Navigation par onglets adaptée au rôle utilisateur

## 📖 Documentation Complémentaire

- [README Backend](anti-gaspi-backend/README.md) - Documentation détaillée de l'API
- [Guide de Démarrage Rapide](DEMARRAGE-RAPIDE.md) - Instructions rapides pour lancer l'app
- [Guide de Lancement](LANCER-APP.md) - Instructions détaillées étape par étape

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription (Client ou Commerçant)
- `POST /api/auth/login` - Connexion

### Paniers
- `GET /api/baskets` - Liste des paniers (params: lat, lng, radius)
- `GET /api/baskets/:id` - Détails d'un panier
- `POST /api/baskets` - Créer un panier (merchant uniquement)
- `DELETE /api/baskets/:id` - Supprimer un panier (merchant uniquement)

### Réservations
- `POST /api/reservations` - Créer une réservation (customer uniquement)
- `GET /api/reservations/user` - Réservations de l'utilisateur (customer)
- `GET /api/reservations/merchant` - Réservations du commerçant (merchant)
- `POST /api/reservations/validate` - Valider un QR code (merchant uniquement)

### Favoris
- `GET /api/favorites` - Liste des favoris de l'utilisateur
- `POST /api/favorites` - Ajouter un commerçant aux favoris
- `DELETE /api/favorites/:merchant_id` - Retirer un favori
- `GET /api/favorites/check/:merchant_id` - Vérifier si un commerçant est favori

### Notifications
- `POST /api/push-tokens` - Enregistrer un token de notification

### Santé
- `GET /health` - Vérification de l'état du serveur

## 🧪 Scénario de Test Complet

### 1. Créer un Compte Commerçant
1. Ouvrez l'application
2. Allez sur "Inscription"
3. Sélectionnez "Commerçant 🏪"
4. Remplissez :
   - Nom : Test Merchant
   - Email : merchant@test.com
   - Mot de passe : password123
5. Validez l'inscription

### 2. Créer un Panier (Commerçant)
1. Connectez-vous avec le compte commerçant
2. Allez dans l'onglet "Mes Paniers"
3. Cliquez sur "Ajouter un panier"
4. Remplissez :
   - Titre : Panier du soir
   - Description : Panier avec produits frais
   - Prix original : 10.00
   - Prix réduit : 3.99
   - Quantité : 5
5. Validez la création

### 3. Créer un Compte Client
1. Déconnectez-vous
2. Créez un nouveau compte "Client 🛒"
3. Email : customer@test.com
4. Mot de passe : password123

### 4. Rechercher et Réserver (Client)
1. Acceptez la permission de localisation
2. Sur l'écran d'accueil, vous devriez voir le panier créé
3. Cliquez sur le panier pour voir les détails
4. Cliquez sur "Réserver"
5. Allez dans l'onglet "Réservations"
6. Vérifiez que le QR code est affiché
7. Vérifiez que le compte à rebours fonctionne (1 heure)

### 5. Valider la Réservation (Commerçant)
1. Déconnectez-vous et reconnectez-vous avec le compte commerçant
2. Allez dans l'onglet "Scanner"
3. Scannez le QR code affiché sur l'écran du client
4. Vérifiez que la réservation est marquée comme "validée"
5. Allez dans l'onglet "Réservations" pour voir la réservation validée

### 6. Tester les Favoris (Client)
1. Reconnectez-vous avec le compte client
2. Allez sur les détails d'un commerce
3. Ajoutez-le aux favoris
4. Allez dans l'onglet "Favoris"
5. Vérifiez que le commerce apparaît dans la liste

### 7. Tester la Carte (Client)
1. Allez dans l'onglet "Carte"
2. Vérifiez que les commerces apparaissent sur la carte
3. Cliquez sur un marqueur pour voir les détails
4. Testez la navigation vers les détails du commerce

## ⚠️ Points Importants

### Configuration Réseau
- **Même réseau Wi-Fi** : Votre téléphone et votre ordinateur doivent être sur le même réseau Wi-Fi
- **Configuration IP** : Modifiez l'adresse IP dans `anti-gaspi-app/api/client.js` avant de lancer l'application mobile
- **Pare-feu** : Assurez-vous que le port 3000 n'est pas bloqué par votre pare-feu

### Utilisation
- **Expo Go** : Utilisez l'application Expo Go pour tester (pas le navigateur web)
- **Terminaux ouverts** : Les deux terminaux (backend et mobile) doivent rester ouverts pendant l'utilisation
- **Base de données** : La base de données SQLite est créée automatiquement au premier lancement

### Dépannage
- **Erreur de connexion** : Vérifiez que le backend tourne et que l'IP est correcte
- **Port déjà utilisé** : Si le port 3000 est occupé, modifiez `PORT` dans `anti-gaspi-backend/server.js`
- **Erreur bcrypt** : Sur Windows, les erreurs bcrypt sont normales et n'empêchent pas le fonctionnement

## 🔮 Améliorations Futures

- Backend push notifications (alertes nouveaux paniers)
- Upload d'images pour les paniers  
- Système de notes/avis
- Paiement in-app (Stripe)
- Chat commerçant-client
- Dashboard analytics
- Migration PostgreSQL pour production

---

**Créé avec ❤️ pour réduire le gaspillage alimentaire** 🌱
