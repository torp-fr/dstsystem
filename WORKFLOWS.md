# 🔄 Workflows Métier — DST-SYSTEM

## Aperçu

La couche **Workflows** est une abstraction métier pure ajoutée au-dessus du code existant.

### Principes
- ✓ **Extraction logique pure** : aucune modification du code existant
- ✓ **Pas de dépendance UI** : workflows restent indépendants des Views
- ✓ **Réutilisable** : peut être appelé depuis Views, API future, ou scripts métier
- ✓ **Testable** : aucun couplage DOM, logique isolée

### Structure

```
js/workflows/
├── index.js                    # Agrégation centralisée
├── mission.workflow.js         # Workflows: MissionEntrainement
├── capacity.workflow.js        # Workflows: CapaciteTerrain
├── programme.workflow.js       # Workflows: ProgrammeEntrainementClient
└── doctrine.workflow.js        # Workflows: DoctrineEntreprise
```

---

## Intégration dans index.html

Ajouter dans `<head>` APRÈS le chargement de `engine.js` et `db.js` :

```html
<!-- Workflows (couche métier) — AVANT app.js -->
<script src="js/workflows/mission.workflow.js"></script>
<script src="js/workflows/capacity.workflow.js"></script>
<script src="js/workflows/programme.workflow.js"></script>
<script src="js/workflows/doctrine.workflow.js"></script>
<script src="js/workflows/index.js"></script>

<!-- Views peuvent maintenant utiliser Workflows -->
<script src="js/views/..."></script>
<script src="js/app.js"></script>
```

**Ordre IMPORTANT** :
1. `db.js` (données)
2. `engine.js` (calculs)
3. `workflows/*.js` (orchestration métier)
4. `views/*.js` (UI)
5. `app.js` (routeur)

---

## Workflows Disponibles

### MISSION ENTRAINEMENT

#### `Workflows.Mission.completeMission(sessionId, newStatus)`

Terminer une mission (passer statut → nouvelle valeur).

**Responsabilités:**
- Mettre à jour statut session
- SI terminée + abonnement → consommer crédit
- SI rollback from terminée → rollback crédit

**Retour:**
```javascript
{
  success: true,
  sessionId: "...",
  previousStatus: "planifiée",
  newStatus: "terminée",
  creditsConsumed: 1,
  creditsRolledBack: 0
}
```

**Utilisation dans sessions.js :**
```javascript
// AVANT (code inline, lignes 674-716):
const justCompleted = (newStatus === 'terminee' && previousStatus !== 'terminee');
if (justCompleted && data.offerId) { ... }

// APRÈS (extraction logique):
const result = Workflows.Mission.completeMission(sessionId, newStatus);
if (!result.success) {
  Toast.show(result.message, 'error');
  return;
}
```

---

#### `Workflows.Mission.deleteMission(sessionId)`

Supprimer une mission avec cleanup abonnement.

**Responsabilités:**
- SI session était terminée + abonnement → rollback crédit
- Supprimer session

**Retour:**
```javascript
{
  success: true,
  sessionId: "...",
  creditsRolledBack: 1
}
```

**Utilisation dans sessions.js :**
```javascript
// AVANT: logique MANQUANTE (BUG!)
DB.sessions.delete(session.id);  // ← pas de rollback abonnement

// APRÈS: logique complète
const result = Workflows.Mission.deleteMission(sessionId);
if (result.success) {
  Toast.show('Session supprimée', 'warning');
  if (result.creditsRolledBack > 0) {
    Toast.show('Crédit abonnement remboursé', 'info');
  }
}
```

---

### CAPACITÉ TERRAIN

#### `Workflows.Capacity.createOperatorWithCosting(operatorData)`

Créer opérateur avec orchestration costing.

**Responsabilités:**
- Décider mode costing (4 branches: tjm, horaire, net, company_max)
- Appeler Engine avec mode approprié
- Snapshot coûts au moment création

**Input:**
```javascript
{
  firstName: "John",
  lastName: "Doe",
  status: "cdi",
  costMode: "net_desired",
  netDaily: 300,
  email: "...",
  specialties: ["Tir", "CQB"],
  active: true
}
```

