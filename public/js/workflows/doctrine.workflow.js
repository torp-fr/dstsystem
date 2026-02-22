/* ============================================================
   DST-SYSTEM — Workflows Métier: Doctrine Entreprise

   Extraction de logique métier depuis settings.js et engine.js
   Gestion gouvernance économique: charges sociales, paramètres, alertes.
   ============================================================ */

const DoctrineWorkflow = (() => {
  'use strict';

  /**
   * Valider cohérence configuration économique
   *
   * Responsabilités:
   * 1. Vérifier taux > 0
   * 2. Vérifier PASS >= SMIC
   * 3. Vérifier seuils logiques (marge, floor, etc.)
   *
   * @param {object} policyData - Configuration à valider
   * @returns {object} { valid, errors, warnings }
   */
  function validateEconomicPolicy(policyData) {
    const errors = [];
    const warnings = [];

    // Vérifier structures critiques
    if (!policyData) {
      errors.push('Données politiques non définies');
      return { valid: false, errors, warnings };
    }

    const config = policyData.chargesConfig || {};

    // Vérifications charges sociales
    if (config.passAnnuel && config.smicMensuelBrut) {
      const smicAnnuel = (config.smicMensuelBrut || 0) * 12;
      if (config.passAnnuel < smicAnnuel) {
        warnings.push(`PASS (${config.passAnnuel}€) < SMIC annuel (${smicAnnuel}€)`);
      }
    }

    // Vérifier taux patronales
    if (config.patronales && Array.isArray(config.patronales)) {
      config.patronales.forEach(charge => {
        if (charge.taux < 0) {
          errors.push(`Charge patronale ${charge.code}: taux négatif (${charge.taux}%)`);
        }
        if (charge.taux > 100) {
          warnings.push(`Charge patronale ${charge.code}: taux très élevé (${charge.taux}%)`);
        }
      });
    }

    // Vérifier taux salariales
    if (config.salariales && Array.isArray(config.salariales)) {
      config.salariales.forEach(charge => {
        if (charge.taux < 0) {
          errors.push(`Charge salariale ${charge.code}: taux négatif (${charge.taux}%)`);
        }
      });
    }

    // Vérifier marge cible
    if (policyData.targetMarginPercent !== undefined) {
      if (policyData.targetMarginPercent < 0 || policyData.targetMarginPercent > 100) {
        errors.push(`Marge cible: ${policyData.targetMarginPercent}% (doit être 0-100%)`);
      }
    }

    // Vérifier TVA
    if (policyData.vatRate !== undefined) {
      if (policyData.vatRate < 0 || policyData.vatRate > 100) {
        errors.push(`Taux TVA: ${policyData.vatRate}% (doit être 0-100%)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Calculer impacts de configuration économique
   *
   * Responsabilités:
   * 1. Appeler Engine.calculateSeuilPlancher()
   * 2. Appeler Engine.calculatePointMort()
   * 3. Appeler Engine.calculateTresorerie()
   * 4. Retourner impacts KPI
   *
   * Utilisé lors: sauvegarde settings pour affichage "impacts"
   *
   * @param {object} policyData
   * @returns {object} { seuilPlancher, pointMort, tresorerie }
   */
  function calculatePolicyImpacts(policyData) {
    const settings = policyData || DB.settings.get();

    // Appels Engine pour recalc KPIs
    const seuilPlancher = Engine.calculateSeuilPlancher(settings);
    const pointMort = Engine.calculatePointMort();
    const tresorerie = Engine.calculateTresorerie();

    return {
      seuilPlancher: {
        value: seuilPlancher,
        label: `Prix plancher session: ${Engine.fmt(seuilPlancher)}`
      },
      pointMort: {
        value: pointMort,
        label: `Sessions break-even/an: ${pointMort}`
      },
      tresorerie: {
        value: tresorerie,
        label: `Cash flow estimé: ${Engine.fmt(tresorerie)}`
      }
    };
  }

  /**
   * Générer alertes économiques globales
   *
   * Responsabilités:
   * 1. Appeler Engine.computeAllAlerts()
   * 2. Retourner alertes structurées par domaine
   *
   * Alertes Doctrine:
   *   - sessionBelowFloor
   *   - sessionLowMargin
   *   - unprofitableModules
   *
   * Alertes Capacité (dans computeAllAlerts):
   *   - operatorOverload
   *   - operatorDependency
   *   - interimRequalification
   *
   * @returns {object} { doctrine_alerts, capacity_alerts }
   */
  function generateEconomicAlerts() {
    // Appel Engine centralisé pour toutes alertes
    const allAlerts = Engine.computeAllAlerts();

    // Trier par domaine
    const doctrineAlerts = [];
    const capacityAlerts = [];

    if (allAlerts) {
      // Alertes Doctrine
      if (allAlerts.sessionBelowFloor && allAlerts.sessionBelowFloor.count > 0) {
        doctrineAlerts.push({
          type: 'sessionBelowFloor',
          severity: 'warning',
          count: allAlerts.sessionBelowFloor.count,
          message: `${allAlerts.sessionBelowFloor.count} session(s) sous prix plancher`
        });
      }

      if (allAlerts.sessionLowMargin && allAlerts.sessionLowMargin.count > 0) {
        doctrineAlerts.push({
          type: 'sessionLowMargin',
          severity: 'warning',
          count: allAlerts.sessionLowMargin.count,
          message: `${allAlerts.sessionLowMargin.count} session(s) marge faible`
        });
      }

      if (allAlerts.unprofitableModules && allAlerts.unprofitableModules.length > 0) {
        doctrineAlerts.push({
          type: 'unprofitableModules',
          severity: 'warning',
          modules: allAlerts.unprofitableModules,
          message: `Modules déficitaires: ${allAlerts.unprofitableModules.join(', ')}`
        });
      }

      // Alertes Capacité
      if (allAlerts.operatorOverload && allAlerts.operatorOverload.count > 0) {
        capacityAlerts.push({
          type: 'operatorOverload',
          severity: 'warning',
          count: allAlerts.operatorOverload.count,
          message: `${allAlerts.operatorOverload.count} opérateur(s) surchargé(s)`
        });
      }

      if (allAlerts.operatorDependency && allAlerts.operatorDependency.count > 0) {
        capacityAlerts.push({
          type: 'operatorDependency',
          severity: 'warning',
          count: allAlerts.operatorDependency.count,
          message: `${allAlerts.operatorDependency.count} dépendance(s) risque (>40%)`
        });
      }

      if (allAlerts.interimRequalification && allAlerts.interimRequalification.count > 0) {
        capacityAlerts.push({
          type: 'interimRequalification',
          severity: 'error',
          count: allAlerts.interimRequalification.count,
          message: `Risque requalification URSSAF: ${allAlerts.interimRequalification.count}`
        });
      }
    }

    return {
      success: true,
      doctrine_alerts: doctrineAlerts,
      capacity_alerts: capacityAlerts,
      total: doctrineAlerts.length + capacityAlerts.length
    };
  }

  /**
   * Calculer coûts RH par statut (6 options)
   *
   * Responsabilités:
   * 1. Récupérer chargesConfig (Doctrine)
   * 2. Appeler Engine.compareAllStatuses()
   * 3. Retourner matrice complète
   *
   * Utilisé par: CapacityWorkflow.arbitrateOperatorStatus
   *
   * @param {number} netDaily
   * @returns {object} { scenarios }
   */
  function compareRhCostsByStatus(netDaily) {
    const settings = DB.settings.get();
    const scenarios = Engine.compareAllStatuses(netDaily, settings);

    return {
      success: true,
      netDaily: netDaily,
      scenarios: scenarios,
      message: `Comparaison coûts pour ${Engine.fmt(netDaily)}/jour`
    };
  }

  // === API publique ===
  return {
    validateEconomicPolicy,
    calculatePolicyImpacts,
    generateEconomicAlerts,
    compareRhCostsByStatus
  };
})();

// Export pour utilisation dans Views
