/* ============================================================
   DST-SYSTEM — Index Workflows

   Agrégation de tous les workflows métier
   Chaque workflow est une couche logique pure métier
   = pas de dépendance UI, pas de modification existante
   ============================================================ */

const Workflows = {
  // === RÉSERVATION CLIENT (PHASE 1) ===
  Booking: BookingWorkflow,

  // === MISSION ENTRAINEMENT (PHASE 2) ===
  Mission: MissionWorkflow,

  // === MARCHÉ OPÉRATEURS ===
  OperatorMarketplace: OperatorMarketplaceWorkflow,

  // === VALIDATION STAFFING ===
  Staffing: StaffingWorkflow,

  // === GESTION DES COMPTES ===
  Account: AccountWorkflow,

  // === CAPACITÉ TERRAIN ===
  Capacity: CapacityWorkflow,

  // === PROGRAMME ENTRAINEMENT CLIENT ===
  Programme: ProgrammeWorkflow,

  // === DOCTRINE ENTREPRISE ===
  Doctrine: DoctrineWorkflow
};

// Export centralisé
// Utilisation dans Views:
//   Workflows.Booking.createSessionBooking(data)
//   Workflows.Booking.confirmSessionBooking(sessionId)
//   Workflows.Booking.checkAvailability(regionId, date, moduleIds, participants)
//   Workflows.Mission.completeMission(sessionId, newStatus)
//   Workflows.Capacity.createOperatorWithCosting(data)
//   Workflows.Programme.analyzeClientProfitability(clientId)
//   Workflows.Doctrine.generateEconomicAlerts()
