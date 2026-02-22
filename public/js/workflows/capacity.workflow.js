/* ============================================================
   DST-SYSTEM — Workflows Métier: Capacité Terrain

   Extraction de logique métier depuis operators.js
   Gestion opérateurs: costing, arbitrage statut, alertes.
   ============================================================ */

const CapacityWorkflow = (() => {
  'use strict';

  /**
   * Créer opérateur avec orchestration costing
   *
   * Responsabilités:
   * 1. Décider mode costing (4 branches)
   * 2. Appeler Engine avec mode approprié
   * 3. Extraire netDaily et companyCostDaily
   * 4. Créer opérateur avec snapshot coûts
   *
   * Domaines:
   *   - CAPACITÉ: créer opérateur, arbitrer statut
   *   - DOCTRINE: charges sociales, calcul coûts
   *
   * @param {object} operatorData - Données saisies du formulaire
   * @param {string} operatorData.firstName
   * @param {string} operatorData.lastName
   * @param {string} operatorData.status - 'cdi'|'cdd'|'interim'|'freelance'|'contrat_journalier'|'fondateur'
   * @param {string} operatorData.costMode - 'tjm_facture'|'horaire'|'net_desired'|'company_max'
   * @param {number} operatorData.tjmFacture - (si costMode='tjm_facture')
   * @param {number} operatorData.hourlyRate - (si costMode='horaire')
   * @param {number} operatorData.hoursPerDay - (si costMode='horaire')
   * @param {number} operatorData.netDaily - (si costMode='net_desired')
   * @param {number} operatorData.companyCostDaily - (si costMode='company_max')
   * @returns {object} { success, operator, costDetails, error }
   */
  function createOperatorWithCosting(operatorData) {
    // Valider données minimales
    if (!operatorData.firstName || !operatorData.lastName) {
      return {
        success: false,
        error: 'Prénom et nom obligatoires',
        error_code: 'MISSING_NAME'
      };
    }

    const status = operatorData.status || 'freelance';
    const costMode = operatorData.costMode || 'net_desired';
    const settings = DB.settings.get();

    let netDaily = 0;
    let companyCostDaily = 0;
    let costDetails = null;

    // ========================================================================
    // ORCHESTRATION COSTING: 4 chemins selon mode
    // ========================================================================
    // Chaque mode orchestre différentes fonctions Engine
    // et produit netDaily + companyCostDaily
    // ========================================================================

    if (costMode === 'tjm_facture') {
      // Mode: user saisit TJM facturé (freelance invoicing)
      const tjmFacture = parseFloat(operatorData.tjmFacture) || 0;
      companyCostDaily = tjmFacture;

      // Appel Engine: calculer net from invoice TJM
      const tjmResult = Engine.freelanceTjmFacture(tjmFacture, settings);
      netDaily = tjmResult.netFreelance;

      costDetails = {
        mode: 'tjm_facture',
        tjmFacture: tjmFacture,
        netDaily: netDaily,
        companyCostDaily: companyCostDaily
      };
    } else if (costMode === 'horaire') {
      // Mode: user saisit taux horaire
      const hourlyRate = parseFloat(operatorData.hourlyRate) || 0;
      const hoursPerDay = parseFloat(operatorData.hoursPerDay) || 7;
      const hrMode = 'net'; // ou 'brut' selon préférence

      // Appel Engine: calculer coûts journaliers from hourly
      const hrResult = Engine.computeCoutHoraire(hourlyRate, status, hrMode, settings);
      companyCostDaily = hrResult.coutEntrepriseJour;
      netDaily = hrResult.journalierEquivalent;

      costDetails = {
        mode: 'horaire',
        hourlyRate: hourlyRate,
        hoursPerDay: hoursPerDay,
        netDaily: netDaily,
        companyCostDaily: companyCostDaily
      };
    } else if (costMode === 'net_desired') {
      // Mode: user saisit net désiré (normal case)
      netDaily = parseFloat(operatorData.netDaily) || 0;

      // Appel Engine: calculer coût employer from net
      const calcResult = Engine.netToCompanyCost(netDaily, status, settings);
      companyCostDaily = calcResult ? calcResult.companyCost : 0;

      costDetails = {
        mode: 'net_desired',
        netDaily: netDaily,
        companyCostDaily: companyCostDaily,
        chargesPercent: ((companyCostDaily - netDaily) / netDaily * 100).toFixed(1)
      };
    } else if (costMode === 'company_max') {
      // Mode: user saisit budget max employer
      companyCostDaily = parseFloat(operatorData.companyCostDaily) || 0;

      // Appel Engine: calculer net max from employer cost
      const calcResult = Engine.companyCostToNet(companyCostDaily, status, settings);
      netDaily = calcResult ? calcResult.net : 0;

      costDetails = {
        mode: 'company_max',
        companyCostDaily: companyCostDaily,
        netDaily: netDaily
      };
    }

    // ========================================================================
    // Créer l'opérateur avec snapshot des coûts
    // ========================================================================
    // Snapshot = capture des coûts à ce moment
    // Si settings change → opérateurs anciens gardent anciens coûts
    // (pas de recalc rétroactif, c'est intentionnel)
    // ========================================================================

    const operatorEntity = {
      firstName: operatorData.firstName.trim(),
      lastName: operatorData.lastName.trim(),
      email: operatorData.email || '',
      phone: operatorData.phone || '',
      status: status,
      active: operatorData.active !== false,
      costMode: costMode,
      netDaily: Engine.round2(netDaily),
      companyCostDaily: Engine.round2(companyCostDaily),
      specialties: operatorData.specialties || [],
      notes: operatorData.notes || ''
    };

    const createdOperator = DB.operators.create(operatorEntity);

    if (!createdOperator) {
      return {
        success: false,
        error: 'Erreur lors de la création de l\'opérateur',
        error_code: 'OPERATOR_CREATE_FAILED'
      };
    }

    return {
      success: true,
      operator: createdOperator,
      costDetails: costDetails,
      message: `Opérateur ${createdOperator.firstName} ${createdOperator.lastName} créé`
    };
  }

  /**
   * Arbitrer statut optimal d'opérateur (comparaison 6 statuts)
   *
   * Responsabilités:
   * 1. Charger charges sociales (Doctrine)
   * 2. Comparer coûts pour 6 statuts possibles
   * 3. Retourner matrice comparatif
   *
   * Utilisé pour: décider quel statut choisir à l'embauche
   *
   * @param {number} netDaily - Tarif net journalier de référence
   * @returns {object} { netDaily, scenarios, recommendations }
   */
  function arbitrateOperatorStatus(netDaily) {
    const settings = DB.settings.get();

    // Appel Engine: comparer 6 statuts
    const comparison = Engine.compareAllStatuses(netDaily, settings);

    // Enrichir avec recommendations
    const scenarios = comparison || [];
    let cheapestStatus = null;
    let lowestCost = Infinity;

    scenarios.forEach(item => {
      if (item.companyCost < lowestCost) {
        lowestCost = item.companyCost;
        cheapestStatus = item.status;
      }
    });

    return {
      netDaily: netDaily,
      scenarios: scenarios,
      recommendations: {
        cheapestStatus: cheapestStatus,
        cheapestCost: lowestCost,
        message: `Statut optimal pour ${netDaily}€ net : ${cheapestStatus}`
      }
    };
  }

  /**
   * Évaluer capacité opérateur (charge, alertes)
   *
   * Responsabilités:
   * 1. Charger opérateur
   * 2. Calculer charge (sessions/mois, dépendance %)
   * 3. Générer alertes si applicable
   *
   * Alertes:
   *   - overload: > 15 sessions/mois
   *   - dependencyRisk: > 40% CA from one operator
   *   - urssafRequalification: intérim > 45 jours
   *
   * @param {string} operatorId
   * @returns {object} { operator, load, alerts }
   */
  function evaluateOperatorCapacity(operatorId) {
    const operator = DB.operators.getById(operatorId);
    if (!operator) {
      return {
        success: false,
        error: 'Opérateur introuvable'
      };
    }

    // Calculer charge: sessions ce mois
    const allSessions = DB.sessions.getAll();
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const sessionsThisMonth = allSessions.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return (d.getMonth() === thisMonth && d.getFullYear() === thisYear) &&
             (s.operatorIds && s.operatorIds.includes(operatorId));
    }).length;

    // Calculer dépendance: % CA from this operator
    const sessionsWithOp = allSessions.filter(s =>
      s.operatorIds && s.operatorIds.includes(operatorId)
    );

    let operatorRevenue = 0;
    let totalRevenue = 0;

    allSessions.forEach(s => {
      if (s.price) {
        totalRevenue += s.price;
        if (s.operatorIds && s.operatorIds.includes(operatorId)) {
          operatorRevenue += s.price;
        }
      }
    });

    const dependencyPercent = totalRevenue > 0
      ? (operatorRevenue / totalRevenue) * 100
      : 0;

    // Générer alertes
    const alerts = [];

    if (sessionsThisMonth > 15) {
      alerts.push({
        type: 'overload',
        severity: 'warning',
        message: `Surcharge opérateur: ${sessionsThisMonth} sessions ce mois (seuil: 15)`
      });
    }

    if (dependencyPercent > 40) {
      alerts.push({
        type: 'dependencyRisk',
        severity: 'warning',
        message: `Dépendance opérateur: ${dependencyPercent.toFixed(1)}% du CA (seuil: 40%)`
      });
    }

    if (operator.status === 'interim' && sessionsWithOp.length > 45) {
      alerts.push({
        type: 'urssafRequalification',
        severity: 'error',
        message: `Risque requalification URSSAF: intérim > 45 jours`
      });
    }

    return {
      success: true,
      operator: {
        id: operator.id,
        name: `${operator.firstName} ${operator.lastName}`,
        status: operator.status,
        companyCostDaily: operator.companyCostDaily
      },
      load: {
        sessionsThisMonth: sessionsThisMonth,
        sessionsUpcoming: sessionsWithOp.length,
        dependencyPercent: Engine.round2(dependencyPercent)
      },
      alerts: alerts
    };
  }

  // === API publique ===
  return {
    createOperatorWithCosting,
    arbitrateOperatorStatus,
    evaluateOperatorCapacity
  };
})();

// Export pour utilisation dans Views
