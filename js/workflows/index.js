/* ============================================================
   DST-SYSTEM — Index Workflows

   Agrégation de tous les workflows métier
   Chaque workflow est une couche logique pure métier
   = pas de dépendance UI, pas de modification existante
   ============================================================ */

const Workflows = {
  // === MISSION ENTRAINEMENT ===
  Mission: MissionWorkflow,

  // === CAPACITÉ TERRAIN ===
  Capacity: CapacityWorkflow,

  // === PROGRAMME ENTRAINEMENT CLIENT ===
  Programme: ProgrammeWorkflow,

  // === DOCTRINE ENTREPRISE ===
  Doctrine: DoctrineWorkflow
};

// Export centralisé
// Utilisation dans Views:
//   Workflows.Mission.completeMission(sessionId, newStatus)
//   Workflows.Capacity.createOperatorWithCosting(data)
//   Workflows.Programme.analyzeClientProfitability(clientId)
//   Workflows.Doctrine.generateEconomicAlerts()
