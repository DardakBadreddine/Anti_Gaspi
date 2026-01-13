# 🚀 Configuration Rapide avec WAMP

## ✅ Prérequis
- WAMP installé et démarré (icône verte dans la barre des tâches)
- Base de données `antigaspi` créée dans phpMyAdmin

---

## 📝 Étape 1 : Créer la base de données (si pas déjà fait)

1. Ouvrez **phpMyAdmin** (http://localhost/phpmyadmin)
2. Cliquez sur **"Nouvelle base de données"**
3. Nom : `antigaspi`
4. Interclassement : `utf8mb4_unicode_ci`
5. Cliquez sur **"Créer"**

---

## ⚙️ Étape 2 : Créer le fichier .env

Créez `anti-gaspi-backend/.env` :

```env
# MySQL Configuration (WAMP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=antigaspi

# Server
PORT=3000
NODE_ENV=development
```

**Note** : 
- `DB_PASSWORD=` laissez vide si root n'a pas de mot de passe
- Si root a un mot de passe, mettez-le après le `=`

---

## 📦 Étape 3 : Installer les dépendances

```bash
cd anti-gaspi-backend
npm install mysql2
npm uninstall better-sqlite3
```

---

## 🚀 Étape 4 : Démarrer le serveur

```bash
npm start
```

Le serveur va :
- Se connecter à MySQL via WAMP
- Créer automatiquement toutes les tables
- Insérer les catégories par défaut
- Démarrer sur le port 3000

---

## ✅ Vérification

1. **Vérifier que WAMP est démarré** : Icône verte dans la barre des tâches
2. **Tester l'API** :
```bash
curl http://localhost:3000/health
```

Vous devriez recevoir :
```json
{"status":"ok","timestamp":"2024-..."}
```

3. **Vérifier les tables dans phpMyAdmin** :
   - Allez sur http://localhost/phpmyadmin
   - Sélectionnez la base `antigaspi`
   - Vous devriez voir toutes les tables créées

---

## 🐛 Dépannage WAMP

### Erreur : "Connection refused"
- Vérifiez que WAMP est démarré (icône verte)
- Vérifiez que MySQL est démarré dans WAMP (cliquez sur l'icône WAMP → MySQL → Service)

### Erreur : "Access denied"
- Vérifiez le mot de passe root dans `.env`
- Par défaut, WAMP root n'a souvent pas de mot de passe (laissez `DB_PASSWORD=` vide)

### Erreur : "Unknown database"
- Vérifiez que la base `antigaspi` existe dans phpMyAdmin
- Vérifiez le nom dans `.env` correspond

---

## 📊 Migrer les données SQLite (Optionnel)

Si vous avez des données existantes :

```bash
npm run migrate
```

---

## ⚠️ Important : Modifier les Routes

Les routes doivent être modifiées pour utiliser `async/await`. Voir `PROCHAINES-ETAPES.md` pour les détails.
