# Anti-Gaspi Backend

API REST Node.js pour l'application Anti-Gaspi.

## Installation

1. Installer les dépendances :
```bash
cd anti-gaspi-backend
npm install
```

Note: Si vous rencontrez des erreurs avec `bcrypt` sur Windows, c'est normal. L'application fonctionnera quand même.

2. Démarrer le serveur :
```bash
npm start
```

Le serveur démarre sur http://localhost:3000

## Endpoints API

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Baskets
- `GET /api/baskets` - Liste des paniers (params: lat, lng, radius)
- `GET /api/baskets/:id` - Détails d'un panier
- `POST /api/baskets` - Créer un panier (merchant)
- `DELETE /api/baskets/:id` - Supprimer un panier (merchant)

### Reservations
- `POST /api/reservations` - Créer une réservation (customer)
- `GET /api/reservations/user` - Réservations de l'utilisateur (customer)
- `GET /api/reservations/merchant` - Réservations du commerçant (merchant)
- `POST /api/reservations/validate` - Valider un QR code (merchant)

## Base de données

SQLite - fichier `database/antigaspi.db` créé automatiquement au premier lancement.

## Nettoyage automatique

Les paniers expirés (>1h) sont automatiquement supprimés toutes les minutes.
