# Instructions de Migration - Numéro Client et Champs Clients

## 🚨 Important

Vous devez exécuter la migration SQL suivante dans Supabase pour que la création de clients fonctionne correctement et que les numéros clients soient générés automatiquement.

## Étapes à Suivre

### 1. Accédez à Supabase
- Allez sur https://supabase.com
- Ouvrez votre projet **precision-point**
- Naviguez vers **SQL Editor**

### 2. Exécutez la Migration
Copez le contenu du fichier `supabase-clients-complete-migration.sql` et collez-le dans l'éditeur SQL, puis cliquez sur **Exécuter**.

Cette migration va :
✅ Ajouter la colonne `customer_number` (numéro client unique)
✅ Ajouter la colonne `learner_count` (nombre d'apprenants)
✅ Ajouter la colonne `structure_type` (type de structure)
✅ Générer des numéros clients aléatoires pour les clients existants
✅ Créer un index pour les recherches rapides par numéro client

### 3. Vérifiez le Résultat

Après la migration :
- ✅ Vous pouvez créer de nouveaux clients
- ✅ Chaque nouveau client reçoit automatiquement un numéro client (8-10 caractères alphanumérique)
- ✅ Les clients existants ont reçu un numéro client généré aléatoirement
- ✅ Le numéro client s'affiche dans le tableau des clients (colonne "N° Client")
- ✅ Le numéro client apparaît sur les devis, factures et communications

## Format du Numéro Client

- **Format** : Alphanumérique aléatoire de 8-10 caractères
- **Exemple** : `7K2M9PX4BQ`, `ABC123XYZ`, `5L8QR2VW1`
- **Affichage** : Préfixé par `N°` → `N°7K2M9PX4BQ`
- **Utilisation** : Suit le client sur tous ses échanges (devis, factures, emails)

## Dépannage

### Erreur : "Could not find the 'learner_count' column"

**Cause** : La migration SQL n'a pas été exécutée

**Solution** : Exécutez la migration SQL (`supabase-clients-complete-migration.sql`) comme décrit ci-dessus

### Ancien Client Sans Numéro

**Cause** : Le client existait avant la migration

**Solution** : La migration génère automatiquement des numéros pour tous les clients existants. Rechargez l'application.

Si vous voyez un client sans numéro après la migration :
1. Éditez le client
2. Sauvegardez-le (un nouveau numéro sera généré)

## Questions ?

Si vous avez des problèmes avec la migration :
1. Vérifiez que vous êtes connecté à Supabase avec le bon projet
2. Vérifiez qu'aucune erreur n'est affichée après l'exécution de la migration
3. Videz le cache de votre navigateur (Ctrl+Shift+Suppr)
4. Rechargez l'application
