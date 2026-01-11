# 🔧 Correction Erreur 404 - Favoris

## Problème
Erreur 404 "Route introuvable" lors du clic sur un commerçant favori.

## Solution

### 1. Redémarrer le Backend (OBLIGATOIRE)

La nouvelle route `/api/baskets/merchant/:merchantId` a été ajoutée. **Le backend DOIT être redémarré** pour que cette route soit disponible.

```bash
cd anti-gaspi-backend
npm start
```

Vous devriez voir dans les logs du backend :
```
🚀 Anti-Gaspi API Server
📡 Server running on http://localhost:3000
```

### 2. Vérifier que la Route est Disponible

Après redémarrage, testez la route directement :

```bash
# Dans un navigateur ou avec curl
curl http://localhost:3000/api/baskets/merchant/1
```

Vous devriez voir une réponse JSON avec les données du commerçant et ses paniers.

### 3. Vérifier les Logs

Après redémarrage, quand vous cliquez sur un favori, vous devriez voir dans les logs du backend :

```
📦 GET /api/baskets/merchant/:merchantId - merchantId: 1
```

Et dans les logs de l'app (console Expo) :

```
📡 API Call: GET /baskets/merchant/1
🛍️ Loading shop data for merchantId: 1
✅ Shop data loaded: {...}
```

### 4. Si l'Erreur Persiste

Si après redémarrage l'erreur persiste :

1. **Vérifier l'URL de l'API** :
   - Ouvrir la console Expo
   - Vérifier le log : `🌐 API Base URL: ...`
   - S'assurer que c'est la bonne URL

2. **Vérifier que le Backend écoute** :
   - Vérifier que le backend tourne sur le port 3000
   - Tester `http://localhost:3000/health` dans un navigateur

3. **Vérifier les logs du backend** :
   - Regarder si la requête arrive au backend
   - Si oui, quelle route est appelée
   - Si non, problème de réseau/URL

## Routes Disponibles

- ✅ `GET /api/baskets` - Recherche de paniers
- ✅ `GET /api/baskets/merchant` - Paniers du commerçant connecté (auth requise)
- ✅ `GET /api/baskets/merchant/:merchantId` - Paniers d'un commerçant spécifique (NOUVELLE ROUTE)
- ✅ `GET /api/baskets/:id` - Détails d'un panier

## Note

L'ordre des routes est important. La route `/merchant/:merchantId` doit être définie AVANT `/:id` pour éviter les conflits. C'est déjà le cas dans le code.
