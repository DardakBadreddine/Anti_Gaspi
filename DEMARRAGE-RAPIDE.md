# 📱 LANCER L'APP - VERSION SIMPLE

## ⚡ ÉTAPES RAPIDES

### 1️⃣ Backend (Terminal 1)
```bash
cd C:\Users\ULTRA PC\Desktop\DevMobile\anti-gaspi-backend
npm start
```
✅ Attend "Server running on http://localhost:3000"

---

### 2️⃣ Mobile (Terminal 2)  
```bash
cd C:\Users\ULTRA PC\Desktop\DevMobile\anti-gaspi-mobile
npx expo start --clear
```
✅ Attend le QR code

---

### 3️⃣ Sur le Téléphone
1. Ouvre **Expo Go** (télécharge depuis Play Store si nécessaire)
2. Scanne le QR code
3. L'app se charge! 🎉

---

## ⚠️ IMPORTANT

**Avant de lancer le mobile, change l'IP:**
- Fichier: `anti-gaspi-mobile/api/client.js` ligne 7
- Trouve ton IP: `ipconfig` dans Command Prompt
- Change `192.168.1.100` par TON IP

---

## ✅ CE QUI FONCTIONNE
- Login / Inscription ✓
- Recherche de paniers ✓  
- Géolocalisation ✓
- QR Codes ✓
- Réservations ✓

## ❌ DÉSACTIVÉ (pour Expo Go)
- Notifications push uniquement

---

**Les deux terminals doivent rester ouverts!**