**Retour:**
```javascript
{
  success: true,
  operator: { id, firstName, lastName, ... },
  costDetails: {
    mode: "net_desired",
    netDaily: 300,
    companyCostDaily: 600,
    chargesPercent: "100.0"
  }
}
```

**Utilisation dans operators.js :**
```javascript
// AVANT: orchestration complexe dans _saveOperator (lignes 1008-1077)
let netDaily = 0;
let companyCostDaily = 0;
if (costMode === 'tjm_facture') { ... }
else if (costMode === 'horaire') { ... }
// ... 4 branches couplées

// APRÈS: appel workflow
const result = Workflows.Capacity.createOperatorWithCosting(formData);
if (!result.success) {
  Toast.show(result.error, 'error');
  return;
}
DB.operators.create(result.operator);
```

---

#### `Workflows.Capacity.arbitrateOperatorStatus(netDaily)`

Comparer 6 statuts pour arbitrer coût optimal.

**Retour:**
```javascript
{
  netDaily: 300,
  scenarios: [
    { status: "cdi", companyCost: 600, ... },
    { status: "freelance", companyCost: 365, ... },
    ...
  ],
  recommendations: {
    cheapestStatus: "freelance",
    cheapestCost: 365
  }
}
```

---

#### `Workflows.Capacity.evaluateOperatorCapacity(operatorId)`

Évaluer charge opérateur et générer alertes.

**Retour:**
```javascript
{
  success: true,
  operator: { id, name, status, companyCostDaily },
  load: {
    sessionsThisMonth: 12,
    sessionsUpcoming: 45,
    dependencyPercent: 35.5
  },
  alerts: [
    { type: "overload", severity: "warning", message: "..." }
  ]
}
```

---

### PROGRAMME ENTRAINEMENT CLIENT

#### `Workflows.Programme.analyzeClientProfitability(clientId)`

Analyser rentabilité d'un client (traverse 3 domaines).

**Retour:**
```javascript
{
  success: true,
  data: {
    clientId: "...",
    clientName: "Gendarmeriate Nationale",
    totalSessions: 15,
    completedSessions: 12,
    totalRevenue: 75000,
    totalCosts: 45000,
    netResult: 30000,
    rentabilityPercent: 40,
    status: "✓ Très rentable"
  }
}
```

**Utilisation dans clients.js :**
```javascript
// AVANT: logique dispersée dans _renderDetail (lignes 253-487)
const profitability = Engine.computeClientProfitability(clientId);

// APRÈS: workflow orchestré
const result = Workflows.Programme.analyzeClientProfitability(clientId);
if (result.success) {
  displayClientScorecard(result.data);
}
```

---

#### `Workflows.Programme.calculateOfferFloor(offerData)`

Calculer tarif plancher d'une offre.

**Input:**
```javascript
{
  moduleIds: ["mod1", "mod2"],
  nbSessions: 3,
  type: "abonnement"
}
```

**Retour:**
```javascript
{
  success: true,
  floorPrice: 4500,
  costBreakdown: {
    modulesCost: 200,
    fixedShare: 412,
    total: 4500
  },
  targetMargin: 30,
  recommendedPrice: 5850
}
```

---

#### `Workflows.Programme.createClientWithProgram(clientData)`

Créer client avec abonnement optionnel.

**Utilisation dans clients.js :**
```javascript
// AVANT: logique dans _openFormModal (lignes 857-906)
DB.clients.create(data);

// APRÈS: workflow
const result = Workflows.Programme.createClientWithProgram(formData);
if (result.success) {
  Toast.show(result.message, 'success');
}
```

---

### DOCTRINE ENTREPRISE

#### `Workflows.Doctrine.validateEconomicPolicy(policyData)`

Valider cohérence configuration économique.

**Retour:**
```javascript
{
  valid: true,
  errors: [],
  warnings: ["PASS < SMIC annuel"]
}
```

---

#### `Workflows.Doctrine.calculatePolicyImpacts(policyData)`

