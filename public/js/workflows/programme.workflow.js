/* ============================================================
   DST-SYSTEM — Workflows Métier: Programme Entrainement Client

   Extraction de logique métier depuis clients.js et offers.js
   Gestion contrats clients: profitabilité, abonnements, tarification.
   ============================================================ */

const ProgrammeWorkflow = (() => {
  'use strict';

  /**
   * Analyser profitabilité d'un client
   *
   * Responsabilités:
   * 1. Charger client (Programme)
   * 2. Charger sessions du client (Mission)
   * 3. Calculer coûts par session (Doctrine + Mission)
   * 4. Agrégation: CA, coûts, marge, rentabilité
   * 5. Classer selon seuils Doctrine
   *
   * Traverse 3 domaines:
   *   - PROGRAMME: identité client, abonnement
   *   - MISSION: sessions du client, coûts
   *   - DOCTRINE: seuils rentabilité
   *
   * @param {string} clientId
   * @returns {object} { totalSessions, totalRevenue, totalCosts, rentability, status }
   */
  function analyzeClientProfitability(clientId) {
    const client = DB.clients.getById(clientId);
    if (!client) {
      return {
        success: false,
        error: 'Client introuvable',
        error_code: 'CLIENT_NOT_FOUND'
      };
    }

    // Charger toutes les sessions du client
    const allSessions = DB.sessions.getAll();
    const clientSessions = allSessions.filter(s => {
      return (s.clientIds && s.clientIds.includes(clientId)) || s.clientId === clientId;
    });

    // Initialiser résultat
    const result = {
      clientId: clientId,
      clientName: client.name,
      totalSessions: clientSessions.length,
      completedSessions: 0,
      totalRevenue: 0,
      totalCosts: 0,
      netResult: 0,
      rentabilityPercent: 0,
      avgMargin: 0,
      status: 'Pas de données'
    };

    if (clientSessions.length === 0) {
      return {
        success: true,
        data: result
      };
    }

    // ========================================================================
    // Itérer sur sessions: calculer coûts, marges, agrégats
    // ========================================================================

    let totalMargin = 0;
    let countMargin = 0;

    clientSessions.forEach(session => {
      // Compter sessions complétées
      if (session.status === 'terminee') {
        result.completedSessions++;
      }

      // Ajouter revenu (si prix saisi)
      if (session.price || session.price === 0) {
        result.totalRevenue += (session.price || 0);

        // Calculer coûts session (Doctrine + Engine)
        const cost = Engine.computeSessionCost(session);

        result.totalCosts += cost.totalCost;
        totalMargin += cost.margin;
        countMargin++;
      }
    });

    // Calculer agrégats
    result.avgMargin = countMargin > 0
      ? Engine.round2(totalMargin / countMargin)
      : 0;

    result.netResult = Engine.round2(result.totalRevenue - result.totalCosts);

    result.rentabilityPercent = result.totalRevenue > 0
      ? Engine.round2((result.netResult / result.totalRevenue) * 100)
      : 0;

    // ========================================================================
    // CLASSEMENT selon seuils Doctrine (30%, 15%, 0%)
    // ========================================================================

    if (result.completedSessions === 0) {
      result.status = 'En cours';
    } else if (result.rentabilityPercent >= 30) {
      result.status = '✓ Très rentable';
    } else if (result.rentabilityPercent >= 15) {
      result.status = '✓ Rentable';
    } else if (result.rentabilityPercent >= 0) {
      result.status = '⚠ Acceptable';
    } else {
      result.status = '✗ Déficitaire';
    }

    return {
      success: true,
      data: result
    };
  }

  /**
   * Calculer tarif plancher d'une offre
   *
   * Responsabilités:
   * 1. Construire offre partielle (modules + nb sessions)
   * 2. Appeler Engine pour calcul floor
   * 3. Retourner floor + breakdown coûts
   *
   * Traverse 2 domaines:
   *   - PROGRAMME: modules offre
   *   - DOCTRINE: charges sociales, coûts, marge cible
   *
   * @param {object} offerData - { moduleIds, nbSessions, type }
   * @returns {object} { floorPrice, costBreakdown, targetMargin, recommendedPrice }
   */
  function calculateOfferFloor(offerData) {
    const moduleIds = offerData.moduleIds || [];
    const nbSessions = parseInt(offerData.nbSessions) || 1;
    const offerType = offerData.type || 'one_shot';

    // Construire offre partielle pour calcul floor
    const partialOffer = {
      type: offerType,
      moduleIds: moduleIds,
      nbSessions: nbSessions
    };

    // Appel Engine: calculer floor price
    const floor = Engine.computeOfferFloor(partialOffer);

    return {
      success: true,
      floorPrice: floor,
      costBreakdown: {
        modulesCost: moduleIds.reduce((sum, modId) => {
          const mod = DB.modules.getById(modId);
          return sum + (mod ? (mod.variableCost || 0) : 0);
        }, 0),
        fixedShare: DB.settings.get().fixedCosts
          ? DB.settings.get().fixedCosts.reduce((sum, fc) => sum + (fc.amount || 0), 0) / 100
          : 0,
        total: floor
      },
      targetMargin: DB.settings.get().targetMarginPercent || 30,
      recommendedPrice: Engine.round2(floor * (1 + ((DB.settings.get().targetMarginPercent || 30) / 100)))
    };
  }

  /**
   * Créer client avec programme (abonnement optionnel)
   *
   * Responsabilités:
   * 1. Valider données client minimales
   * 2. Créer client entity
   * 3. Lier abonnement si spécifié
   * 4. Créer locations associées
   *
   * @param {object} clientData
   * @returns {object} { success, client, error }
   */
  function createClientWithProgram(clientData) {
    // Valider nom obligatoire
    if (!clientData.name || !clientData.name.trim()) {
      return {
        success: false,
        error: 'Nom client obligatoire',
        error_code: 'MISSING_NAME'
      };
    }

    // Construire entity client
    const clientEntity = {
      name: clientData.name.trim(),
      type: clientData.type || 'Autre',
      sector: clientData.sector || '',
      clientCategory: clientData.clientCategory || 'B2B',
      contact: clientData.contact || {},
      contactName: clientData.contact?.name || '',
      contactEmail: clientData.contact?.email || '',
      contactPhone: clientData.contact?.phone || '',
      paymentTerms: clientData.paymentTerms || '',
      priority: clientData.priority || 'normale',
      primarySubscriptionId: clientData.primarySubscriptionId || null,
      notes: clientData.notes || '',
      active: clientData.active !== false
    };

    // Créer client
    const createdClient = DB.clients.create(clientEntity);

    if (!createdClient) {
      return {
        success: false,
        error: 'Erreur lors de la création du client',
        error_code: 'CLIENT_CREATE_FAILED'
      };
    }

    // Créer locations associées (optionnel)
    if (clientData.locations && Array.isArray(clientData.locations)) {
      clientData.locations.forEach(locData => {
        DB.locations.create({
          ...locData,
          clientId: createdClient.id
        });
      });
    }

    return {
      success: true,
      client: createdClient,
      message: `Client ${createdClient.name} créé`
    };
  }

  /**
   * Tracker consommation crédit abonnement
   *
   * Responsabilités:
   * 1. Charger offre
   * 2. Incrémenter sessionsConsumed
   * 3. Plafonner à nbSessions
   * 4. Persister change
   *
   * Utilisé par: MissionWorkflow.completeMission
   *
   * @param {string} offerId
   * @param {number} quantity - Nombre crédits à consommer (default: 1)
   * @returns {object} { success, sessionsConsumed, sessionsRemaining }
   */
  function consumeAbonnementCredit(offerId, quantity = 1) {
    const offer = DB.offers.getById(offerId);

    if (!offer) {
      return {
        success: false,
        error: 'Offre introuvable',
        error_code: 'OFFER_NOT_FOUND'
      };
    }

    if (offer.type !== 'abonnement') {
      return {
        success: false,
        error: 'Offre n\'est pas un abonnement',
        error_code: 'NOT_ABONNEMENT'
      };
    }

    const nbSessions = offer.nbSessions || 0;
    const currentConsumed = offer.sessionsConsumed || 0;
    const newConsumed = Math.min(currentConsumed + quantity, nbSessions);

    const updated = DB.offers.update(offerId, {
      sessionsConsumed: newConsumed
    });

    if (!updated) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'abonnement',
        error_code: 'OFFER_UPDATE_FAILED'
      };
    }

    return {
      success: true,
      offer: updated,
      sessionsConsumed: newConsumed,
      sessionsRemaining: Math.max(nbSessions - newConsumed, 0),
      message: `Crédit consommé (${newConsumed}/${nbSessions})`
    };
  }

  // === API publique ===
  return {
    analyzeClientProfitability,
    calculateOfferFloor,
    createClientWithProgram,
    consumeAbonnementCredit
  };
})();

// Export pour utilisation dans Views
