# 📝 Exemple d'Intégration — Workflows

## Cas 1 : Remplacer logique dans sessions.js

### Avant (code actuel)

**Fichier:** `sessions.js`, lignes 693-720 (_openFormModal > save handler)

```javascript
overlay.querySelector('#fm-save').addEventListener('click', () => {
  // ... validation ...

  const previousStatus = session ? session.status : null;
  const newStatus = overlay.querySelector('#fm-status').value;

  const data = {
    date, status: newStatus, clientIds: [clientId], ...
  };

  if (isEdit) {
    DB.sessions.update(session.id, data);
    Toast.show('Session mise à jour.', 'success');
  } else {
    DB.sessions.create(data);
    Toast.show('Session planifiée.', 'success');
  }

  /* BLOC ORCHESTRATION MÉTIER (lignes 701-716) */
  const justCompleted = (newStatus === 'terminee' && previousStatus !== 'terminee');
  if (justCompleted && data.offerId) {
    const offer = DB.offers.getById(data.offerId);
    if (offer && offer.type === 'abonnement') {
      const consumed = (offer.sessionsConsumed || 0) + 1;
      const finalConsumed = Math.min(consumed, offer.nbSessions || 0);
      DB.offers.update(offer.id, { sessionsConsumed: finalConsumed });
    }
  }
  if (isEdit && previousStatus === 'terminee' && newStatus !== 'terminee' && data.offerId) {
    const offer = DB.offers.getById(data.offerId);
    if (offer && offer.type === 'abonnement') {
      DB.offers.update(offer.id, { sessionsConsumed: Math.max((offer.sessionsConsumed || 0) - 1, 0) });
    }
  }

  close();
  _selectedDate = data.date;
  _renderPage();
});
```

### Après (avec Workflows)

```javascript
overlay.querySelector('#fm-save').addEventListener('click', () => {
  // ... validation ...

  const previousStatus = session ? session.status : null;
  const newStatus = overlay.querySelector('#fm-status').value;

  const data = {
    date, status: newStatus, clientIds: [clientId], ...
  };

  // PERSIST session (create ou update)
  const savedSession = isEdit
    ? DB.sessions.update(session.id, data)
    : DB.sessions.create(data);

  if (!savedSession) {
    Toast.show('Erreur lors de la sauvegarde', 'error');
    return;
  }

  // DÉLÉGUER orchestration métier au Workflow
  // (gestion abonnement, transitions statut, etc.)
  const workflowResult = Workflows.Mission.completeMission(
    savedSession.id,
    newStatus
  );

  // Feedback utilisateur basé sur résultat workflow
  if (isEdit) {
    Toast.show('Session mise à jour.', 'success');
  } else {
    Toast.show('Session planifiée.', 'success');
  }

  if (workflowResult.creditsConsumed > 0) {
    Toast.show('Crédit abonnement consommé (1/3)', 'info');
  }

  if (workflowResult.creditsRolledBack > 0) {
    Toast.show('Crédit abonnement remboursé', 'info');
  }

  close();
  _selectedDate = data.date;
  _renderPage();
});
```

**Changements:**
- ✓ Logique abonnement extraite dans `Workflows.Mission.completeMission()`
- ✓ Sessions.js reste simple : create/update + affichage feedback
- ✓ Aucune modification de Views existantes
- ✓ Logique métier testable indépendamment

---

## Cas 2 : Remplacer logique dans sessions.js (suppression)

### Avant (code actuel - BUG!)

**Fichier:** `sessions.js`, lignes 753-758

```javascript
overlay.querySelector('#del-confirm').addEventListener('click', () => {
  DB.sessions.delete(session.id);  // ← BUG: pas de rollback abonnement!
  close();
  _renderPage();
  Toast.show('Session supprimée.', 'warning');
});
```

### Après (avec Workflows)

```javascript
overlay.querySelector('#del-confirm').addEventListener('click', () => {
  // DÉLÉGUER suppression avec cleanup au Workflow
  const workflowResult = Workflows.Mission.deleteMission(session.id);

  if (!workflowResult.success) {
    Toast.show('Erreur lors de la suppression', 'error');
    return;
  }

  close();
  _renderPage();
  Toast.show('Session supprimée.', 'warning');

  // Afficher feedback cleanup
  if (workflowResult.creditsRolledBack > 0) {
    Toast.show('Crédit abonnement remboursé', 'info');
  }
});
```

**Changements:**
- ✓ BUG fixé : rollback abonnement maintenant inclus
- ✓ Logique métier centralisée
- ✓ Sessions.js ne change que l'appel (1 ligne → 1 ligne)

---

## Cas 3 : Remplacer logique dans operators.js

### Avant (code actuel)

**Fichier:** `operators.js`, lignes 1008-1078 (_saveOperator)

