# 🔧 Fix: Images Not Saving

## ✅ Corrections Apportées

### 1. Type de Colonne MySQL
- **Avant** : `TEXT` (limite ~65KB)
- **Après** : `LONGTEXT` (limite ~4GB)
- Colonnes modifiées :
  - `baskets.image_url`
  - `merchants.logo_url`
  - `merchants.cover_image_url`
  - `users.profile_image_url`

### 2. Gestion des Valeurs undefined
- Le wrapper MySQL convertit automatiquement `undefined` → `null`
- Toutes les méthodes (`get`, `all`, `run`) gèrent maintenant les valeurs undefined

### 3. Formatage des Images
- Les images base64 sont correctement formatées avec le préfixe `data:image/jpeg;base64,`
- Vérification que les images ne sont pas vides avant sauvegarde

### 4. Logs de Débogage
- Ajout de logs pour voir si les images sont reçues et sauvegardées

---

## 🔄 Migration des Colonnes Existantes

Si vous avez déjà des tables créées, exécutez :

```bash
node database/migrate-image-columns.js
```

Ou manuellement dans MySQL :

```sql
ALTER TABLE baskets MODIFY COLUMN image_url LONGTEXT;
ALTER TABLE merchants MODIFY COLUMN logo_url LONGTEXT;
ALTER TABLE merchants MODIFY COLUMN cover_image_url LONGTEXT;
ALTER TABLE users MODIFY COLUMN profile_image_url LONGTEXT;
```

---

## 🧪 Test

1. **Redémarrez le serveur** :
```bash
npm start
```

2. **Créez un panier avec une image** depuis l'application

3. **Vérifiez les logs** - vous devriez voir :
```
📸 Image received: data:image/jpeg;base64,... (length: ...)
💾 Saving basket with image: YES (... chars)
✅ Basket created with ID: ..., image saved: YES
```

4. **Vérifiez dans MySQL** :
```sql
SELECT id, title, LENGTH(image_url) as image_size FROM baskets WHERE image_url IS NOT NULL;
```

---

## 🐛 Si les Images Ne Sont Toujours Pas Sauvegardées

1. **Vérifiez que les colonnes sont LONGTEXT** :
```sql
DESCRIBE baskets;
DESCRIBE merchants;
DESCRIBE users;
```

2. **Vérifiez les logs du serveur** pour voir si l'image est reçue

3. **Vérifiez la taille de l'image** - si elle est trop grande, compressez-la côté client

4. **Testez avec une petite image** pour isoler le problème
