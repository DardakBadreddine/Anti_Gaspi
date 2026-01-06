# 🚀 Comment Lancer l'Application Anti-Gaspi

## Prérequis
- ✅ Backend installé (`anti-gaspi-backend`)
- ✅ Mobile installé (`anti-gaspi-mobile`)
- 📱 App **Expo Go** installée sur votre téléphone (App Store ou Google Play)

---

## 📋 Instructions Étape par Étape

### Étape 1: Trouver Votre Adresse IP

**Ouvrez Command Prompt et tapez:**
```bash
ipconfig
```

**Cherchez "IPv4 Address"** - vous verrez quelque chose comme `192.168.1.100`

---

### Étape 2: Configurer le Mobile

1. Ouvrez: `anti-gaspi-mobile/api/client.js`
2. À la ligne 7, remplacez:
```javascript
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```
Par votre IP (trouvée à l'étape 1):
```javascript
const API_BASE_URL = 'http://VOTRE_IP_ICI:3000/api';
```

---

### Étape 3: Lancer le Backend

**Ouvrez un terminal PowerShell:**
```bash
cd C:\Users\ULTRA PC\Desktop\DevMobile\anti-gaspi-backend
npm start
```

✅ Vous devriez voir:
```
🚀 Anti-Gaspi API Server
📡 Server running on http://localhost:3000
```

**⚠️ Laissez ce terminal ouvert!**

---

### Étape 4: Lancer le Mobile

**Ouvrez un DEUXIÈME terminal PowerShell:**
```bash
cd C:\Users\ULTRA PC\Desktop\DevMobile\anti-gaspi-mobile
npx expo start
```

✅ Vous devriez voir un QR code apparaître

**⚠️ Laissez ce terminal ouvert aussi!**

---

### Étape 5: Ouvrir sur Votre Téléphone

1. Ouvrez l'app **Expo Go** sur votre téléphone
2. Scannez le QR code affiché dans le terminal
3. L'app Anti-Gaspi va se charger! 🎉

---

## 🧪 Test Rapide

### Créer un Compte Commerçant
1. Dans l'app, tapez "Inscription"
2. Sélectionnez "Commerçant 🏪"
3. Remplissez:
   - Nom: Test Merchant
   - Email: merchant@test.com
   - Mot de passe: password123

### Ajouter un Panier
1. Allez dans l'onglet "Ajouter ➕"
2. Créez un panier:
   - Titre: Panier du soir
   - Prix original: 10.00
   - Prix réduit: 3.99
   - Quantité: 5

### Créer un Compte Client
1. Déconnectez-vous
2. Créez un nouveau compte "Client 🛒"
3. Email: customer@test.com
4. Mot de passe: password123

### Réserver un Panier
1. Acceptez la permission de localisation
2. Vous devriez voir le panier du commerçant
3. Tapez dessus et réservez
4. Allez dans "Mes Réservations 📦"
5. Voyez votre QR code!

---

## ❌ En Cas de Problème

### "Cannot connect to server"
- Vérifiez que le backend tourne (terminal 1)
- Vérifiez que vous avez mis la bonne IP dans `api/client.js`
- Vérifiez que téléphone et PC sont sur le même Wi-Fi

### "Port 3000 already in use"
- Le backend tourne déjà, c'est bon!
- OU fermez le terminal et relancez

### "Network error"
- Essayez de redémarrer l'app Expo Go
- Vérifiez votre pare-feu Windows

---

## 🎯 Résumé - 2 Terminaux à Garder Ouverts

**Terminal 1 - Backend:**
```bash
cd anti-gaspi-backend
npm start
```

**Terminal 2 - Mobile:**
```bash
cd anti-gaspi-mobile  
npx expo start
```

C'est tout! Les deux doivent rester ouverts pendant que vous testez l'app. 🚀
