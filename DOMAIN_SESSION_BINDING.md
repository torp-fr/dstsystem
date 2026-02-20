# DST-System — Session ↔ Setup Resource Binding

## Overview

Safe, non-breaking migration layer that binds sessions to setups.

**Key Principle:** Legacy sessions without setup binding continue working.

---

## Architecture

### Data Model Extension

Sessions gain optional resource binding fields:

```javascript
session = {
  id: 'sess_123',
  date: '2025-03-10',
  clientId: 'client_1',
  status: 'booked',

  // NEW FIELDS (optional, defaults to null/[])
  regionId: 'occitanie',        // Region where session takes place
  setupIds: ['setup_1', 'setup_2']  // Setups assigned to session
}
```

**Backward Compatibility:**
- Sessions without `regionId` and `setupIds` continue to work
- Fields default to `null` and `[]` respectively
- Legacy `setupId` (singular) is converted to `setupIds` (array)

---

## Files Added

```
/js/domain/
├── sessionResource.service.js      (330 LOC)
│   └── Core resource binding service
│
└── sessionMigration.helper.js      (310 LOC)
    └── Defensive field handling utilities
```

---

## 1. SessionResourceService

Core service for session-setup binding operations.

### API Reference

#### assignSetupToSession(sessionId, setupId)

Assign a setup to a session.

```javascript
const result = Domain.SessionResourceService.assignSetupToSession(
  'sess_123',
  'setup_occitanie_1'
);

// Result:
{
  success: true,
  sessionId: 'sess_123',
  setupId: 'setup_occitanie_1',
  setupIds: ['setup_occitanie_1'],
  regionId: 'occitanie',
  message: 'Setup setup_occitanie_1 assigned to session sess_123'
}
```

**Rules:**
- Setup must exist
- Setup cannot be used elsewhere on same date
- Session must have a date
- RegionId is auto-populated from setup

**Error Cases:**
- Setup not found: `"Setup {setupId} not found"`
- Setup already in use: `"Setup {setupId} is already booked on {date}"`
- Session not found: `"Session {sessionId} not found"`
- Missing date: `"Session must have a date"`

---

#### releaseSetupFromSession(sessionId, setupId)

Remove a setup from a session.

```javascript
const result = Domain.SessionResourceService.releaseSetupFromSession(
  'sess_123',
  'setup_occitanie_1'
);

// Result:
{
  success: true,
  sessionId: 'sess_123',
  setupId: 'setup_occitanie_1',
  setupIds: [],
  message: 'Setup setup_occitanie_1 released from session sess_123'
}
```

**Rules:**
- Clears regionId if session has no more setups
- Idempotent (safe to call multiple times)

---

#### validateSetupAvailability(date, regionId, setupRequiredCount)

Check if setups are available on a date.

```javascript
const validation = Domain.SessionResourceService.validateSetupAvailability(
  '2025-03-10',
  'occitanie',
  1
);

// Result:
{
  success: true,
  date: '2025-03-10',
  regionId: 'occitanie',
  totalSetups: 5,
  availableSetups: 3,
  requiredSetups: 1,
  isValid: true,
  message: '3 setups available, 1 required'
}
```

**Dependencies:**
- Uses `Domain.AvailabilityEngine.getAvailableSetups()`
- Respects operator availability

---

#### getSessionSetups(sessionId)

Retrieve setup objects linked to a session.

```javascript
const result = Domain.SessionResourceService.getSessionSetups('sess_123');

// Result:
{
  success: true,
  sessionId: 'sess_123',
  setups: [
    { id: 'setup_1', name: 'Setup A', regionIds: ['occitanie'] },
    { id: 'setup_2', name: 'Setup B', regionIds: ['occitanie'] }
  ],
  count: 2,
  setupIds: ['setup_1', 'setup_2'],
  regionId: 'occitanie'
}
```

---

#### getSessionWithResources(sessionId)

Get session with full resource information.

```javascript
const result = Domain.SessionResourceService.getSessionWithResources('sess_123');

// Result:
{
  success: true,
  session: {
    id: 'sess_123',
    date: '2025-03-10',
    clientId: 'client_1',
    status: 'booked',
    regionId: 'occitanie',
    setupIds: ['setup_1', 'setup_2'],
    resources: {
      setupIds: ['setup_1', 'setup_2'],
      setups: [...],
      setupCount: 2,
      regionId: 'occitanie'
    }
  }
}
```

---

#### validateSessionResources(sessionId, minSetups)

Check if session has minimum required setups.

