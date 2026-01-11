# 🔧 Correction Erreur 500 - Création de Panier

## Problème
Erreur 500 "Erreur serveur interne" lors de la création d'un panier.

## Cause
La colonne `auto_relist` n'existe pas dans la base de données existante.

## Solution

### Option 1 : Redémarrer le Backend (Recommandé)

Le backend ajoute automatiquement la colonne manquante au démarrage. Il suffit de :

1. **Arrêter le backend** (Ctrl+C)
2. **Redémarrer le backend** :
```bash
cd anti-gaspi-backend
npm start
```

Vous devriez voir dans les logs :
```
✅ Added auto_relist column to baskets
```

### Option 2 : Exécuter la Migration Manuellement

Si le redémarrage ne fonctionne pas :

```bash
cd anti-gaspi-backend
node database/migrate_v2.js
```

### Option 3 : Ajouter la Colonne Manuellement (SQL)

Si vous avez accès à la base de données :

```sql
ALTER TABLE baskets ADD COLUMN auto_relist BOOLEAN DEFAULT 0;
```

## Vérification

Après redémarrage, testez la création d'un panier. L'erreur 500 devrait disparaître.

## Améliorations Apportées

1. ✅ Migration automatique de `auto_relist` dans `init.js`
2. ✅ Vérification de sécurité dans la route baskets (ajoute la colonne si elle n'existe pas)
3. ✅ Meilleure gestion d'erreur avec messages détaillés
4. ✅ Support des images base64