```javascript
function _saveOperator(operatorId, overlay) {
  const costMode = overlay.querySelector('input[name="costMode"]:checked').value;
  const rateUnit = overlay.querySelector('input[name="rateUnit"]:checked').value;
  const status = overlay.querySelector('#op-status').value;
  const settings = DB.settings.get();
  const isHourly = rateUnit === 'horaire';

  // ... récupération des inputs ...

  let netDaily = 0;
  let companyCostDaily = 0;
  let hourlyRate = parseFloat(...) || 0;
  let hoursPerDay = parseFloat(...) || 7;
  let tjmFacture = parseFloat(...) || 0;

  // ORCHESTRATION COSTING (4 branches)
  if (costMode === 'tjm_facture') {
    companyCostDaily = tjmFacture;
    var tjmR = Engine.freelanceTjmFacture(tjmFacture, settings);
    netDaily = tjmR.netFreelance;
  } else if (isHourly && hourlyRate > 0) {
    var hrResult = Engine.computeCoutHoraire(hourlyRate, status, hrMode, settings);
    companyCostDaily = hrResult.coutEntrepriseJour;
    netDaily = hrResult.journalierEquivalent;
  } else if (costMode === 'net_desired') {
    netDaily = parseFloat(...) || 0;
    var calcN = Engine.netToCompanyCost(netDaily, status, settings);
    companyCostDaily = calcN ? calcN.companyCost : 0;
  } else if (costMode === 'company_max') {
    companyCostDaily = parseFloat(...) || 0;
    var calcC = Engine.companyCostToNet(companyCostDaily, status, settings);
    netDaily = calcC ? calcC.net : 0;
  }

  const data = { ... netDaily, companyCostDaily, ... };

  if (operatorId) {
    DB.operators.update(operatorId, data);
    Toast.show('Opérateur... mis à jour.', 'success');
  } else {
    DB.operators.create(data);
    Toast.show('Opérateur... créé.', 'success');
  }

  overlay.remove();
  _renderPage();
}
```

### Après (avec Workflows)

```javascript
function _saveOperator(operatorId, overlay) {
  // Récupérer données du formulaire
  const formData = {
    firstName: overlay.querySelector('#op-firstName').value.trim(),
    lastName: overlay.querySelector('#op-lastName').value.trim(),
    status: overlay.querySelector('#op-status').value,
    costMode: overlay.querySelector('input[name="costMode"]:checked').value,
    tjmFacture: parseFloat(overlay.querySelector('#op-tjmFacture').value) || 0,
    hourlyRate: parseFloat(overlay.querySelector('#op-hourlyRate').value) || 0,
    hoursPerDay: parseFloat(overlay.querySelector('#op-hoursPerDay').value) || 7,
    netDaily: parseFloat(overlay.querySelector('#op-netDaily').value) || 0,
    companyCostDaily: parseFloat(overlay.querySelector('#op-companyCostDaily').value) || 0,
    // ... autres champs ...
  };

  // DÉLÉGUER orchestration costing au Workflow
  const workflowResult = Workflows.Capacity.createOperatorWithCosting(formData);

  if (!workflowResult.success) {
    Toast.show(workflowResult.error, 'error');
    return;
  }

  // PERSIST opérateur avec résultat workflow
  if (operatorId) {
    DB.operators.update(operatorId, workflowResult.operator);
    Toast.show(`Opérateur ${workflowResult.operator.firstName} mis à jour.`, 'success');
  } else {
    // Créer (workflow l'a déjà créé, mais peut aussi mettre en DB via View)
    Toast.show(`Opérateur ${workflowResult.operator.firstName} créé.`, 'success');
  }

  // Afficher feedback costing
  if (workflowResult.costDetails) {
    console.log('Coûts calculés:', workflowResult.costDetails);
  }

  overlay.remove();
  _renderPage();
}
```

**Changements:**
- ✓ Orchestration costing (4 branches) → 1 appel Workflow
- ✓ Logique métier testable séparée
- ✓ Operators.js focus sur UI/form, pas sur calculs

---

## Cas 4 : Utiliser Workflows depuis clients.js

### Avant

**Fichier:** `clients.js`, lignes 376-410

```javascript
function _renderDetailInfo(client) {
  const profitability = Engine.computeClientProfitability(client.id);

  // ... affichage profitabilité ...
  _container.innerHTML = `
    <div class="kpi-value">${Engine.fmtPercent(profitability.rentabilityPercent)}</div>
    <div class="kpi-detail">CA: ${Engine.fmt(profitability.totalRevenue)}</div>
    <div class="kpi-value ${profitability.netResult >= 0 ? 'text-green' : 'text-red'}">
      ${Engine.fmt(profitability.netResult)}
    </div>
  `;
}
```

### Après (sans modification logique, juste refactoring)

```javascript
function _renderDetailInfo(client) {
  // UTILISER Workflow pour analyse (même résultat, source unique)
  const workflowResult = Workflows.Programme.analyzeClientProfitability(client.id);

  if (!workflowResult.success) {
    _container.innerHTML = '<p>Erreur lors de l\'analyse</p>';
    return;
  }

  const profitability = workflowResult.data;

  // ... affichage profitabilité (INCHANGÉ) ...
  _container.innerHTML = `
    <div class="kpi-value">${Engine.fmtPercent(profitability.rentabilityPercent)}</div>
    <div class="kpi-detail">CA: ${Engine.fmt(profitability.totalRevenue)}</div>
    <div class="kpi-value ${profitability.netResult >= 0 ? 'text-green' : 'text-red'}">
      ${Engine.fmt(profitability.netResult)}
    </div>
  `;
}
```

**Changements:**
- ✓ Appel Engine → Appel Workflow (wrapper)
- ✓ Même résultat affiché
- ✓ Source unique pour logique métier

---

## Checklist d'Intégration

Pour chaque workflow intégré :

- [ ] Ajouter `<script>` dans `index.html` (ordre correct: db, engine, workflows, views, app)
- [ ] Appeler `Workflows.X.Y()` depuis View concernée
- [ ] Vérifier résultat `{ success, ... }`
- [ ] Afficher feedback utilisateur (Toast, alerts)
- [ ] Tester UI sans régression
- [ ] Vérifier BD en localStorage (devtools)
- [ ] Documenter changement dans git commit

---

## Notes Importantes

1. **Pas de modification logique métier** : Workflows réorganisent seulement le code existant
2. **Retours structurés** : toujours vérifier `result.success` avant utiliser données
3. **Feedback utilisateur** : Workflows retournent messages utiles pour Toast/alerts
4. **Progressive** : intégrer un Workflow à la fois, tester après chaque changement
5. **Reversible** : si problème, peut revenir à code existant facilement
