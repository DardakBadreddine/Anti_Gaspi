# 🔧 Correction Rapide - Erreur 404 Categories

## Problème
Erreur 404 lors du chargement des catégories : `Route introuvable`

## Solutions

### Solution 1 : Redémarrer le Backend (Recommandé)

1. **Arrêter le backend** (Ctrl+C dans le terminal)
2. **Redémarrer le backend** :
```bash
cd anti-gaspi-backend
npm start
```

3. **Vérifier** que vous voyez dans les logs :
```
✅ Database initialized successfully
🔄 Starting migration v2...
✅ Created categories table
✅ Inserted 8 default categories
```

### Solution 2 : Exécuter la Migration Manuellement

Si le redémarrage ne fonctionne pas, exécutez la migration manuellement :

```bash
cd anti-gaspi-backend
node database/migrate_v2.js
```

Puis redémarrez le serveur :
```bash
npm start
```

### Solution 3 : Vérifier que la Route est Chargée

Vérifiez dans les logs du serveur au démarrage qu'il n'y a pas d'erreur de chargement du module `categories.js`.

Si vous voyez une erreur comme :
```
Error: Cannot find module './routes/categories'
```

Cela signifie que le fichier n'existe pas ou qu'il y a une erreur de syntaxe.

### Vérification

Une fois le backend redémarré, testez :
```bash
curl http://localhost:3000/api/categories
```

Vous devriez recevoir une réponse JSON avec 8 catégories.

## Si le Problème Persiste

1. Vérifiez que le fichier `anti-gaspi-backend/routes/categories.js` existe
2. Vérifiez qu'il n'y a pas d'erreurs de syntaxe dans le fichier
3. Vérifiez que la ligne 40 dans `server.js` contient :
   ```javascript
   app.use('/api/categories', createCategoriesRoutes(db));
   ```
