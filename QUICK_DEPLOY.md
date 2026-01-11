# Guide Rapide - Déploiement et Build

## 🚀 Pour tester rapidement sur un téléphone Android

### 1. Héberger le Backend (5 minutes)

**Option la plus simple : Railway**

1. Aller sur https://railway.app et créer un compte (gratuit)
2. Cliquer sur "New Project" → "Deploy from GitHub repo" (ou "Empty Project")
3. Dans le projet, cliquer sur "New" → "GitHub Repo" (ou uploader le code)
4. Sélectionner le dossier `anti-gaspi-backend`
5. Railway détectera automatiquement Node.js et démarrera le serveur
6. **Copier l'URL** fournie (ex: `https://anti-gaspi-backend-production.up.railway.app`)

### 2. Configurer l'App

1. Dans `anti-gaspi-app/`, créer un fichier `.env` :
   ```
   EXPO_PUBLIC_API_URL=https://votre-url-railway.app/api
   ```

2. Mettre à jour `app.json` :
   ```json
   {
     "expo": {
       "android": {
         "package": "com.antigaspi.app"
       }
     }
   }
   ```

### 3. Créer l'APK

```bash
cd anti-gaspi-app
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Attendre 10-15 minutes, puis télécharger l'APK depuis https://expo.dev

### 4. Installer sur Android

1. Transférer l'APK sur le téléphone
2. Aller dans Paramètres → Sécurité → Autoriser les sources inconnues
3. Ouvrir l'APK et installer

---

## ⚠️ Important : Base de Données

**Pour l'instant, SQLite fonctionne pour les tests**, mais pour la production, il faut migrer vers PostgreSQL.

### Solution temporaire pour tester :
- Le backend Railway peut fonctionner avec SQLite pour les tests
- Les données seront perdues à chaque redémarrage
- **C'est OK pour tester, mais pas pour la production**

### Pour la production :
- Suivre le guide dans `DEPLOYMENT_GUIDE.md` pour migrer vers PostgreSQL

---

## 📱 Pour iOS

1. Avoir un compte Apple Developer (99$/an)
2. Suivre les mêmes étapes mais avec `--platform ios`
3. Utiliser TestFlight pour distribuer

---

## 🔧 Commandes Utiles

```bash
# Voir les builds en cours
eas build:list

# Voir les logs d'un build
eas build:view [BUILD_ID]

# Créer un build local (plus rapide, nécessite Android Studio/Xcode)
eas build --platform android --profile preview --local
```

---

## 🆘 Problèmes Courants

**"Cannot connect to API"**
- Vérifier que `EXPO_PUBLIC_API_URL` est correct
- Vérifier que le backend est accessible (ouvrir l'URL dans un navigateur)
- Vérifier les logs Railway

**"Build failed"**
- Vérifier que tous les assets sont présents
- Vérifier `app.json` pour les erreurs
- Consulter les logs : `eas build:view [BUILD_ID]`

**"App crashes on startup"**
- Vérifier les logs Expo : `expo start --no-dev`
- Vérifier que l'URL de l'API est accessible depuis le téléphone
