# 🎯 Résumé de la Migration SQLite → MySQL

## 📦 Fichiers Créés/Modifiés

### ✅ Fichiers Créés
1. **`MIGRATION-MYSQL.md`** - Guide complet de migration
2. **`anti-gaspi-backend/database/schema-mysql.sql`** - Schéma MySQL
3. **`anti-gaspi-backend/database/mysql-init.js`** - Initialisation MySQL + Wrapper
4. **`anti-gaspi-backend/database/migrate-to-mysql.js`** - Script de migration des données
5. **`anti-gaspi-backend/ETAPES-MIGRATION.md`** - Checklist détaillée

### ✅ Fichiers Modifiés
1. **`anti-gaspi-backend/server.js`** - Utilise maintenant MySQL
2. **`anti-gaspi-backend/package.json`** - `mysql2` au lieu de `better-sqlite3`

---

## 🚀 Étapes Rapides

### 1. Installer MySQL et créer la base
```sql
CREATE DATABASE antigaspi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'antigaspi_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON antigaspi.* TO 'antigaspi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Installer les dépendances
```bash
cd anti-gaspi-backend
npm install mysql2
npm uninstall better-sqlite3
```

### 3. Créer le fichier `.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=antigaspi_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=antigaspi
PORT=3000
```

### 4. Démarrer le serveur
```bash
npm start
```

Le schéma sera créé automatiquement au premier démarrage.

### 5. Migrer les données (si nécessaire)
```bash
npm run migrate
```

---

## ⚠️ Points Importants

### Modification des Routes
Les routes doivent être modifiées pour utiliser `async/await` car MySQL est asynchrone.

**Avant (SQLite - synchrone) :**
```javascript
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
```

**Après (MySQL - asynchrone) :**
```javascript
const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
```

### Routes à Modifier
Tous les fichiers dans `anti-gaspi-backend/routes/` doivent être mis à jour :
- `auth.js`
- `baskets.js`
- `reservations.js`
- `favorites.js`
- `reviews.js`
- `categories.js`
- `push_tokens.js`

---

## 📚 Documentation

- **Guide complet** : `MIGRATION-MYSQL.md`
- **Checklist** : `anti-gaspi-backend/ETAPES-MIGRATION.md`
- **Schéma MySQL** : `anti-gaspi-backend/database/schema-mysql.sql`

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Vérifiez que MySQL est démarré
2. Vérifiez les credentials dans `.env`
3. Vérifiez les logs du serveur
4. Consultez `MIGRATION-MYSQL.md` pour le dépannage
