# 🔧 Fix: Basket Expiration Logic

## ✅ Corrections Apportées

### 1. **Calcul de Date d'Expiration**
- **Avant** : Calcul JavaScript avec `toISOString()` → problèmes de timezone
- **Après** : Utilisation de `DATE_ADD(NOW(), INTERVAL ? HOUR)` dans MySQL
- **Avantage** : Cohérence timezone, calcul côté serveur

### 2. **Vérifications d'Expiration**
- **Avant** : `expires_at > NOW()` (timezone MySQL locale)
- **Après** : `expires_at > UTC_TIMESTAMP()` (UTC cohérent)
- **Fichiers modifiés** :
  - `routes/baskets.js` - Toutes les requêtes de recherche
  - `routes/reservations.js` - Vérification avant réservation

### 3. **Cleanup Scheduler**
- Ajout de la logique pour masquer automatiquement les paniers expirés
- Les paniers expirés sont maintenant cachés (`visible = 0`) automatiquement

### 4. **Logs de Débogage**
- Ajout de logs pour voir les dates d'expiration calculées
- Vérification de la date réelle sauvegardée en base

---

## 🔍 Changements Techniques

### Création de Panier
```sql
-- AVANT
INSERT INTO baskets (..., expires_at, ...)
VALUES (..., '2024-01-13T12:00:00.000Z', ...)  -- ISO string, peut avoir décalage timezone

-- APRÈS
INSERT INTO baskets (..., expires_at, ...)
VALUES (..., DATE_ADD(NOW(), INTERVAL ? HOUR), ...)  -- MySQL calcule directement
```

### Recherche de Paniers
```sql
-- AVANT
WHERE b.expires_at > NOW()  -- Timezone locale MySQL

-- APRÈS
WHERE b.expires_at > UTC_TIMESTAMP()  -- UTC cohérent
```

### Vérification d'Expiration
```javascript
// AVANT
const expiresAt = new Date(basket.expires_at);
if (expiresAt <= now) { ... }  // Comparaison JavaScript, peut être incorrecte

// APRÈS
// Vérification directe en base de données
SELECT CASE WHEN expires_at <= UTC_TIMESTAMP() THEN 1 ELSE 0 END as is_expired
```

---

## 🧪 Test

1. **Redémarrez le serveur** :
```bash
npm start
```

2. **Créez un panier** avec une durée de 1 heure

3. **Vérifiez les logs** - vous devriez voir :
```
⏰ Creating basket - Now: ..., Expires: ..., Duration: 1h
✅ Basket created with ID: ..., expires_at: ...
```

4. **Vérifiez dans MySQL** :
```sql
SELECT id, title, expires_at, UTC_TIMESTAMP() as now, 
       CASE WHEN expires_at > UTC_TIMESTAMP() THEN 'ACTIVE' ELSE 'EXPIRED' END as status
FROM baskets 
ORDER BY created_at DESC 
LIMIT 5;
```

5. **Attendez 1 minute** - le cleanup devrait masquer les paniers expirés

---

## 🐛 Si les Paniers Sont Toujours Créés Expirés

1. **Vérifiez le timezone MySQL** :
```sql
SELECT @@global.time_zone, @@session.time_zone, NOW(), UTC_TIMESTAMP();
```

2. **Vérifiez les logs** lors de la création d'un panier

3. **Testez avec une durée plus longue** (ex: 24 heures) pour isoler le problème

4. **Vérifiez que `durationHours` est bien passé** dans la requête
