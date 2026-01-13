# 📊 Diagrammes UML - Plateforme Anti-Gaspi

Ce dossier contient les diagrammes UML de l'application **Plateforme Anti-Gaspi**, générés en PlantUML et conformes aux principes UML.

## 📁 Fichiers Disponibles

### 1. **diagramme-classes.puml**
Diagramme de classes complet représentant l'architecture de l'application.

**Contenu :**
- Package **Authentification** : `AuthContext`, `AuthAPI`
- Package **Modèles de Données** : `Utilisateur`, `Commerçant`, `Panier`, `Réservation`, `Catégorie`, `Favori`, `Avis`, `TokenNotification`
- Package **Services API** : `BasketsAPI`, `ReservationsAPI`, `FavoritesAPI`, `ReviewsAPI`, `APIClient`
- Package **Composants UI** : `BasketCard`, `ShopCard`, `CountdownTimer`, `LocationPicker`, `RatingStars`
- Package **Navigation** : `AppNavigator`, `CustomerTabs`, `MerchantTabs`

**Relations représentées :**
- Relations d'héritage et de composition
- Relations d'association (1-1, 1-n, n-n)
- Relations d'utilisation et de dépendance

### 2. **diagramme-activite.puml**
Diagramme d'activité du processus principal : **Réservation d'un Panier par un Client**.

**Phases du processus :**
1. Authentification de l'utilisateur
2. Recherche de paniers disponibles
3. Affichage des détails du panier
4. Processus de réservation
5. Génération et affichage du QR code
6. Validation par le commerçant
7. Finalisation

### 3. **diagramme-activite-annulation.puml**
Diagramme d'activité du processus : **Annulation d'une Réservation par un Client**.

**Phases du processus :**
1. Accès aux réservations
2. Vérifications préalables (statut, expiration)
3. Confirmation d'annulation
4. Processus d'annulation
5. Notification et mise à jour

### 4. **diagramme-activite-creation-panier.puml**
Diagramme d'activité du processus : **Création d'un Panier par un Commerçant**.

**Phases du processus :**
1. Authentification du commerçant
2. Saisie des informations du panier
3. Sélection d'image
4. Sélection des catégories
5. Validation et envoi
6. Confirmation

## 🚀 Comment Utiliser

### Prérequis
- Un éditeur de texte supportant PlantUML
- Ou un outil en ligne comme [PlantUML Online](http://www.plantuml.com/plantuml/uml/)
- Ou une extension VS Code : "PlantUML"

### Visualisation

#### Option 1 : PlantUML Online
1. Ouvrir [PlantUML Online](http://www.plantuml.com/plantuml/uml/)
2. Copier le contenu d'un fichier `.puml`
3. Coller dans l'éditeur
4. Le diagramme sera généré automatiquement

#### Option 2 : VS Code
1. Installer l'extension "PlantUML"
2. Ouvrir un fichier `.puml`
3. Appuyer sur `Alt + D` pour prévisualiser
4. Ou utiliser la commande "PlantUML: Export Current Diagram"

#### Option 3 : Ligne de commande
```bash
# Installer PlantUML (nécessite Java)
# Sur Windows avec Chocolatey:
choco install plantuml

# Générer une image PNG
plantuml diagramme-classes.puml

# Générer un SVG
plantuml -tsvg diagramme-classes.puml
```

## 📋 Conformité UML

Ces diagrammes respectent les principes UML suivants :

### Diagramme de Classes
- ✅ **Encapsulation** : Attributs privés (-), méthodes publiques (+)
- ✅ **Relations** : Association, Composition, Agrégation, Héritage
- ✅ **Multiplicités** : 1-1, 1-n, n-n correctement représentées
- ✅ **Packages** : Organisation logique par domaines fonctionnels
- ✅ **Notes** : Documentation des contraintes et règles métier

### Diagrammes d'Activité
- ✅ **Nœuds d'activité** : Actions représentées par des rectangles arrondis
- ✅ **Décisions** : Diamants pour les conditions (if/else)
- ✅ **Partitions** : Groupement logique des activités (swimlanes)
- ✅ **Flux de contrôle** : Flèches indiquant l'ordre d'exécution
- ✅ **Points de début/fin** : Cercles noirs et cercles avec point
- ✅ **Notes** : Explications des points critiques

## 🎨 Personnalisation

Les diagrammes utilisent des couleurs cohérentes avec l'application :
- **Vert primaire** (#22c55e) : Actions principales, succès
- **Vert secondaire** (#16a34a) : Actions secondaires
- **Rouge** (#ef4444) : Erreurs, échecs
- **Jaune** (#fbbf24) : Avertissements

Vous pouvez modifier ces couleurs dans les fichiers `.puml` en ajustant les définitions `!define` en haut de chaque fichier.

## 📝 Notes Importantes

1. **Langue** : Tous les diagrammes sont en français conformément à la demande
2. **Complétude** : Les diagrammes couvrent les fonctionnalités principales de l'application
3. **Maintenance** : Mettez à jour les diagrammes lors de modifications importantes de l'architecture
4. **Documentation** : Les notes dans les diagrammes expliquent les règles métier importantes

## 🔄 Mise à Jour

Pour mettre à jour les diagrammes après des modifications du code :
1. Identifier les changements dans l'architecture
2. Modifier les fichiers `.puml` correspondants
3. Régénérer les images si nécessaire
4. Vérifier la cohérence avec le code source

---

**Auteur** : Généré pour Plateforme Anti-Gaspi  
**Date** : 2024  
**Version** : 1.0
