# 🔄 Guide de Migration : SQLite → MySQL

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation MySQL](#installation-mysql)
3. [Étapes de Migration](#étapes-de-migration)
4. [Modifications des Fichiers](#modifications-des-fichiers)
5. [Migration des Données](#migration-des-données)
6. [Test et Vérification](#test-et-vérification)

---

## 📦 Prérequis

- Node.js installé
- MySQL Server installé et configuré
- Accès administrateur MySQL
- Backup de votre base de données SQLite actuelle

---

## 🗄️ Installation MySQL

### Windows
1. Télécharger MySQL depuis [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Installer MySQL Server
3. Noter le mot de passe root lors de l'installation

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS
```bash
brew install mysql
brew services start mysql
```

---

## 🔧 Étapes de Migration

### Étape 1 : Créer la Base de Données MySQL

Connectez-vous à MySQL :
```bash
mysql -u root -p
```

Créez la base de données et l'utilisateur :
```sql
CREATE DATABASE antigaspi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'antigaspi_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON antigaspi.* TO 'antigaspi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 2 : Installer les Dépendances

```bash
cd anti-gaspi-backend
npm install mysql2
npm uninstall better-sqlite3
```

### Étape 3 : Créer le Fichier .env

Créez ou modifiez `.env` dans `anti-gaspi-backend/` :
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

### Étape 4 : Modifier les Fichiers

Suivez les instructions dans la section [Modifications des Fichiers](#modifications-des-fichiers)

---

## 📝 Modifications des Fichiers

### 1. Modifier `package.json`

Remplacez `better-sqlite3` par `mysql2` :
```json
{
  "dependencies": {
    "mysql2": "^3.6.5",
    // ... autres dépendances
  }
}
```

### 2. Créer `database/mysql-init.js`

Ce fichier remplace `database/init.js` pour MySQL.

### 3. Créer `database/schema-mysql.sql`

Schéma SQL converti pour MySQL.

### 4. Modifier `server.js`

Remplacer l'initialisation SQLite par MySQL.

### 5. Créer un Wrapper MySQL

Adapter l'API `better-sqlite3` vers `mysql2` pour minimiser les changements dans les routes.

---

## 🔄 Migration des Données

### Option 1 : Migration Automatique (Recommandé)

Utilisez le script `database/migrate-to-mysql.js` fourni.

### Option 2 : Export/Import Manuel

1. Exporter les données SQLite :
```bash
sqlite3 antigaspi.db .dump > export.sql
```

2. Convertir et importer dans MySQL (nécessite des ajustements manuels)

---

## ✅ Test et Vérification

1. Démarrer le serveur :
```bash
npm start
```

2. Vérifier la connexion :
```bash
curl http://localhost:3000/health
```

3. Tester les endpoints API

---

## ⚠️ Notes Importantes

- **Foreign Keys** : MySQL nécessite `InnoDB` pour les clés étrangères
- **AUTO_INCREMENT** : MySQL utilise `AUTO_INCREMENT` au lieu de `AUTOINCREMENT`
- **BOOLEAN** : MySQL utilise `TINYINT(1)` pour les booléens
- **TEXT** : MySQL a différents types TEXT (TEXT, MEDIUMTEXT, LONGTEXT)
- **Transactions** : MySQL nécessite des transactions explicites pour certaines opérations

---

## 🐛 Dépannage

### Erreur de connexion
- Vérifiez les credentials dans `.env`
- Vérifiez que MySQL est démarré : `sudo systemctl status mysql`

### Erreur de permissions
- Vérifiez les privilèges de l'utilisateur MySQL

### Erreur de charset
- Assurez-vous que la base utilise `utf8mb4`
