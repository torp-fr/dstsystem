/* ============================================================
   DST-SYSTEM — Workflows Métier: Mission Entrainement

   Extraction de logique métier depuis sessions.js
   Aucune modification de logique, juste réorganisation structurelle.
   ============================================================ */

const MissionWorkflow = (() => {
  'use strict';

  /**
   * Terminer une mission (passer status → nouvelle valeur)
   *
   * Responsabilités:
   * 1. Valider transition de statut
   * 2. Persistée changement session
   * 3. SI session terminée + abonnement → consommer crédit abonnement
   *
   * Workflow travers 2 domaines:
   *   - MISSION: terminer session
   *   - PROGRAMME: consommer crédit abonnement
   *
   * @param {string} sessionId - ID de la session à terminer
   * @param {string} newStatus - Nouveau statut ('terminee', 'confirmee', etc.)
   * @returns {object} { success, message, creditsConsumed }
   */
  function completeMission(sessionId, newStatus) {
    // Charger la session actuelle
    const session = DB.sessions.getById(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Session introuvable',
        error: 'SESSION_NOT_FOUND'
      };
    }

    const previousStatus = session.status;

    // Mettre à jour session
    const updatedSession = DB.sessions.update(sessionId, {
      status: newStatus
    });

    if (!updatedSession) {
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la session',
        error: 'SESSION_UPDATE_FAILED'
      };
    }

    // ========================================================================
    // ORCHESTRATION MÉTIER: Gestion consommation abonnement
    // ========================================================================
    // Règle métier: "Quand session passe à 'terminee' → consommer crédit"
    //
    // Cas 1: Transition "not terminee" → "terminee" = CONSUME
    //        (session vient d'être complétée)
    //
    // Cas 2: Transition "terminee" → "other status" = ROLLBACK
    //        (session était complétée, maintenant annulée)
    //
    // ========================================================================

    let creditsConsumed = 0;
    let creditsRolledBack = 0;

    // Cas 1: Première fois que session devient 'terminee'
    const justCompleted = (newStatus === 'terminee' && previousStatus !== 'terminee');
    if (justCompleted && session.offerId) {
      const offer = DB.offers.getById(session.offerId);

      if (offer && offer.type === 'abonnement') {
        // Incrémenter sessions consommées, plafonner à nbSessions max
        const consumed = (offer.sessionsConsumed || 0) + 1;
        const finalConsumed = Math.min(consumed, offer.nbSessions || 0);

        const updateResult = DB.offers.update(offer.id, {
          sessionsConsumed: finalConsumed
        });

        if (updateResult) {
          creditsConsumed = 1;
        }
      }
    }

    // Cas 2: Rollback si était 'terminee' et passe à autre status
    const wasCompleted = (previousStatus === 'terminee' && newStatus !== 'terminee');
    if (wasCompleted && session.offerId) {
      const offer = DB.offers.getById(session.offerId);

      if (offer && offer.type === 'abonnement') {
        // Décrémenter sessions consommées, min 0
        const newConsumed = Math.max((offer.sessionsConsumed || 0) - 1, 0);

        const updateResult = DB.offers.update(offer.id, {
          sessionsConsumed: newConsumed
        });

        if (updateResult) {
          creditsRolledBack = 1;
        }
      }
    }

    return {
      success: true,
      message: 'Session mise à jour',
      sessionId: sessionId,
      previousStatus: previousStatus,
      newStatus: newStatus,
      creditsConsumed: creditsConsumed,
      creditsRolledBack: creditsRolledBack
    };
  }

  /**
   * Supprimer une mission
   *
   * Responsabilités:
   * 1. Charger session
   * 2. SI session était 'terminee' + abonnement → ROLLBACK crédit
   * 3. Supprimer session
   *
   * Logique manquante actuellement: rollback consommation
   *
   * @param {string} sessionId - ID de la session à supprimer
   * @returns {object} { success, message, creditsRolledBack }
   */
  function deleteMission(sessionId) {
    // Charger la session pour vérifier statut + offre
    const session = DB.sessions.getById(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Session introuvable',
        error: 'SESSION_NOT_FOUND'
      };
    }

    // ========================================================================
    // ROLLBACK MÉTIER: Si session était complétée → annuler consommation crédit
    // ========================================================================
    // Bug actuel: suppression ne rollback pas la consommation
    // Cette logique était MANQUANTE dans sessions.js
    // ========================================================================

    let creditsRolledBack = 0;

    if (session.status === 'terminee' && session.offerId) {
      const offer = DB.offers.getById(session.offerId);

      if (offer && offer.type === 'abonnement') {
        // Décrémenter sessions consommées, min 0
        const newConsumed = Math.max((offer.sessionsConsumed || 0) - 1, 0);

        const updateResult = DB.offers.update(offer.id, {
          sessionsConsumed: newConsumed
        });

        if (updateResult) {
          creditsRolledBack = 1;
        }
      }
    }

    // Supprimer la session
    const deleteResult = DB.sessions.delete(sessionId);

    if (!deleteResult) {
      return {
        success: false,
        message: 'Erreur lors de la suppression de la session',
        error: 'SESSION_DELETE_FAILED'
      };
    }

    return {
      success: true,
      message: 'Session supprimée',
      sessionId: sessionId,
      creditsRolledBack: creditsRolledBack
    };
  }

  // === API publique ===
  return {
    completeMission,
    deleteMission
  };
})();

// Export pour utilisation dans Views
// À ajouter dans index.html : <script src="js/workflows/mission.workflow.js"></script>
