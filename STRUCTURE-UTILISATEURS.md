# 📱 Structure des Composants - Plateforme Anti-Gaspi

## 🎯 Vue d'ensemble

L'application sépare les composants selon le **rôle de l'utilisateur** : **Client** (customer) ou **Commerçant** (merchant).

---

## 📂 Structure des Fichiers

### 1. **Point d'Entrée Principal**
📍 `anti-gaspi-app/App.js`
```javascript
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
```
- Enveloppe l'application avec `AuthProvider`
- Charge le `AppNavigator` qui gère la navigation selon le rôle

---

### 2. **Contexte d'Authentification**
📍 `anti-gaspi-app/contexts/AuthContext.js`

**Déclaration du contexte :**
```javascript
const AuthContext = createContext();
export const useAuth = () => { ... };
export const AuthProvider = ({ children }) => { ... };
```

**État géré :**
- `user` : Objet utilisateur avec `role` ('customer' ou 'merchant')
- `token` : Token d'authentification
- `isAuthenticated` : Boolean

**Méthodes disponibles :**
- `login(email, password)`
- `register(userData)`
- `logout()`
- `update(userData)`
- `deleteAccount()`

---

### 3. **Navigation Principale**
📍 `anti-gaspi-app/navigation/AppNavigator.js`

#### **Ligne 224 : Décision du Rôle**
```javascript
user?.role === 'customer' ? (
    // Navigation CLIENT
) : (
    // Navigation COMMERÇANT
)
```

#### **🔵 Navigation CLIENT (Lignes 17-26, 38-115, 224-232)**

**Écrans importés (Lignes 17-26) :**
```javascript
// Customer screens
import SearchScreen from '../screens/customer/SearchScreen';
import BasketDetailsScreen from '../screens/customer/BasketDetailsScreen';
import ReservationsScreen from '../screens/customer/ReservationsScreen';
import ReservationDetailScreen from '../screens/customer/ReservationDetailScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import MapScreen from '../screens/customer/MapScreen';
import ShopDetailScreen from '../screens/customer/ShopDetailScreen';
import ReviewScreen from '../screens/customer/ReviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
```

**Onglets Client déclarés (Lignes 38-115) :**
```javascript
const CustomerTabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Search" component={SearchScreen} />        // Accueil
            <Tab.Screen name="Favorites" component={FavoritesScreen} /> // Favoris
            <Tab.Screen name="Reservations" component={ReservationsScreen} /> // Réservations
            <Tab.Screen name="Map" component={MapScreen} />            // Carte
            <Tab.Screen name="Profile" component={ProfileScreen} />       // Profil
        </Tab.Navigator>
    );
};
```

**Stack Navigation Client (Lignes 226-232) :**
```javascript
<Stack.Navigator>
    <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
    <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
    <Stack.Screen name="BasketDetails" component={BasketDetailsScreen} />
    <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} />
    <Stack.Screen name="Review" component={ReviewScreen} />
</Stack.Navigator>
```

#### **🟢 Navigation COMMERÇANT (Lignes 28-32, 117-185, 234-251)**

**Écrans importés (Lignes 28-32) :**
```javascript
// Merchant screens
import AddBasketScreen from '../screens/merchant/AddBasketScreen';
import MerchantBasketsScreen from '../screens/merchant/MerchantBasketsScreen';
import ScannerScreen from '../screens/merchant/ScannerScreen';
import MerchantReservationsScreen from '../screens/merchant/MerchantReservationsScreen';
```

**Onglets Commerçant déclarés (Lignes 117-185) :**
```javascript
const MerchantTabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="MerchantBaskets" component={MerchantBasketsScreen} /> // Mes Paniers
            <Tab.Screen name="Scanner" component={ScannerScreen} />                 // Scanner QR
            <Tab.Screen name="MerchantReservations" component={MerchantReservationsScreen} /> // Réservations
            <Tab.Screen name="Profile" component={ProfileScreen} />                  // Profil
        </Tab.Navigator>
    );
};
```

**Stack Navigation Commerçant (Lignes 235-251) :**
```javascript
<Stack.Navigator>
    <Stack.Screen name="MerchantHome" component={MerchantTabs} />
    <Stack.Screen name="AddBasket" component={AddBasketScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
</Stack.Navigator>
```

---

## 📁 Structure des Dossiers

