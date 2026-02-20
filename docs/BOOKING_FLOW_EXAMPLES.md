# Booking Flow — Human-Driven Business Process

## Architecture

```
CLIENT CREATES SESSION
(status: pending_confirmation, marketplace_visible: false)
          ↓
ENTERPRISE CONFIRMS SESSION
(status: confirmed, marketplace_visible: true)
          ↓
OPERATOR VIEWS MARKETPLACE
(only confirmed, marketplace_visible sessions)
          ↓
OPERATOR APPLIES
(creates session_operators, status: pending)
          ↓
ENTERPRISE ACCEPTS/REJECTS
(session_operators, status: accepted OR rejected)
          ↓
FINAL RULE: Session can only be operational
when at least one operator has status: accepted
```

---

## Complete Flow Examples

### SCENARIO 1: Client Creates Session Request

**Role:** Client (shooter_id='client_001')
**Status:** pending_confirmation
**Marketplace:** Not visible

```javascript
// Step 1: Client creates session request
const result = BookingFlowController.createSessionRequest({
  clientId: 'client_001',
  date: '2025-03-20',
  setupIds: ['setup_laser_1', 'setup_laser_2'],
  operatorRequirement: {
    minOperators: 2,
    preferredOperators: 3
  },
  notes: 'Entraînement compétition équipe tir fédérale'
});

console.log(result);
// {
//   success: true,
//   session: {
//     id: 'sess_abc123',
//     client_id: 'client_001',
//     date: '2025-03-20',
//     status: 'pending_confirmation',
//     marketplace_visible: false,
//     setup_ids: ['setup_laser_1', 'setup_laser_2'],
//     operator_requirement: { minOperators: 2, preferredOperators: 3 },
//     created_at: '2025-02-20T10:30:00Z'
//   },
//   message: 'Session request created. Awaiting enterprise confirmation.'
// }
```

---

### SCENARIO 2: Enterprise Reviews and Confirms Session

**Role:** Enterprise (founder/admin)
**Session ID:** sess_abc123
**Action:** Make public on marketplace

```javascript
// Step 2: Enterprise confirms the session
const confirmed = BookingFlowController.enterpriseConfirmSession('sess_abc123');

console.log(confirmed);
// {
//   success: true,
//   session: {
//     id: 'sess_abc123',
//     client_id: 'client_001',
//     date: '2025-03-20',
//     status: 'confirmed',
//     marketplace_visible: true,
//     setup_ids: ['setup_laser_1', 'setup_laser_2'],
//     operator_requirement: { minOperators: 2, preferredOperators: 3 },
//     updated_at: '2025-02-20T11:00:00Z'
//   },
//   message: 'Session confirmed and now visible on marketplace'
// }
```

---

### SCENARIO 3: Operator Views Marketplace Sessions

**Role:** Operator (operator_id='op_001')
**View:** All confirmed sessions available to apply

```javascript
// Step 3: Operator views marketplace
const marketplace = BookingFlowController.getMarketplaceSessions({
  filters: {
    region: 'occitanie'
  },
  sortBy: 'date',
  limit: 50
});

console.log(marketplace);
// {
//   success: true,
//   sessions: [
//     {
//       id: 'sess_abc123',
//       client_id: 'client_001',
//       date: '2025-03-20',
//       status: 'confirmed',
//       marketplace_visible: true,
//       setup_ids: ['setup_laser_1', 'setup_laser_2'],
//       operator_requirement: { minOperators: 2, preferredOperators: 3 },
//       notes: 'Entraînement compétition équipe tir fédérale'
//     },
//     {
//       id: 'sess_xyz789',
//       client_id: 'client_002',
//       date: '2025-03-22',
//       status: 'confirmed',
//       marketplace_visible: true,
//       setup_ids: ['setup_laser_1'],
//       operator_requirement: { minOperators: 1, preferredOperators: 2 },
//       notes: 'Session formation gendarmerie'
//     }
//   ],
//   count: 2,
//   message: 'Found 2 marketplace sessions'
// }
```

---

### SCENARIO 4: Operator Applies to Session

**Role:** Operator (operator_id='op_001')
**Session:** sess_abc123
**Action:** Apply (status: pending, awaits acceptance)

```javascript
// Step 4: Operator applies to a session
const application = MarketplaceController.applyToSession(
  'sess_abc123',  // sessionId
  'op_001'        // operatorId
);

console.log(application);
// {
//   success: true,
//   application: {
//     id: 'app_def456',
//     session_id: 'sess_abc123',
//     operator_id: 'op_001',
//     status: 'pending',
//     applied_at: '2025-02-20T14:30:00Z'
//   },
//   message: 'Application sent. Enterprise will review and accept or reject.'
// }
```

---

