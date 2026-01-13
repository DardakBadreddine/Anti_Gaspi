# 📋 Étapes Détaillées de Migration SQLite → MySQL

## ✅ Checklist de Migration

### Étape 1 : Préparation
- [ ] Installer MySQL Server
- [ ] Créer la base de données MySQL
- [ ] Créer l'utilisateur MySQL avec les permissions

### Étape 2 : Installation des Dépendances
```bash
cd anti-gaspi-backend
npm install mysql2
npm uninstall better-sqlite3
```

### Étape 3 : Configuration
- [ ] Créer/modifier le fichier `.env` avec les credentials MySQL

### Étape 4 : Migration du Schéma
- [ ] Le fichier `schema-mysql.sql` est prêt
- [ ] Exécuter le script d'initialisation

### Étape 5 : Migration des Données (Optionnel)
- [ ] Exécuter `node database/migrate-to-mysql.js` si vous avez des données existantes

### Étape 6 : Modification des Routes
⚠️ **IMPORTANT** : Les routes doivent être modifiées pour utiliser `async/await` car MySQL est asynchrone.

### Étape 7 : Test
- [ ] Démarrer le serveur : `npm start`
- [ ] Tester les endpoints API

---

## 🔧 Commandes MySQL

### Créer la base de données
```sql
CREATE DATABASE antigaspi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Créer l'utilisateur
```sql
CREATE USER 'antigaspi_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON antigaspi.* TO 'antigaspi_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📝 Fichier .env

Créez/modifiez `anti-gaspi-backend/.env` :
```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=antigaspi_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=antigaspi

# Server
PORT=3000
NODE_ENV=development
```

---

## ⚠️ Modifications Nécessaires dans les Routes

Les routes utilisent actuellement l'API synchrone de `better-sqlite3`. Avec MySQL, vous devez utiliser `async/await`.

### Exemple : Avant (SQLite)
```javascript
router.get('/', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
});
```

### Exemple : Après (MySQL)
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

---

## 🚀 Démarrer le Serveur

```bash
npm start
```

Le serveur devrait se connecter à MySQL et démarrer normalement.

---

## 🐛 Dépannage

### Erreur : "Access denied"
- Vérifiez les credentials dans `.env`
- Vérifiez que l'utilisateur MySQL a les bonnes permissions

### Erreur : "Database does not exist"
- Créez la base de données MySQL
- Vérifiez le nom dans `.env`

### Erreur : "Connection refused"
- Vérifiez que MySQL est démarré
- Vérifiez le port dans `.env`
