# ✅ Prochaines Étapes - Migration MySQL

## ✅ Étape 1 : Base de données créée
Vous avez créé la base de données `antigaspi`. Parfait !

---

## 📝 Étape 2 : Utiliser l'utilisateur root (WAMP)

Avec WAMP, vous pouvez utiliser directement l'utilisateur `root` de MySQL.

**Pas besoin de créer un utilisateur séparé !** Utilisez simplement `root` dans le fichier `.env`.

---

## ⚙️ Étape 3 : Créer le fichier .env

Créez le fichier `anti-gaspi-backend/.env` avec ce contenu :

```env
# MySQL Configuration (WAMP - utilisant root)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=antigaspi

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Note pour WAMP** : 
- `DB_USER=root` (utilisateur par défaut de WAMP)
- `DB_PASSWORD=` (laissez vide si root n'a pas de mot de passe, sinon mettez le mot de passe)

---

## 📦 Étape 4 : Installer les dépendances

```bash
cd anti-gaspi-backend
npm install mysql2
npm uninstall better-sqlite3
```

---

## 🚀 Étape 5 : Démarrer le serveur

```bash
npm start
```

Le serveur va :
1. Se connecter à MySQL
2. Créer automatiquement toutes les tables
3. Insérer les catégories par défaut
4. Démarrer sur le port 3000

Vous devriez voir :
```
✅ MySQL connection established
✅ Database schema initialized successfully
🚀 Anti-Gaspi API Server
📡 Server running on http://localhost:3000
🗄️  Database: MySQL (antigaspi)
```

---

## 📊 Étape 6 : Migrer les données existantes (Optionnel)

Si vous avez des données dans SQLite que vous voulez migrer :

```bash
npm run migrate
```

Ce script va :
- Lire toutes les données de `database/antigaspi.db`
- Les insérer dans MySQL
- Préserver les IDs et relations

---

## ✅ Vérification

Testez que tout fonctionne :

```bash
curl http://localhost:3000/health
```

Vous devriez recevoir :
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## ⚠️ Important : Modification des Routes

**ATTENTION** : Les routes doivent être modifiées pour utiliser `async/await` car MySQL est asynchrone.

### Exemple de modification nécessaire :

**Avant (SQLite - synchrone) :**
```javascript
router.get('/', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
});
```

**Après (MySQL - asynchrone) :**
```javascript
router.get('/', async (req, res) => {
    try {
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Routes à modifier :
- `routes/auth.js`
- `routes/baskets.js`
- `routes/reservations.js`
- `routes/favorites.js`
- `routes/reviews.js`
- `routes/categories.js`
- `routes/push_tokens.js`

---

## 🐛 Dépannage

### Erreur : "Access denied for user"
- Vérifiez que WAMP est démarré (icône verte dans la barre des tâches)
- Vérifiez le mot de passe root dans `.env` (laissez vide si pas de mot de passe)
- Vérifiez que MySQL est démarré dans WAMP

### Erreur : "Unknown database 'antigaspi'"
- Vérifiez que la base existe : `SHOW DATABASES;`
- Vérifiez le nom dans `.env` correspond

### Erreur : "Connection refused"
- Vérifiez que MySQL est démarré
- Windows : Services → MySQL
- Linux : `sudo systemctl status mysql`
- macOS : `brew services list`

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `MIGRATION-MYSQL.md` - Guide complet
- `RESUME-MIGRATION.md` - Résumé rapide
