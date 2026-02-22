/* ============================================================
   DST-SYSTEM — Domain Foundation Layer Index

   Exports all domain services and repositories
   Available globally as window.Domain

   Architecture Stack:
   1. DB (data access layer)
   2. Engine (business calculations)
   3. Domain (foundation layer) ← YOU ARE HERE
   4. Workflows (orchestration layer)
   5. React Components (UI layer)

   ============================================================ */

const Domain = {
  // Setup Management
  SetupRepository: typeof SetupRepository !== 'undefined' ? SetupRepository : null,

  // Operator Planning
  OperatorAvailabilityRepository: typeof OperatorAvailabilityRepository !== 'undefined' ? OperatorAvailabilityRepository : null,

  // Session Booking & Availability
  AvailabilityEngine: typeof AvailabilityEngine !== 'undefined' ? AvailabilityEngine : null,

  // Capacity Constraints
  ModuleCapacityService: typeof ModuleCapacityService !== 'undefined' ? ModuleCapacityService : null,

  // Session ↔ Setup Resource Binding
  SessionResourceService: typeof SessionResourceService !== 'undefined' ? SessionResourceService : null,

  // Migration Helpers
  SessionMigrationHelper: typeof SessionMigrationHelper !== 'undefined' ? SessionMigrationHelper : null,

  // Account Management
  AccountRepository: typeof AccountRepository !== 'undefined' ? AccountRepository : null,

  // Access Control Layer
  RoleGuardService: typeof RoleGuardService !== 'undefined' ? RoleGuardService : null,

  // Real-time Planning Engine
  PlanningRealtimeService: typeof PlanningRealtimeService !== 'undefined' ? PlanningRealtimeService : null,

  // Operator Auto-Match Intelligence
  OperatorAutoMatchEngine: typeof OperatorAutoMatchEngine !== 'undefined' ? OperatorAutoMatchEngine : null,

  // Staffing Risk Analysis
  StaffingRiskEngine: typeof StaffingRiskEngine !== 'undefined' ? StaffingRiskEngine : null,

  // Planning State Projection (READ-ONLY dashboard view)
  PlanningStateService: typeof PlanningStateService !== 'undefined' ? PlanningStateService : null,

  // Helper: Get all services at once
  getServices() {
    return {
      setups: Domain.SetupRepository,
      operatorAvailability: Domain.OperatorAvailabilityRepository,
      availability: Domain.AvailabilityEngine,
      capacity: Domain.ModuleCapacityService,
      sessionResource: Domain.SessionResourceService,
      migration: Domain.SessionMigrationHelper,
      accounts: Domain.AccountRepository,
      roleGuard: Domain.RoleGuardService,
      planningRealtime: Domain.PlanningRealtimeService,
      operatorAutoMatch: Domain.OperatorAutoMatchEngine,
      staffingRisk: Domain.StaffingRiskEngine,
      planningState: Domain.PlanningStateService
    };
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.Domain = Domain;
}

// Usage examples (see DOMAIN_USAGE.md):
//
// 1. CHECK AVAILABILITY
//    const result = Domain.AvailabilityEngine.getAvailableSetups('2025-03-10', 'occitanie');
//    if (result.isAvailable) { /* book session */ }
//
// 2. GET CALENDAR
//    const calendar = Domain.AvailabilityEngine.getAvailabilityCalendar('occitanie', 90);
//    calendar.days.forEach(day => console.log(day.date, day.availableSetups));
//
// 3. VALIDATE CAPACITY
//    const capacity = Domain.ModuleCapacityService.computeSessionCapacity(['mod_1', 'mod_2']);
//    const valid = Domain.ModuleCapacityService.validateParticipantCount(['mod_1', 'mod_2'], 15);
//
// 4. MANAGE SETUPS
//    const setup = Domain.SetupRepository.create({
//      name: 'Setup Occitanie 1',
//      regionIds: ['occitanie']
//    });
//
// 5. MANAGE OPERATOR AVAILABILITY
//    Domain.OperatorAvailabilityRepository.addUnavailableDate('op_123', '2025-03-10');
//
