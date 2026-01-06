# 🌱 Anti-Gaspi - Application Anti-Gaspillage Alimentaire

Application mobile complète permettant aux commerçants de vendre leurs invendus à prix réduit, similaire à Too Good To Go.

## 📱 Technologies

- **Backend**: Node.js + Express + SQLite
- **Mobile**: React Native + Expo Go
- **Features**: Géolocalisation, QR Codes, Compte à rebours temps réel, Notifications push

## 🚀 Démarrage Rapide

### 1. Backend

```bash
cd anti-gaspi-backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:3000`

### 2. Mobile

```bash
cd anti-gaspi-mobile
npm install
```

**IMPORTANT**: Avant de lancer l'app, modifiez `api/client.js`:
- Trouvez votre IP avec `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Remplacez `192.168.1.100` par votre IP

```bash
npx expo start
```

Scannez le QR code avec l'app **Expo Go** sur votre téléphone.

## ✨ Fonctionnalités

### Pour les Clients 🛒
- 🔍 Recherche de paniers dans un rayon de 2-10 km
- 💰 Réservation de paniers à prix cassé
- 📱 QR Code unique pour récupération
- ⏱️ Compte à rebours en temps réel (1h)

### Pour les Commerçants 🏪
- ➕ Ajout de paniers avec prix original et réduit
- 📷 Scanner QR pour valider les retraits
- 📊 Gestion des réservations

## 📋 Fonctionnalités Techniques

✅ **Temps réel critique** - Compte à rebours synchronisé (1 heure)  
✅ **Géolocalisation & Rayon** - Haversine formula pour calcul précis des distances  
✅ **QR Codes** - Génération unique (UUID) et scan caméra  
✅ **Notifications Push** - Système Expo configuré  
✅ **Back-office Commerçant** - Interface dédiée dans l'app  

## 📂 Structure du Projet

```
DevMobile/
├── anti-gaspi-backend/     # API Node.js + SQLite
│   ├── routes/             # Endpoints API
│   ├── database/           # Schéma et init SQLite
│   └── middleware/         # Auth JWT
│
└── anti-gaspi-mobile/      # App React Native
    ├── api/                # Services API
    ├── screens/            # Écrans (customer/merchant)
    ├── components/         # Composants réutilisables
    ├── navigation/         # Navigation par rôles
    └── utils/              # Géolocalisation, notifications
```

## 🔐 Authentification

- Inscription avec choix du rôle (Client ou Commerçant)
- JWT tokens avec expiration 30 jours
- Stockage persistant avec AsyncStorage

## 🗺️ Géolocalisation

- Permissions automatiques iOS/Android
- Calcul de distance avec formule Haversine
- Rayon ajustable : 2 km, 5 km, 10 km

## 📸 QR Codes

- **Génération**: `react-native-qrcode-svg` avec UUID
- **Scan**: `expo-camera` avec détection barcode
- **Validation**: API vérifie le commerçant et marque comme récupéré

## ⏰ Système de Timer

- Backend stocke timestamp d'expiration (`created_at` + 1h)
- Frontend calcule le temps restant localement
- Mise à jour chaque seconde
- Couleur change selon urgence (vert → jaune → rouge)
- Nettoyage automatique des paniers expirés

## 🎨 Design

- Thème écologique avec vert vibrant (#22c55e)
- Gradients modernes
- Ombres et coins arrondis
- Animations fluides
- Responsive

## 📖 Documentation

- [README Backend](anti-gaspi-backend/README.md) - API endpoints
- [README Mobile](anti-gaspi-mobile/README.md) - Structure de l'app
- [Walkthrough](../.gemini/antigravity/brain/934b7e01-1a35-4286-a616-4cf20e9dfe08/walkthrough.md) - Guide complet

## 🧪 Tests

1. **Inscription** - Créer un compte client et un compte commerçant
2. **Ajouter panier** - Commerçant crée un panier
3. **Recherche** - Client cherche des paniers à proximité
4. **Réservation** - Client réserve un panier
5. **QR Code** - Afficher le QR code de réservation
6. **Scanner** - Commerçant scanne et valide
7. **Timer** - Vérifier le compte à rebours

## ⚠️ Important

- Backend et mobile doivent être sur le **même réseau Wi-Fi**
- Modifiez l'IP dans `anti-gaspi-mobile/api/client.js`
- Utilisez **Expo Go** pour tester (pas le navigateur)

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