```javascript
const validation = Domain.SessionResourceService.validateSessionResources(
  'sess_123',
  1
);

// Result:
{
  success: true,
  sessionId: 'sess_123',
  setupCount: 2,
  requiredCount: 1,
  isValid: true,
  message: 'Session has 2 setups (requires 1)'
}
```

---

#### clearSessionSetups(sessionId)

Remove all setups from a session.

```javascript
const result = Domain.SessionResourceService.clearSessionSetups('sess_123');

// Result:
{
  success: true,
  sessionId: 'sess_123',
  clearedCount: 2,
  message: 'Cleared 2 setups from session sess_123'
}
```

---

## 2. SessionMigrationHelper

Defensive utilities for handling both legacy and new session formats.

### API Reference

#### ensureSessionResourceFields(session)

Ensure session has all required fields.

```javascript
const session = { id: 'sess_1', date: '2025-03-10' };
const ensured = Domain.SessionMigrationHelper.ensureSessionResourceFields(session);

// Result:
{
  id: 'sess_1',
  date: '2025-03-10',
  regionId: null,          // Added
  setupIds: []             // Added
}
```

**No persistence** - returns modified copy only.

---

#### hasResourceBindingFields(session)

Check if session has new resource fields.

```javascript
const has = Domain.SessionMigrationHelper.hasResourceBindingFields(session);
// true if session has both setupIds and regionId fields
```

---

#### hasLegacySetupField(session)

Check if session uses old `setupId` (singular).

```javascript
const legacy = Domain.SessionMigrationHelper.hasLegacySetupField(session);
// true if session has setupId field
```

---

#### assessMigrationStatus(sessions)

Analyze migration readiness for batch of sessions.

```javascript
const sessions = [...];
const status = Domain.SessionMigrationHelper.assessMigrationStatus(sessions);

// Result:
{
  total: 100,
  withResourceFields: 75,
  missingFields: 25,
  withLegacyField: 10,
  percentageMigrated: 75,
  summary: '75/100 sessions have resource fields (75%)'
}
```

---

#### getSetupIds(session)

Safe getter for setup IDs (handles both old and new formats).

```javascript
const setupIds = Domain.SessionMigrationHelper.getSetupIds(session);
// Returns array, handles both setupIds and setupId fields
```

---

#### normalizeSession(session)

Create normalized session with all fields.

```javascript
const normalized = Domain.SessionMigrationHelper.normalizeSession(session);
// Returns session with standardized field names
```

---

#### validateSessionBinding(session)

Validate session resource binding structure.

```javascript
const validation = Domain.SessionMigrationHelper.validateSessionBinding(session);

// Result:
{
  valid: true,
  errors: [],
  session: {
    id: 'sess_1',
    hasRegionId: true,
    hasSetupIds: true,
    setupCount: 2
  }
}
```

---

#### filterByResourceStatus(sessions, withResources)

Filter sessions by binding status.

```javascript
// Get sessions WITH setups
const bound = Domain.SessionMigrationHelper.filterByResourceStatus(sessions, true);

// Get sessions WITHOUT setups (legacy)
const unbound = Domain.SessionMigrationHelper.filterByResourceStatus(sessions, false);
```

---

#### debugSession(session)

Print debugging info for a session.

```javascript
const debug = Domain.SessionMigrationHelper.debugSession(session);
// Returns detailed field information for debugging
```

---

## Critical Fixes in AvailabilityEngine

### 1. Session Filtering (Line 27-52)

**Before:**
```javascript
return sessions.filter(session => {
  const sessionDate = session.date || session.scheduledDate;
  return sessionDate === date &&
         setupIds.includes(session.setupId) &&  // ❌ WRONG: assumes singular setupId
         session.status !== 'cancelled';
});
```

**After:**
```javascript
return sessions.filter(session => {
  const sessionDate = session.date || session.scheduledDate;
  const sessionSetupIds = session.setupIds || (session.setupId ? [session.setupId] : []);
  const usesRegionSetup = sessionSetupIds.some(sessionSetupId =>
    setupIds.includes(sessionSetupId)
  );
  return sessionDate === date &&
         usesRegionSetup &&  // ✓ CORRECT: handles both formats
         session.status !== 'cancelled';
});
```

**Handles:**
- New format: `session.setupIds = [...]`
- Legacy format: `session.setupId = '...'`
- Missing setups: defaults to `[]`

---

### 2. Setup Counting (Line 60-80)

**Before:**
```javascript
function _countUsedSetups(date, regionId) {
  const sessions = _getSessionsOnDateInRegion(date, regionId);
  return sessions.length;  // ❌ WRONG: counts sessions, not setups
}
```

