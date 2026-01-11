# Guide de Déploiement - Anti-Gaspi

Ce guide explique comment créer des builds Android/iOS et héberger le backend pour tester et publier l'application.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Hébergement du Backend](#hébergement-du-backend)
3. [Migration de la Base de Données](#migration-de-la-base-de-données)
4. [Configuration de l'App pour la Production](#configuration-de-lapp-pour-la-production)
5. [Création des Builds](#création-des-builds)
6. [Publication sur les Stores](#publication-sur-les-stores)

---

## 🔧 Prérequis

### Pour Android
- Compte Expo (gratuit) : https://expo.dev
- Compte Google Play Developer (25$ une fois) : https://play.google.com/console

### Pour iOS
- Compte Expo (gratuit)
- Compte Apple Developer (99$/an) : https://developer.apple.com

### Pour le Backend
- Compte sur un service d'hébergement (Railway, Render, Heroku, etc.)

---

## 🌐 Hébergement du Backend

### Option 1 : Railway (Recommandé - Gratuit au début)

1. **Créer un compte** : https://railway.app
2. **Installer Railway CLI** :
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **Dans le dossier backend** :
   ```bash
   cd anti-gaspi-backend
   railway init
   railway up
   ```
4. **Configurer les variables d'environnement** dans le dashboard Railway :
   - `PORT=3000` (ou le port fourni par Railway)
   - `JWT_SECRET=votre_secret_jwt_aleatoire`
   - `NODE_ENV=production`

5. **Railway fournira une URL** comme : `https://anti-gaspi-backend-production.up.railway.app`

### Option 2 : Render (Gratuit avec limitations)

1. **Créer un compte** : https://render.com
2. **Créer un nouveau "Web Service"**
3. **Connecter votre repository GitHub** ou uploader le code
4. **Configuration** :
   - Build Command : `npm install`
   - Start Command : `node server.js`
   - Environment : `Node`
5. **Variables d'environnement** :
   - `PORT=10000` (Render utilise le port 10000)
   - `JWT_SECRET=votre_secret`
   - `NODE_ENV=production`

### Option 3 : Heroku (Payant après le free tier)

1. **Installer Heroku CLI** : https://devcenter.heroku.com/articles/heroku-cli
2. **Dans le dossier backend** :
   ```bash
   heroku login
   heroku create anti-gaspi-backend
   git push heroku main
   ```
3. **Configurer les variables** :
   ```bash
   heroku config:set JWT_SECRET=votre_secret
   heroku config:set NODE_ENV=production
   ```

---

## 🗄️ Migration de la Base de Données

**⚠️ IMPORTANT** : SQLite n'est pas adapté pour la production. Il faut migrer vers PostgreSQL.

### Étape 1 : Créer une base PostgreSQL

#### Avec Railway
1. Dans le dashboard Railway, ajouter un service "PostgreSQL"
2. Railway créera automatiquement les variables `DATABASE_URL`

#### Avec Render
1. Créer un "PostgreSQL" database
2. Copier la "Internal Database URL"

### Étape 2 : Modifier le Backend

1. **Installer PostgreSQL** :
   ```bash
   cd anti-gaspi-backend
   npm install pg
   ```

2. **Créer un nouveau fichier** `database/postgres.js` :
   ```javascript
   const { Pool } = require('pg');
   const fs = require('fs');
   const path = require('path');

   const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
   });

   // Initialiser la base de données
   async function initializeDatabase() {
       try {
           const schemaPath = path.join(__dirname, 'schema.sql');
           const schema = fs.readFileSync(schemaPath, 'utf8');
           
           // Exécuter le schéma
           await pool.query(schema);
           
           // Insérer les catégories par défaut
           const categories = [
               { name: 'Boulangerie', icon: '🥖', color: '#f59e0b' },
               { name: 'Pâtisserie', icon: '🍰', color: '#ec4899' },
               { name: 'Boucherie', icon: '🍖', color: '#ef4444' },
               { name: 'Épicerie', icon: '🛒', color: '#3b82f6' },
               { name: 'Restaurant', icon: '🍽️', color: '#8b5cf6' },
               { name: 'Fruits & Légumes', icon: '🥬', color: '#22c55e' }
           ];

           for (const cat of categories) {
               await pool.query(
                   'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                   [cat.name, cat.icon, cat.color]
               );
           }

           console.log('✅ Database initialized successfully');
       } catch (error) {
           console.error('❌ Database initialization error:', error);
           throw error;
       }
   }

   module.exports = { pool, initializeDatabase };
   ```

3. **Modifier `server.js`** pour utiliser PostgreSQL au lieu de SQLite :
   ```javascript
   // Remplacer les imports SQLite par PostgreSQL
   const { pool, initializeDatabase } = require('./database/postgres');
   
   // Adapter toutes les requêtes SQLite vers PostgreSQL
   // Exemple : db.prepare(...).all() devient pool.query(...)
   ```

4. **Adapter les requêtes** :
   - SQLite : `db.prepare('SELECT * FROM users').all()`
   - PostgreSQL : `await pool.query('SELECT * FROM users')`

### Étape 3 : Migrer les données (si nécessaire)

Si vous avez des données de test importantes, créez un script de migration :
```javascript
// database/migrate_to_postgres.js
const sqlite3 = require('better-sqlite3');
const { Pool } = require('pg');

const sqliteDb = sqlite3('./antigaspi.db');
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    // Exporter depuis SQLite et importer dans PostgreSQL
    // (Code spécifique selon vos besoins)
}
```

---

## 📱 Configuration de l'App pour la Production

### Étape 1 : Configurer l'URL de l'API

1. **Créer un fichier `.env`** dans `anti-gaspi-app/` :
   ```
   EXPO_PUBLIC_API_URL=https://votre-backend-url.com/api
   ```

2. **Le fichier `api/client.js` utilisera automatiquement cette variable** en production.

### Étape 2 : Mettre à jour `app.json`

```json
{
  "expo": {
    "name": "Anti-Gaspi",
    "slug": "anti-gaspi-app",
    "version": "1.0.0",
    "android": {
      "package": "com.antigaspi.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#22c55e",
        "foregroundImage": "./assets/images/antigaspiLogo.png"
      }
    },
    "ios": {
      "bundleIdentifier": "com.antigaspi.app",
      "buildNumber": "1.0.0"
    }
  }
}
```

### Étape 3 : Installer EAS CLI

```bash
npm install -g eas-cli
eas login
```

---

## 🏗️ Création des Builds

### Build Android (APK pour test)

1. **Configurer EAS** :
   ```bash
   cd anti-gaspi-app
   eas build:configure
   ```

2. **Créer un fichier `eas.json`** :
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

3. **Créer le build** :
   ```bash
   eas build --platform android --profile preview
   ```

4. **Télécharger l'APK** depuis le dashboard Expo : https://expo.dev

5. **Installer sur Android** :
   - Transférer l'APK sur le téléphone
   - Autoriser l'installation depuis des sources inconnues
   - Installer l'APK

### Build iOS (pour test)

1. **Créer le build** :
   ```bash
   eas build --platform ios --profile preview
   ```

2. **Télécharger l'IPA** depuis le dashboard Expo

3. **Installer via TestFlight** (nécessite un compte Apple Developer) :
   - Uploader l'IPA sur App Store Connect
   - Ajouter des testeurs dans TestFlight

### Build de Production

#### Android (AAB pour Google Play)
```bash
eas build --platform android --profile production
```

#### iOS (pour App Store)
```bash
eas build --platform ios --profile production
```

---

## 📦 Publication sur les Stores

### Google Play Store

1. **Créer un compte** : https://play.google.com/console (25$ une fois)

2. **Créer une application** dans la console

3. **Uploader le AAB** généré par EAS

4. **Remplir les informations** :
   - Description
   - Captures d'écran
   - Icône
   - Politique de confidentialité

5. **Soumettre pour révision**

### Apple App Store

1. **Créer un compte** : https://developer.apple.com (99$/an)

2. **Créer l'app** dans App Store Connect

3. **Uploader l'IPA** via Transporter ou Xcode

4. **Remplir les informations** :
   - Description
   - Captures d'écran
   - Politique de confidentialité

5. **Soumettre pour révision**

---

## 🔐 Sécurité en Production

### Backend

1. **Utiliser HTTPS** (automatique avec Railway/Render)
2. **Configurer CORS** correctement :
   ```javascript
   app.use(cors({
       origin: ['https://votre-app.expo.dev', 'exp://'],
       credentials: true
   }));
   ```
3. **Variables d'environnement** :
   - Ne jamais commiter `.env`
   - Utiliser les variables d'environnement du service d'hébergement

### App

1. **Ne pas hardcoder** l'URL de l'API
2. **Utiliser les variables d'environnement** Expo
3. **Valider les tokens** côté serveur

---

## 📝 Checklist de Déploiement

### Backend
- [ ] Backend hébergé et accessible via HTTPS
- [ ] Base de données PostgreSQL configurée
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] Tests de l'API en production

### App
- [ ] `EXPO_PUBLIC_API_URL` configuré
- [ ] `app.json` mis à jour avec les bons identifiants
- [ ] Build créé avec EAS
- [ ] Testé sur un vrai téléphone
- [ ] Icônes et splash screen corrects

### Publication
- [ ] Compte développeur créé (Google Play / App Store)
- [ ] Description et captures d'écran préparées
- [ ] Politique de confidentialité rédigée
- [ ] App soumise pour révision

---

## 🆘 Dépannage

### L'app ne se connecte pas au backend
- Vérifier que `EXPO_PUBLIC_API_URL` est correct
- Vérifier que le backend est accessible depuis internet
- Vérifier les logs du backend

### Erreur de build
- Vérifier que tous les assets sont présents
- Vérifier la configuration dans `app.json`
- Consulter les logs EAS : `eas build:list`

### Base de données vide
- Vérifier que le script d'initialisation s'est exécuté
- Vérifier les logs du backend
- Vérifier la connexion à PostgreSQL

---

## 📚 Ressources

- [Documentation Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Render](https://render.com/docs)
- [Guide PostgreSQL avec Node.js](https://node-postgres.com)

---

**Note** : Pour un déploiement rapide de test, Railway est recommandé car il offre un plan gratuit généreux et une configuration simple.
