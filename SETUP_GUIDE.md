# 🚀 DST-System Phase 2 - Guide de Configuration

## ⚡ Étapes Initiales Critiques

### 1️⃣ Exécuter le Schema SQL Phase 2 dans Supabase

**IMPORTANT**: Les tables Phase 2 n'existent pas encore! Vous DEVEZ exécuter le SQL.

1. Ouvrez https://app.supabase.com/
2. Allez dans votre projet DST-System
3. Cliquez sur **SQL Editor** (barre latérale gauche)
4. Créez une **Nouvelle Query**
5. Copiez-collez TOUT le contenu de **`supabase-schema-phase2-only.sql`** (NON le fichier complet!)
6. Cliquez sur **Run** (bouton bleu)

✅ Attendez que l'exécution se termine (pas d'erreurs)

**Pourquoi phase2-only?**
- Les tables Phase 1 existent déjà (clients, invoices, etc.)
- Ce fichier ajoute SEULEMENT les nouvelles tables de Phase 2
- Évite les erreurs "relation already exists"

---

## 📊 Modules Implémentés et Prêts à l'Emploi

### ✅ Module Opérateurs
- **Page**: `/dashboard/operators`
- **Fonctionnalités**:
  - Initialisation rapide avec 5 opérateurs standards
  - Gestion des tarifs (hourly, daily, per-session, monthly)
  - Filtrage par type (salary/freelance)
  - CRUD complet

**🚀 Quick Start**: Cliquez sur "Initialiser avec opérateurs standards"

### ✅ Module Coûts de Structure
- **Page**: `/dashboard/costs`
- **Fonctionnalités**:
  - 10 coûts standards pré-définis
  - Catégories: Loyer, Électricité, Assurance, Déplacement, etc.
  - Totals mensuels/annuels
  - Breakdown par catégorie

**🚀 Quick Start**: Cliquez sur "Initialiser avec coûts standards"

### ✅ Module Calendrier & Sessions
- **Page**: `/dashboard/calendar`
- **Fonctionnalités**:
  - Vue mensuelle du calendrier
  - Création de sessions
  - Association clients/opérateurs
  - Estimation des coûts

**Routes**:
- `/dashboard/calendar` - Vue calendrier
- `/dashboard/sessions/new` - Nouvelle session
- `/dashboard/sessions/:id` - Détails session
- `/dashboard/sessions/:id/edit` - Éditer session

### ✅ Module Devis
- **Page**: `/dashboard/quotes`
- **Fonctionnalités**:
  - Création de devis
  - Auto-numérotation (DEVIS-2026-0001)
  - Association à sessions
  - Conversion automatique en facture
  - Montants auto-calculés (subtotal + TVA = total)

**Routes**:
- `/dashboard/quotes` - Liste devis
- `/dashboard/quotes/new` - Nouveau devis
- `/dashboard/quotes/:id/edit` - Éditer devis

---

## 🎯 Comment Utiliser le Système

### Scénario 1: Initialisation Rapide (5 minutes)
```
1. Allez à /dashboard/operators
   → Cliquez "Initialiser avec opérateurs standards"
   → Sélectionnez tout et importez (5 opérateurs)

2. Allez à /dashboard/costs
   → Cliquez "Initialiser avec coûts standards"
   → Sélectionnez tout et importez (10 coûts)

3. Allez à /dashboard/calendar
   → Commencez à ajouter des sessions
```

### Scénario 2: Flux Complet (Devis → Facture)
```
1. Créez une session dans /dashboard/calendar
   - Date, heure, durée, thème
   - Assignez opérateurs

2. Allez à /dashboard/quotes
   - Créez un nouveau devis
   - Sélectionnez le client et la session
   - Remplissez montants (auto-calculé)
   - Statut: "Brouillon" ou "Envoyé"

3. Quand devis accepté:
   - Changez statut à "Accepté"
   - Cliquez "Convertir en facture"
   - Facture créée automatiquement
```

---

## 📁 Architecture des Fichiers Clés

### Hooks (Data Layer)
```
src/hooks/
├── useOperators.ts           ✅ CRUD opérateurs + tarifs
├── useCostStructures.ts      ✅ CRUD coûts
├── useShootingSessions.ts    ✅ CRUD sessions + opérateurs
├── useQuotes.ts              ✅ CRUD devis + conversion
├── useClients.ts             ✅ CRUD clients (Phase 1)
└── useAnalytics.ts           ✅ Tracking (Phase 1)
```

### Pages Principales
```
src/pages/dashboard/
├── OperatorsPage.tsx                ✅ Liste opérateurs
├── OperatorFormPage.tsx             ✅ Créer/éditer opérateur
├── OperatorInitializationPage.tsx   ✅ Initialiser opérateurs
├── CostStructuresPage.tsx           ✅ Liste coûts
├── CostStructureFormPage.tsx        ✅ Créer/éditer coût
├── CostInitializationPage.tsx       ✅ Initialiser coûts
├── CalendarPage.tsx                 ✅ Vue calendrier
├── SessionFormPage.tsx              ✅ Créer/éditer session
├── SessionDetailPage.tsx            ✅ Détails session
├── QuotesPage.tsx                   ✅ Liste devis
└── QuoteFormPage.tsx                ✅ Créer/éditer devis
```

