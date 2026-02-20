# 🔧 Modification index.html — Intégration Workflows

## Changement requis

Dans `index.html`, ajouter les imports Workflows APRÈS `engine.js` et AVANT les Views.

### Structure AVANT

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DST-SYSTEM — Pilotage Stratégique</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="img/logo.png" type="image/png">
</head>
<body>

  <div id="app-shell">
    <aside id="sidebar"></aside>
    <main id="main-area">
      <header id="header"></header>
      <section id="content"></section>
    </main>
  </div>

  <!-- Scripts : ordre CRITIQUE -->
  <!-- 1. Couche de données -->
  <script src="js/db.js"></script>
  <!-- 2. Moteur économique -->
  <script src="js/engine.js"></script>
  <!-- 3. Vues (modules fonctionnels) -->
  <script src="js/views/dashboard.js"></script>
  <script src="js/views/clients.js"></script>
  <script src="js/views/offers.js"></script>
  <script src="js/views/sessions.js"></script>
  <script src="js/views/operators.js"></script>
  <script src="js/views/modules.js"></script>
  <script src="js/views/locations.js"></script>
  <script src="js/views/settings.js"></script>
  <!-- 4. Application principale (routeur) -->
  <script src="js/app.js"></script>

</body>
</html>
```

### Structure APRÈS (avec Workflows)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DST-SYSTEM — Pilotage Stratégique</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="img/logo.png" type="image/png">
</head>
<body>

  <div id="app-shell">
    <aside id="sidebar"></aside>
    <main id="main-area">
      <header id="header"></header>
      <section id="content"></section>
    </main>
  </div>

  <!-- Scripts : ordre CRITIQUE -->
  <!-- 1. Couche de données -->
  <script src="js/db.js"></script>

  <!-- 2. Moteur économique -->
  <script src="js/engine.js"></script>

  <!-- 3. WORKFLOWS (NEW) — Couche métier orchestration -->
  <!--
    Workflows = logique métier pure
    Appelable depuis Views, API future, ou scripts
    Sans dépendances UI
  -->
  <script src="js/workflows/mission.workflow.js"></script>
  <script src="js/workflows/capacity.workflow.js"></script>
  <script src="js/workflows/programme.workflow.js"></script>
  <script src="js/workflows/doctrine.workflow.js"></script>
  <script src="js/workflows/index.js"></script>

  <!-- 4. Vues (modules fonctionnels) -->
  <!--
    Views peuvent maintenant utiliser Workflows
    Ex: Workflows.Mission.completeMission(sessionId, status)
  -->
  <script src="js/views/dashboard.js"></script>
  <script src="js/views/clients.js"></script>
  <script src="js/views/offers.js"></script>
  <script src="js/views/sessions.js"></script>
  <script src="js/views/operators.js"></script>
  <script src="js/views/modules.js"></script>
  <script src="js/views/locations.js"></script>
  <script src="js/views/settings.js"></script>

  <!-- 5. Application principale (routeur) -->
  <script src="js/app.js"></script>

</body>
</html>
```

## Points Critiques

### ✓ Ordre d'exécution

```
1. db.js       ← localStorage CRUD
    ↓
2. engine.js   ← calculs métier pure
    ↓
3. workflows/* ← orchestration métier (utilise db + engine)
    ↓
4. views/*.js  ← UI rendering (utilise db + engine + workflows)
    ↓
5. app.js      ← routeur SPA (utilise views + workflows)
```

**Pourquoi cet ordre?**
- `db.js` doit être chargé avant tout (défini DB global)
- `engine.js` dépend de DB (utilise DB.settings.get)
- `workflows/*.js` dépendent de DB + Engine
- `views/*.js` dépendent de DB + Engine + Workflows (optionnel mais mieux)
- `app.js` dépend de Views

### ✗ Erreurs courantes

❌ **Ne PAS charger workflows AVANT engine.js**
```html
<!-- WRONG -->
<script src="js/engine.js"></script>
<script src="js/workflows/mission.workflow.js"></script>  <!-- depends Engine -->
```

❌ **Ne PAS charger workflows APRÈS views.js**
```html
<!-- WRONG -->
<script src="js/views/sessions.js"></script>           <!-- May use Workflows -->
<script src="js/workflows/mission.workflow.js"></script>  <!-- Too late! -->
```

✓ **Bonne pratique**
```html
<!-- CORRECT -->
<script src="js/db.js"></script>
<script src="js/engine.js"></script>
<script src="js/workflows/mission.workflow.js"></script>  <!-- Now available for views -->
<script src="js/views/sessions.js"></script>             <!-- Can use Workflows -->
```

## Différences Visuelles

### Du côté utilisateur
- ✓ **AUCUN changement** : interface identique
- ✓ **AUCUN effet visuel** : pages, boutons, formulaires inchangés
- ✓ **Même fonctionnalités** : logique métier identique

### Du côté développeur
- ✓ **Logique métier centralisée** : réutilisable
- ✓ **Code testable** : workflows sans dépendances UI
- ✓ **Traçable** : chaque workflow retourne résultat structuré
- ✓ **Extensible** : facile ajouter nouveau workflow

## Vérification de l'Intégration

Après modification `index.html`, vérifier dans browser console:

```javascript
// 1. Vérifier Workflows sont définis
console.log(Workflows);
// Output:
// {
//   Mission: MissionWorkflow,
//   Capacity: CapacityWorkflow,
//   Programme: ProgrammeWorkflow,
//   Doctrine: DoctrineWorkflow
// }

// 2. Vérifier chaque domain workflow
console.log(Workflows.Mission.completeMission);
// Output: function(sessionId, newStatus)

console.log(Workflows.Capacity.createOperatorWithCosting);
// Output: function(operatorData)

// 3. Tester un workflow simple
const testAlert = Workflows.Doctrine.generateEconomicAlerts();
console.log(testAlert);
// Output: { success: true, doctrine_alerts: [...], capacity_alerts: [...] }
```

## Migration Checklist

- [ ] Ouvrir `index.html`
- [ ] Ajouter les 5 lignes `<script src="js/workflows/...">` après `engine.js`
- [ ] Vérifier ordre scripts (db → engine → workflows → views → app)
- [ ] Sauvegarder `index.html`
- [ ] Ouvrir app dans browser
- [ ] Vérifier console (pas d'erreurs)
- [ ] Tester un workflow dans console
- [ ] Naviguer dans l'app (toutes les pages)
- [ ] Vérifier localStorage (devtools → Application → Storage)
- [ ] Commit modification dans git

## Notes

- **Pas de refactor Views** : modification index.html seulement
- **Pas de rupture** : code existant reste inchangé
- **Progressif** : Views peuvent adopter Workflows progressivement
- **Réversible** : si problème, simplement commenter les `<script>` workflows
