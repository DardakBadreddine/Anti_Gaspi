# 🔑 Fix JWT_SECRET Error

## ❌ Erreur
```
Error: secretOrPrivateKey must have a value
```

## ✅ Solution

Ajoutez `JWT_SECRET` dans votre fichier `.env` :

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=antigaspi

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (AJOUTEZ CETTE LIGNE)
JWT_SECRET=votre_secret_jwt_tres_securise_ici_changez_moi
```

## 🔐 Générer un Secret Sécurisé

Vous pouvez générer un secret aléatoire avec Node.js :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ou utilisez un secret simple pour le développement (mais changez-le en production) :

```env
JWT_SECRET=anti-gaspi-secret-key-2024-change-in-production
```

## 📝 Étapes

1. Ouvrez `anti-gaspi-backend/.env`
2. Ajoutez la ligne `JWT_SECRET=...`
3. Redémarrez le serveur : `npm start`