### **Écrans CLIENT**
📍 `anti-gaspi-app/screens/customer/`

| Fichier | Description |
|---------|-------------|
| `SearchScreen.js` | Recherche de paniers disponibles |
| `BasketDetailsScreen.js` | Détails d'un panier |
| `ReservationsScreen.js` | Liste des réservations |
| `ReservationDetailScreen.js` | Détails d'une réservation |
| `FavoritesScreen.js` | Commerçants favoris |
| `MapScreen.js` | Carte avec paniers |
| `ShopDetailScreen.js` | Détails d'un commerçant |
| `ReviewScreen.js` | Écran d'avis |

### **Écrans COMMERÇANT**
📍 `anti-gaspi-app/screens/merchant/`

| Fichier | Description |
|---------|-------------|
| `AddBasketScreen.js` | Créer un nouveau panier |
| `MerchantBasketsScreen.js` | Liste des paniers du commerçant |
| `ScannerScreen.js` | Scanner QR code pour valider |
| `MerchantReservationsScreen.js` | Réservations reçues |

### **Écrans Partagés**
📍 `anti-gaspi-app/screens/`

| Fichier | Description |
|---------|-------------|
| `ProfileScreen.js` | Profil utilisateur (commun) |
| `auth/LoginScreen.js` | Connexion |
| `auth/RegisterScreen.js` | Inscription |
| `OnboardingScreen.js` | Introduction à l'app |

---

## 🔄 Flux de Navigation

### **Client (customer)**
```
AppNavigator
  └─ CustomerTabs (Onglets)
      ├─ Search (Accueil)
      ├─ Favorites (Favoris)
      ├─ Reservations (Réservations)
      ├─ Map (Carte)
      └─ Profile (Profil)
  └─ Stack Screens
      ├─ ShopDetail
      ├─ BasketDetails
      ├─ ReservationDetail
      └─ Review
```

### **Commerçant (merchant)**
```
AppNavigator
  └─ MerchantTabs (Onglets)
      ├─ MerchantBaskets (Mes Paniers)
      ├─ Scanner (Scanner QR)
      ├─ MerchantReservations (Réservations)
      └─ Profile (Profil)
  └─ Stack Screens
      ├─ AddBasket
      └─ Profile
```

---

## 🎨 Composants Réutilisables
📍 `anti-gaspi-app/components/`

| Composant | Utilisé par |
|-----------|-------------|
| `BasketCard.js` | Client (affichage paniers) |
| `ShopCard.js` | Client (affichage commerçants) |
| `CountdownTimer.js` | Client & Commerçant |
| `Button.js` | Tous |
| `Input.js` | Tous |
| `RatingStars.js` | Client (avis) |
| `ReviewCard.js` | Client (avis) |

---

## 🔌 Services API
📍 `anti-gaspi-app/api/`

| Service | Utilisé par |
|---------|-------------|
| `auth.js` | Tous (authentification) |
| `baskets.js` | Client & Commerçant |
| `reservations.js` | Client & Commerçant |
| `favorites.js` | Client uniquement |
| `reviews.js` | Client uniquement |
| `categories.js` | Commerçant (création panier) |

---

## 🔑 Points Clés

1. **Séparation par rôle** : Ligne 224 dans `AppNavigator.js`
   ```javascript
   user?.role === 'customer' ? <CustomerStack> : <MerchantStack>
   ```

2. **Contexte global** : `AuthContext` fournit `user.role` à toute l'application

3. **Navigation conditionnelle** : Basée sur `user?.role` depuis `AuthContext`

4. **Écrans spécifiques** : 
   - Client : 8 écrans dans `/screens/customer/`
   - Commerçant : 4 écrans dans `/screens/merchant/`

5. **Écrans partagés** : `ProfileScreen`, `LoginScreen`, `RegisterScreen`

---

## 📝 Résumé

| Élément | Client | Commerçant |
|---------|--------|------------|
| **Onglets** | 5 (Search, Favorites, Reservations, Map, Profile) | 4 (Baskets, Scanner, Reservations, Profile) |
| **Écrans Stack** | 4 (ShopDetail, BasketDetails, ReservationDetail, Review) | 1 (AddBasket) |
| **Total Écrans** | 9 | 5 |
| **Dossier** | `/screens/customer/` | `/screens/merchant/` |