Calculer impacts configuration sur KPIs.

**Retour:**
```javascript
{
  seuilPlancher: { value: 4500, label: "Prix plancher..." },
  pointMort: { value: 50, label: "Sessions break-even..." },
  tresorerie: { value: 150000, label: "Cash flow estimé..." }
}
```

---

#### `Workflows.Doctrine.generateEconomicAlerts()`

Générer alertes économiques globales.

**Retour:**
```javascript
{
  success: true,
  doctrine_alerts: [
    { type: "sessionBelowFloor", severity: "warning", count: 3 },
    { type: "sessionLowMargin", severity: "warning", count: 1 }
  ],
  capacity_alerts: [
    { type: "operatorOverload", severity: "warning", count: 2 }
  ]
}
```

---

## Migration progressif des Views

### Étape 1 : Sessions.js

```javascript
// Dans _openFormModal:save handler (actuellement lignes 693-720)

// AVANT:
if (isEdit) {
  DB.sessions.update(session.id, data);
  Toast.show('Session mise à jour.', 'success');
} else {
  DB.sessions.create(data);
  Toast.show('Session planifiée.', 'success');
}

// Gestion abonnement (BLOC ORCHESTRATION)
const justCompleted = (newStatus === 'terminee' && previousStatus !== 'terminee');
if (justCompleted && data.offerId) {
  const offer = DB.offers.getById(data.offerId);
  if (offer && offer.type === 'abonnement') {
    const consumed = (offer.sessionsConsumed || 0) + 1;
    DB.offers.update(offer.id, { sessionsConsumed: finalConsumed });
  }
}

// APRÈS:
const updateResult = isEdit
  ? DB.sessions.update(session.id, data)
  : DB.sessions.create(data);

// Déléguer orchestration abonnement au workflow
if (updateResult) {
  const workflowResult = Workflows.Mission.completeMission(updateResult.id, data.status);
  if (workflowResult.creditsConsumed > 0) {
    Toast.show('Crédit abonnement consommé', 'info');
  }
}
```

### Étape 2 : Operators.js

```javascript
// Dans _saveOperator (actuellement lignes 1008-1077)

// AVANT: orchestration costing complexe (4 branches)
let netDaily = 0;
let companyCostDaily = 0;
if (costMode === 'tjm_facture') { ... }
else if (costMode === 'horaire') { ... }

// APRÈS: workflow réutilisable
const workflowResult = Workflows.Capacity.createOperatorWithCosting(formData);
if (!workflowResult.success) {
  Toast.show(workflowResult.error, 'error');
  return;
}

// Utiliser résultat workflow
const operator = workflowResult.operator;
overlay.remove();
_renderPage();
```

---

## Avantages de cette couche

1. **Logique métier centralisée** : pas de duplication
2. **Réutilisable** : utilisable par Views, API backend, scripts
3. **Testable** : workflows sont des fonctions pures métier
4. **Documenté** : chaque workflow explique sa responsabilité
5. **Traçable** : retours structurés pour audit
6. **Pas de régression** : Views existant restent inchangées

---

## Points de transition

### Workflows qui traversent domaines

1. **Mission.completeMission** → traverse Mission + Programme
2. **Programme.analyzeClientProfitability** → traverse Programme + Mission + Doctrine
3. **Capacity.createOperatorWithCosting** → traverse Capacité + Doctrine
4. **Programme.calculateOfferFloor** → traverse Programme + Doctrine

Ces workflows sont normaux (métier = inter-domaines).

---

## Prochaines étapes

1. **Phase 1** : Intégrer workflows dans index.html
2. **Phase 2** : Appeler Workflows depuis sessions.js (completeMission, deleteMission)
3. **Phase 3** : Appeler Workflows depuis operators.js (createOperatorWithCosting)
4. **Phase 4** : Appeler Workflows depuis clients.js (analyzeClientProfitability)
5. **Phase 5** : Appeler Workflows depuis offers.js (calculateOfferFloor)

Chaque phase = migration progressive, aucune rupture UI.