**After:**
```javascript
function _countUsedSetups(date, regionId) {
  const sessions = _getSessionsOnDateInRegion(date, regionId);
  const usedSetupIds = new Set();
  sessions.forEach(session => {
    const sessionSetupIds = session.setupIds || (session.setupId ? [session.setupId] : []);
    sessionSetupIds.forEach(setupId => {
      usedSetupIds.add(setupId);  // ✓ CORRECT: counts unique setups
    });
  });
  return usedSetupIds.size;
}
```

**Handles:**
- Multiple setups per session
- Deduplication (same setup in multiple sessions)
- Legacy `setupId` field

---

### 3. Availability Calculation (Line 142-202)

**Before:**
```javascript
const availableSetups = Math.max(0, totalSetups - usedSetups);
const isAvailable = availableSetups > 0 && operatorsAvailable > 0;  // ❌ WRONG LOGIC
```

**After:**
```javascript
const freeSetups = Math.max(0, totalSetups - usedSetups);
const availableSetups = Math.min(freeSetups, operatorsAvailable);  // ✓ CORRECT: MIN rule
const isAvailable = availableSetups > 0;
```

**Business Rule:**
```
availableSetups = MIN(
    freeSetups,
    operatorsAvailable
)
```

**Why This Matters:**
- 5 free setups + 2 available operators = 2 available (not 5)
- 1 free setup + 10 available operators = 1 available (not 10)
- 0 operators = 0 available (not any number of setups)

---

## Usage Examples

### Example 1: Assign Setup to Session

```javascript
// User books session on March 10 in Occitanie
const assigned = Domain.SessionResourceService.assignSetupToSession(
  'sess_march_10',
  'setup_occitanie_1'
);

if (assigned.success) {
  console.log(`✓ Setup assigned`);
  console.log(`  Session: ${assigned.sessionId}`);
  console.log(`  Setup: ${assigned.setupId}`);
  console.log(`  Region: ${assigned.regionId}`);
  // Now session is bound to setup, availability is reduced
} else {
  console.error(`✗ Assignment failed: ${assigned.error}`);
  // Setup in use or other error
}
```

---

### Example 2: Check Before Booking

```javascript
// User wants to book session, check availability first
const validation = Domain.SessionResourceService.validateSetupAvailability(
  '2025-03-10',
  'occitanie',
  1  // Need 1 setup
);

if (validation.isValid) {
  // Assign setup
  const assigned = Domain.SessionResourceService.assignSetupToSession(
    newSessionId,
    availableSetups[0].id
  );
} else {
  // Show message
  console.log(`Cannot book: ${validation.message}`);
  // Show alternative dates
  const alternatives = Domain.AvailabilityEngine.getAvailableDates('occitanie', 5);
}
```

---

### Example 3: Migrate Batch of Sessions

```javascript
// Analyze current migration status
const allSessions = DB.sessions.getAll();
const status = Domain.SessionMigrationHelper.assessMigrationStatus(allSessions);

console.log(status.summary);
// "75/100 sessions have resource fields (75%)"

// Get sessions that need migration
const legacySessions = Domain.SessionMigrationHelper.filterByResourceStatus(
  allSessions,
  false  // Get sessions WITHOUT setups
);

console.log(`${legacySessions.length} sessions need resource binding`);

// For each legacy session, ensure fields exist
legacySessions.forEach(session => {
  const normalized = Domain.SessionMigrationHelper.normalizeSession(session);
  // Can now safely access: normalized.setupIds, normalized.regionId
});
```

---

### Example 4: Release Setup from Session

```javascript
// Session cancelled - release the setup
const released = Domain.SessionResourceService.releaseSetupFromSession(
  'sess_cancelled',
  'setup_occitanie_1'
);

if (released.success) {
  console.log(`✓ Setup released`);
  // Setup now available for other bookings
  // Check availability again
  const availability = Domain.AvailabilityEngine.getAvailableSetups(
    session.date,
    session.regionId
  );
  console.log(`Available setups: ${availability.availableSetups}`);
}
```

---

### Example 5: Get Full Session Resource Info

```javascript
// Load session with all resource details
const result = Domain.SessionResourceService.getSessionWithResources('sess_123');

if (result.success) {
  const session = result.session;
  console.log(`Session: ${session.id}`);
  console.log(`Booked setups: ${session.resources.setupCount}`);
  console.log(`Region: ${session.resources.regionId}`);
  console.log(`Setup names: ${session.resources.setups.map(s => s.name).join(', ')}`);

  // Display in UI
  renderSessionDetails(session);
}
```

---

### Example 6: Validate Session Before Completing