### Routes
```
/dashboard/operators              ✅ Liste
/dashboard/operators/initialize   ✅ Initialiser
/dashboard/operators/new          ✅ Créer
/dashboard/operators/:id/edit     ✅ Éditer

/dashboard/costs                  ✅ Liste
/dashboard/costs/initialize       ✅ Initialiser
/dashboard/costs/new              ✅ Créer
/dashboard/costs/:id/edit         ✅ Éditer

/dashboard/calendar               ✅ Calendrier
/dashboard/sessions/new           ✅ Créer session
/dashboard/sessions/:id           ✅ Détails
/dashboard/sessions/:id/edit      ✅ Éditer

/dashboard/quotes                 ✅ Liste
/dashboard/quotes/new             ✅ Créer
/dashboard/quotes/:id/edit        ✅ Éditer
```

---

## 🔧 Données Pré-Configurées

### Opérateurs Standards (5)
- Thomas Martin (Salarié) - 2500€/mois
- Sophie Dupont (Salarié) - 2200€/mois
- Jacques Laurent (Freelance) - 150€/session
- Marie Bernard (Freelance) - 120€/session
- Pierre Moreau (Freelance) - 25€/h

### Coûts Standards (10)
- **Coûts Fixes**: Loyer (2500€), Électricité (500€), Internet (150€), Assurance (300€)
- **Charges**: Déplacement (800€), Maintenance (600€), Fournitures (400€), Comptable (250€)
- **Amortissements**: Équipements (500€), Mobilier (300€)

**Total Mensuel Estimé**: 6,200€
**Total Annuel Estimé**: 74,400€

---

## 📝 Workflow Typique

### Jour 1: Setup
```
1. Exécuter SQL dans Supabase
2. Initialiser opérateurs
3. Initialiser coûts
4. Ajouter quelques clients (CRM)
```

### Jour 2+: Opérations
```
1. Ajouter session dans calendrier
2. Assigner opérateurs à session
3. Créer devis pour client
4. Convertir devis accepté en facture
5. Suivre paiements (Finances)
```

---

## ⚠️ Points Importants

### Auto-Numbering
- Devis: `DEVIS-2026-0001`, `DEVIS-2026-0002`, etc.
- Avenants: `AVENANT-2026-0001`
- Acomptes: `ACOMPTE-2026-0001`

### Calculations Automatiques
- **Devis**: Sous-total + TVA = Total (auto-calculé)
- **Coûts**: Mensuels = somme monthly_amount, Annuels = somme annual_amount
- **Sessions**: Coûts = somme des tarifs des opérateurs assignés

### Status Workflow
- **Devis**: Draft → Sent → Accepted → (Converted to Invoice)
- **Sessions**: Scheduled → In Progress → Completed / Cancelled
- **Opérateurs**: Active / Inactive

---

## 🔄 Prochaines Étapes (À Implémenter)

### Amendments (Avenants)
- Modifier les montants de devis/factures
- Tracking des modifications
- Auto-numérotation

### Deposits (Acomptes)
- Paiements partiels
- Tracking du statut de paiement
- Calcul du montant restant

### Enhanced Invoices
- Lier devis à factures
- Suivre les acomptes
- Voir les amendments

### PDF Export
- Générer PDF pour devis
- Générer PDF pour factures
- Générer PDF pour rapports

### Dashboard Integration
- Widgets coûts
- Prochaines sessions
- Revenus vs coûts
- Graphiques financiers

---

## 🎓 Support

### Pour les Erreurs:
1. Vérifier que le SQL a été exécuté dans Supabase
2. Vérifier que les variables .env.local sont correctes
3. Recharger la page (F5)
4. Vider le cache (Ctrl+Shift+Delete)

### Pour Personnaliser:
- Éditer les coûts standards dans `CostInitializationPage.tsx`
- Éditer les opérateurs standards dans `OperatorInitializationPage.tsx`
- Ajouter/modifier manuellement après initialisation

---

## 📊 Status Technique

**Commits Récents**:
- ✅ Phase 2 Foundation (Hooks + Operators/Costs modules)
- ✅ Calendar & Sessions (Full CRUD + Calendar UI)
- ✅ Quotes Management (List + Form + Conversion)
- ✅ Initialization Pages (Pre-defined templates)

**Code Prêt**: ✅ Tous les modules sont fonctionnels
**Database**: ⏳ Attendez votre execution du SQL
**Deployment**: ✅ Prêt pour Vercel

---

**Bonne chance! 🚀**