### SCENARIO 5: Another Operator Also Applies

**Role:** Operator (operator_id='op_002')
**Session:** sess_abc123
**Action:** Also apply

```javascript
// Another operator applies to same session
const application2 = MarketplaceController.applyToSession(
  'sess_abc123',  // sessionId
  'op_002'        // operatorId
);

console.log(application2);
// {
//   success: true,
//   application: {
//     id: 'app_ghi789',
//     session_id: 'sess_abc123',
//     operator_id: 'op_002',
//     status: 'pending',
//     applied_at: '2025-02-20T15:00:00Z'
//   },
//   message: 'Application sent. Enterprise will review and accept or reject.'
// }
```

---

### SCENARIO 6: Enterprise Accepts First Operator

**Role:** Enterprise
**Session:** sess_abc123
**Operator:** op_001
**Action:** Accept application

```javascript
// Enterprise accepts first operator
const accepted = MarketplaceController.acceptOperator(
  'sess_abc123',  // sessionId
  'op_001'        // operatorId
);

console.log(accepted);
// {
//   success: true,
//   application: {
//     id: 'app_def456',
//     session_id: 'sess_abc123',
//     operator_id: 'op_001',
//     status: 'accepted',
//     applied_at: '2025-02-20T14:30:00Z',
//     accepted_at: '2025-02-20T16:00:00Z'
//   },
//   message: 'Operator op_001 accepted for session sess_abc123'
// }
```

---

### SCENARIO 7: Enterprise Rejects Second Operator

**Role:** Enterprise
**Session:** sess_abc123
**Operator:** op_002
**Action:** Reject application

```javascript
// Enterprise rejects second operator
const rejected = MarketplaceController.rejectOperator(
  'sess_abc123',  // sessionId
  'op_002'        // operatorId
);

console.log(rejected);
// {
//   success: true,
//   application: {
//     id: 'app_ghi789',
//     session_id: 'sess_abc123',
//     operator_id: 'op_002',
//     status: 'rejected',
//     applied_at: '2025-02-20T15:00:00Z',
//     rejected_at: '2025-02-20T16:15:00Z'
//   },
//   message: 'Operator op_002 rejected for session sess_abc123'
// }
```

**Session Status:**
- Status: confirmed ✓
- Marketplace visible: true ✓
- Operators assigned:
  - op_001: accepted ✓
  - op_002: rejected ✗
- **Session is now OPERATIONAL** (at least one accepted operator)

---

## Error Scenarios

### Client: Unauthorized Role

```javascript
// Client with wrong role tries to create session
const error1 = BookingFlowController.createSessionRequest({
  clientId: 'client_001',
  date: '2025-03-20',
  setupIds: ['setup_1']
});

// Assuming user has 'operator' role instead of 'client'
// {
//   success: false,
//   error: 'UNAUTHORIZED',
//   details: 'Only clients can create session requests'
// }
```

### Enterprise: Session Not Found

```javascript
const error2 = BookingFlowController.enterpriseConfirmSession('sess_nonexistent');

// {
//   success: false,
//   error: 'SESSION_NOT_FOUND',
//   details: 'Session sess_nonexistent not found'
// }
```

### Enterprise: Session Wrong Status

```javascript
const error3 = BookingFlowController.enterpriseConfirmSession('sess_abc123');

// Called again when already confirmed:
// {
//   success: false,
//   error: 'INVALID_STATUS',
//   details: 'Session must be pending_confirmation, is confirmed'
// }
```

### Operator: Already Applied

```javascript
const error4 = MarketplaceController.applyToSession('sess_abc123', 'op_001');

// Called again:
// {
//   success: false,
//   error: 'ALREADY_APPLIED',
//   details: 'You have already applied to this session'
// }
```

### Enterprise: No Pending Application

```javascript
const error5 = MarketplaceController.acceptOperator('sess_abc123', 'op_999');

// Operator who never applied:
// {
//   success: false,
//   error: 'APPLICATION_NOT_FOUND',
//   details: 'Operator op_999 has not applied to session sess_abc123'
// }
```

### Enterprise: Double Accept

```javascript
const error6 = MarketplaceController.acceptOperator('sess_abc123', 'op_001');

// Called again:
// {
//   success: false,
//   error: 'INVALID_STATUS',
//   details: 'Application status is accepted, not pending'
// }
```

---

## Complete Business Sequence