```javascript
// Before marking session as completed, ensure it has setups
const validation = Domain.SessionResourceService.validateSessionResources(
  'sess_123',
  1  // Minimum 1 setup required
);

if (validation.isValid) {
  // Can complete session
  completeSession(sessionId);
} else {
  // Session incomplete - missing setups
  showError(`Cannot complete: ${validation.message}`);
  // Show which setups need to be assigned
}
```

---

## Backward Compatibility

### Legacy Sessions Still Work

Sessions without `setupIds` and `regionId` continue to function:

```javascript
const legacySession = {
  id: 'sess_old_1',
  date: '2025-02-20',
  clientId: 'client_1'
  // No setupIds, no regionId
};

// SessionMigrationHelper handles it
const normalized = Domain.SessionMigrationHelper.normalizeSession(legacySession);
console.log(normalized.setupIds);  // []
console.log(normalized.regionId);  // null

// AvailabilityEngine doesn't break
const availability = Domain.AvailabilityEngine.getAvailableSetups(
  legacySession.date,
  'occitanie'
);
// Works fine, ignores legacy session that has no setupIds
```

---

## Data Persistence

### Storage Strategy

Sessions are persisted via:
1. **DB.sessions.update()** if available
2. **localStorage['dst_sessions']** as fallback

No database migration required - existing storage continues to work.

---

## Migration Roadmap

### Phase 1: Analyze (Week 1)
```javascript
const status = Domain.SessionMigrationHelper.assessMigrationStatus(
  DB.sessions.getAll()
);
console.log(status);  // See how many sessions need binding
```

### Phase 2: Bind (Week 2-4)
```javascript
// Progressively assign setups to sessions
const unbound = Domain.SessionMigrationHelper.filterByResourceStatus(allSessions, false);
unbound.forEach(session => {
  const assigned = Domain.SessionResourceService.assignSetupToSession(
    session.id,
    selectSetupForSession(session)
  );
});
```

### Phase 3: Verify (Week 4)
```javascript
const finalStatus = Domain.SessionMigrationHelper.assessMigrationStatus(
  DB.sessions.getAll()
);
console.log(finalStatus);  // Should see 100% migration
```

---

## Testing

### Browser Console Tests

```javascript
// 1. Create test session
const testSession = {
  id: 'test_' + Date.now(),
  date: '2025-03-10',
  clientId: 'client_test'
};
DB.sessions.create(testSession);

// 2. Assign setup
Domain.SessionResourceService.assignSetupToSession(testSession.id, 'setup_occitanie_1');

// 3. Get with resources
Domain.SessionResourceService.getSessionWithResources(testSession.id);

// 4. Check availability changed
Domain.AvailabilityEngine.getAvailableSetups('2025-03-10', 'occitanie');

// 5. Release setup
Domain.SessionResourceService.releaseSetupFromSession(testSession.id, 'setup_occitanie_1');

// 6. Verify availability restored
Domain.AvailabilityEngine.getAvailableSetups('2025-03-10', 'occitanie');
```

---

## Error Handling

All functions return structured responses:

```javascript
{
  success: boolean,
  // If success:
  data: any,
  // If failure:
  error: string,
  message: string
}
```

**Safe error handling pattern:**
```javascript
const result = Domain.SessionResourceService.assignSetupToSession(sessionId, setupId);

if (!result.success) {
  console.error(`Operation failed: ${result.error}`);
  return;
}

// Proceed with result.data
```

---

## Architecture Diagram

```
Layer 5: React Components (UI)
   ↓ uses
Layer 4a: SessionResourceService (NEW)
   ↓ uses
Layer 4b: Workflows (Orchestration)
   ↓ uses
Layer 3: AvailabilityEngine (FIXED)
   ↓ uses
Layer 2: SetupRepository, OperatorAvailabilityRepository
   ↓ uses
Layer 1: DB (Data Access)
```

**Key Points:**
- SessionResourceService sits between UI and Workflows
- Uses AvailabilityEngine for validation
- AvailabilityEngine fixes ensure correct availability calculation
- SessionMigrationHelper handles legacy data transparently

---

## FAQ

**Q: Do existing sessions break?**
A: No. Missing fields default to safe values.

**Q: Can one session use multiple setups?**
A: Yes, that's the whole point of `setupIds` array.

**Q: What if a setup is in use on a date?**
A: `assignSetupToSession()` returns error, requires different setup or date.

**Q: How do I know if a session has setups?**
A: Use `Session MigrationHelper.hasSetupReferences(session)`.

**Q: Can I migrate incrementally?**
A: Yes, `assessMigrationStatus()` shows progress.

---

**Last Updated:** 2025-02-20
**Version:** 1.0 Session Resource Binding