```javascript
/**
 * Complete human-driven booking flow
 */

// 1. CLIENT CREATES REQUEST
const createResult = BookingFlowController.createSessionRequest({
  clientId: 'client_gendarme_01',
  date: '2025-03-20',
  setupIds: ['setup_1', 'setup_2'],
  operatorRequirement: { minOperators: 2, preferredOperators: 3 },
  notes: 'Formation équipe GIGN'
});
console.log('✓ Session created:', createResult.session.id);

// 2. ENTERPRISE CONFIRMS
const sessionId = createResult.session.id;
const confirmResult = BookingFlowController.enterpriseConfirmSession(sessionId);
console.log('✓ Session confirmed and visible on marketplace');

// 3. OPERATORS VIEW MARKETPLACE
const marketResult = BookingFlowController.getMarketplaceSessions({ limit: 10 });
console.log(`✓ ${marketResult.count} marketplace sessions available`);

// 4. OPERATOR 1 APPLIES
const app1 = MarketplaceController.applyToSession(sessionId, 'op_jean_dupont');
console.log('✓ Jean Dupont applied');

// 5. OPERATOR 2 APPLIES
const app2 = MarketplaceController.applyToSession(sessionId, 'op_marie_martin');
console.log('✓ Marie Martin applied');

// 6. OPERATOR 3 APPLIES
const app3 = MarketplaceController.applyToSession(sessionId, 'op_pierre_fontaine');
console.log('✓ Pierre Fontaine applied');

// 7. ENTERPRISE REVIEWS APPLICATIONS

// Accept Jean (best fit)
const accept1 = MarketplaceController.acceptOperator(sessionId, 'op_jean_dupont');
console.log('✓ Jean Dupont accepted');

// Accept Marie (also good)
const accept2 = MarketplaceController.acceptOperator(sessionId, 'op_marie_martin');
console.log('✓ Marie Martin accepted');

// Reject Pierre (conflicting schedule)
const reject1 = MarketplaceController.rejectOperator(sessionId, 'op_pierre_fontaine');
console.log('✓ Pierre Fontaine rejected');

// FINAL STATE:
// Session: confirmed ✓
// Marketplace: visible ✓
// Operators: 2 accepted (requirements met) ✓
// Status: OPERATIONAL
```

---

## Data Model

### Session States

```
CLIENT          ENTERPRISE          MARKETPLACE
  │                │                     │
  └─ Creates ──→ pending_confirmation ──┐
                                        │
                 ├─ Confirms ─→ confirmed + visible ─→ ✓ on marketplace
                 │
                 └─ Rejects ─→ rejected (removed from view)
```

### Session Operators States

```
OPERATOR             ENTERPRISE
  │                     │
  └─ Applies ──→ pending
                   │
                   ├─ Accepts ──→ accepted ✓ (assigned)
                   │
                   └─ Rejects ──→ rejected ✗ (not assigned)
```

---

## Key Business Rules

1. **Client-Only Action:** Only clients with `client` role can create session requests
2. **Enterprise-Only Actions:** Only enterprise with `enterprise` role can confirm sessions and accept/reject operators
3. **Operator-Only Actions:** Only operators with `operator` role can view marketplace and apply
4. **Visibility Rule:** Sessions only appear on marketplace when `status=confirmed` AND `marketplace_visible=true`
5. **Application Rule:** Operators can apply multiple times (once per session max)
6. **Acceptance Rule:** Operator must have `status=pending` to be accepted or rejected
7. **Operational Rule:** Session becomes operational when at least one operator has `status=accepted`
8. **No Automation:** All decisions are manual — no automatic assignment, no scoring, no AI recommendations

---

## Table Structure

### shooting_sessions

```
id                    uuid (primary key)
client_id             uuid (foreign key → clients)
date                  date
status                'pending_confirmation' | 'confirmed' | 'rejected'
marketplace_visible   boolean
setup_ids             uuid[]
operator_requirement  jsonb { minOperators: int, preferredOperators: int }
notes                 text
created_at            timestamp
updated_at            timestamp
```

### session_operators

```
id                    uuid (primary key)
session_id            uuid (foreign key → shooting_sessions)
operator_id           uuid (foreign key → operators)
status                'pending' | 'accepted' | 'rejected'
applied_at            timestamp
accepted_at           timestamp (nullable)
rejected_at           timestamp (nullable)
created_at            timestamp
```

---

## Role Guards

All controller functions use `RoleGuardService.can()` before executing:

```javascript
// Check role
if (!RoleGuardService.can('client', 'create_session_request')) {
  return { success: false, error: 'UNAUTHORIZED' };
}
```

Roles:
- `client` → can create session requests
- `operator` → can view marketplace and apply
- `enterprise` → can confirm sessions and accept/reject operators

---

## No External Dependencies

Controllers use ONLY:
- ✓ RoleGuardService (role validation)
- ✓ SupabaseAdapter (data persistence)
- ✓ Workflows (business logic)

NOT used:
- ✗ AutoMatchEngine
- ✗ StaffingRiskEngine
- ✗ Any AI/scoring system
- ✗ Automatic operators
- ✗ Predictive logic
