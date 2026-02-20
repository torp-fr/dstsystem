# DST-System — Booking Workflow

## Overview

Complete client booking and session creation pipeline.

**Model:** Client reserves DATE + REGION → System auto-allocates SETUP.

**Two-Phase Booking:**
1. **Phase 1: Create** - Client requests session (status: `pending_confirmation`)
2. **Phase 2: Confirm** - Enterprise validates & allocates setup (status: `confirmed`)

---

## Architecture

### Booking Lifecycle

```
Client Portal
    ↓
Workflows.Booking.createSessionBooking()
    ├─ Validate module capacity
    ├─ Check date availability
    └─ Create session (pending_confirmation)
    ↓
Enterprise Validation
    ↓
Workflows.Booking.confirmSessionBooking()
    ├─ Verify availability still valid
    ├─ Find available setup
    ├─ Assign setup via SessionResourceService
    └─ Confirm session (confirmed)
    ↓
Mission Workflow (existing)
    ├─ Session execution
    ├─ Status updates
    └─ Session completion
```

### Key Business Rule

```
availableSetups = MIN(freeSetups, operatorsAvailable)
```

This is enforced by AvailabilityEngine (already fixed in previous implementation).

---

## API Reference

### 1. createSessionBooking(data)

Create new session booking (pending confirmation).

**Input:**
```javascript
{
  clientId,              // Required: 'client_123'
  regionId,              // Required: 'occitanie'
  date,                  // Required: '2025-03-10'
  moduleIds,             // Required: ['module_tir', 'module_scenario']
  requestedParticipants, // Required: 12
  offerId?               // Optional: 'offer_456'
}
```

**Returns:**
```javascript
{
  success: true,
  sessionId: 'sess_1708418400000_a1b2c3d4e',
  session: {
    id: 'sess_1708418400000_a1b2c3d4e',
    clientId: 'client_123',
    regionId: 'occitanie',
    date: '2025-03-10',
    moduleIds: ['module_tir', 'module_scenario'],
    requestedParticipants: 12,
    capacityMax: 12,
    status: 'pending_confirmation',
    setupIds: [],
    bookingSource: 'client_portal',
    createdAt: '2025-02-20T15:30:00Z'
  },
  message: 'Session sess_1708418400000_a1b2c3d4e created - awaiting confirmation',
  capacityMax: 12,
  availableSetups: 3,
  status: 'pending_confirmation'
}
```

**Error Cases:**
```javascript
// Capacity exceeded
{
  success: false,
  error: 'CAPACITY_EXCEEDED',
  message: '15 participants exceeds capacity of 12. Limited by Module X',
  capacityMax: 12,
  requestedParticipants: 15
}

// No availability
{
  success: false,
  error: 'NO_AVAILABILITY',
  message: 'No setups available on 2025-03-10 in occitanie',
  availableAlternatives: ['2025-03-11', '2025-03-12', '2025-03-13', '2025-03-14', '2025-03-15']
}
```

**Validation:**
- ✓ Module capacity checked via ModuleCapacityService
- ✓ Date availability checked via AvailabilityEngine
- ✓ Participants must fit module capacity
- ✓ Region must have available setups + operators

---

### 2. confirmSessionBooking(sessionId)

Confirm pending booking and allocate setup.

**Input:**
```javascript
'sess_1708418400000_a1b2c3d4e'
```

**Returns:**
```javascript
{
  success: true,
  sessionId: 'sess_1708418400000_a1b2c3d4e',
  allocatedSetupId: 'setup_occitanie_1',
  session: {
    id: 'sess_1708418400000_a1b2c3d4e',
    clientId: 'client_123',
    date: '2025-03-10',
    regionId: 'occitanie',
    status: 'confirmed',
    setupIds: ['setup_occitanie_1'],
    confirmedAt: '2025-02-20T16:00:00Z'
  },
  message: 'Session sess_1708418400000_a1b2c3d4e confirmed - setup setup_occitanie_1 allocated',
  status: 'confirmed'
}
```

**Error Cases:**
```javascript
// Wrong status
{
  success: false,
  error: 'INVALID_STATUS',
  message: "Session status is confirmed, expected 'pending_confirmation'",
  sessionId: 'sess_123'
}

// Availability changed (date now fully booked)
{
  success: false,
  error: 'NO_SETUP_AVAILABLE',
  message: 'No setups available on 2025-03-10 in occitanie',
  sessionId: 'sess_123',
  availableAlternatives: ['2025-03-11', '2025-03-12', ...]
}

// Session not found
{
  success: false,
  error: 'INVALID_STATUS',
  message: "Session sess_123 not found",
  sessionId: 'sess_123'
}
```

**Logic:**
1. Load session
2. Verify status is `pending_confirmation`
3. Re-check availability (might have changed since creation)
4. Get available setups in region
5. Assign first available setup via SessionResourceService
6. Update session status to `confirmed`

---

### 3. cancelPendingBooking(sessionId)

Delete pending booking (only for `pending_confirmation` status).

**Input:**
```javascript
'sess_1708418400000_a1b2c3d4e'
```

**Returns:**
```javascript
{
  success: true,
  sessionId: 'sess_1708418400000_a1b2c3d4e',
  message: 'Pending booking sess_1708418400000_a1b2c3d4e cancelled',
  status: 'cancelled'
}
```

**Error Cases:**
```javascript
// Cannot cancel confirmed booking
{
  success: false,
  error: 'INVALID_STATUS',
  message: "Cannot cancel session with status 'confirmed'",
  sessionId: 'sess_123'
}

// Already deleted
{
  success: true,
  sessionId: 'sess_123',
  message: 'Session already deleted'
}
```

**Rules:**
- Only cancels bookings in `pending_confirmation` status
- Confirmed bookings must use Mission workflow to cancel
- Safe to call multiple times

---

### 4. checkAvailability(regionId, date, moduleIds, participantCount)

Check if booking possible (does NOT create session).

**Input:**
```javascript
checkAvailability(
  'occitanie',                      // regionId
  '2025-03-10',                     // date
  ['module_tir', 'module_scenario'],// moduleIds
  15                                // participantCount
)
```

**Returns:**
```javascript
{
  success: true,
  regionId: 'occitanie',
  date: '2025-03-10',
  canBook: false,  // ← Combined verdict
  capacity: {
    isValid: false,
    capacityMax: 12,
    requestedParticipants: 15,
    message: '15 participants exceeds capacity of 12. Limited by Module X'
  },
  availability: {
    isAvailable: true,
    availableSetups: 3,
    operatorsAvailable: 4,
    totalSetups: 5,
    usedSetups: 2
  }
}
```

**Use Cases:**
- Pre-check before showing create form
- Dynamic validation as user fills form
- Show availability summary before booking

---

### 5. getBookingStatus(sessionId)

Get current booking status and details.

**Input:**
```javascript
'sess_1708418400000_a1b2c3d4e'
```

**Returns:**
```javascript
{
  success: true,
  sessionId: 'sess_1708418400000_a1b2c3d4e',
  session: {
    id: 'sess_1708418400000_a1b2c3d4e',
    clientId: 'client_123',
    date: '2025-03-10',
    regionId: 'occitanie',
    status: 'confirmed',
    setupIds: ['setup_occitanie_1'],
    setups: [
      { id: 'setup_occitanie_1', name: 'Setup Occitanie #1' }
    ],
    capacityMax: 12,
    requestedParticipants: 12,
    createdAt: '2025-02-20T15:30:00Z',
    confirmedAt: '2025-02-20T16:00:00Z'
  },
  isPending: false,
  isConfirmed: true
}
```

---

### 6. getSuggestedDates(regionId, count)

Get next available dates if booking fails.

**Input:**
```javascript
getSuggestedDates('occitanie', 5)
```

**Returns:**
```javascript
['2025-03-11', '2025-03-12', '2025-03-14', '2025-03-15', '2025-03-17']
```

**Use Cases:**
- Show alternative dates in UI when requested date unavailable
- Help user choose from available slots

---

## Usage Examples

### Example 1: Full Booking Flow

```javascript
// ============================================================
// STEP 1: Client initiates booking
// ============================================================

const bookingRequest = {
  clientId: 'client_acme',
  regionId: 'occitanie',
  date: '2025-03-10',
  moduleIds: ['module_tir_precision', 'module_scenario_tactical'],
  requestedParticipants: 15,
  offerId: 'offer_package_pro'
};

const created = Workflows.Booking.createSessionBooking(bookingRequest);

if (!created.success) {
  console.error(`❌ Cannot create booking: ${created.error}`);
  console.log(`Available dates:`, created.availableAlternatives);
  return;
}

console.log(`✓ Session created: ${created.sessionId}`);
console.log(`Status: ${created.status}`);
console.log(`Available setups in region: ${created.availableSetups}`);
// Output:
// ✓ Session created: sess_1708418400000_a1b2c3d4e
// Status: pending_confirmation
// Available setups in region: 2

// ============================================================
// STEP 2: Check status before confirmation
// ============================================================

const status = Workflows.Booking.getBookingStatus(created.sessionId);

console.log(`Session ${status.session.id} is ${status.isPending ? 'pending' : 'confirmed'}`);
console.log(`Capacity: ${status.session.requestedParticipants}/${status.session.capacityMax}`);

// ============================================================
// STEP 3: Enterprise confirms booking
// ============================================================

const confirmed = Workflows.Booking.confirmSessionBooking(created.sessionId);

if (!confirmed.success) {
  console.error(`❌ Cannot confirm: ${confirmed.error}`);
  // Check suggested dates and retry
  const alternatives = Workflows.Booking.getSuggestedDates('occitanie', 5);
  console.log(`Try these dates:`, alternatives);
  return;
}

console.log(`✓ Booking confirmed!`);
console.log(`Allocated setup: ${confirmed.allocatedSetupId}`);
console.log(`New status: ${confirmed.status}`);
// Output:
// ✓ Booking confirmed!
// Allocated setup: setup_occitanie_1
// New status: confirmed

// ============================================================
// STEP 4: Session now in Mission workflow
// ============================================================

// Next step: Workflows.Mission.completeMission() etc.
const missionResult = Workflows.Mission.completeMission(
  confirmed.sessionId,
  'terminee'
);
```

---

### Example 2: Check Availability Before Booking

```javascript
// User selects region, date, modules in form
// Validate dynamically as they type

function validateBooking() {
  const regionId = document.getElementById('region').value;
  const date = document.getElementById('date').value;
  const moduleIds = Array.from(document.querySelectorAll('input[name="modules"]:checked'))
    .map(el => el.value);
  const participants = parseInt(document.getElementById('participants').value) || 0;

  const check = Workflows.Booking.checkAvailability(
    regionId,
    date,
    moduleIds,
    participants
  );

  if (!check.success) {
    showError('Cannot check availability');
    return;
  }

  // Show capacity info
  if (!check.capacity.isValid) {
    document.getElementById('capacityError').textContent = check.capacity.message;
    document.getElementById('capacityError').style.display = 'block';
  } else {
    document.getElementById('capacityError').style.display = 'none';
  }

  // Show availability info
  const availMsg = `${check.availability.availableSetups} setups available`;
  document.getElementById('availabilityInfo').textContent = availMsg;

  // Enable/disable book button
  const bookBtn = document.getElementById('bookBtn');
  bookBtn.disabled = !check.canBook;

  if (!check.canBook && !check.capacity.isValid) {
    // Suggest alternatives
    const alternatives = Workflows.Booking.getSuggestedDates(regionId, 3);
    showAlternativeDates(alternatives);
  }
}

// Call on form change
document.getElementById('region').addEventListener('change', validateBooking);
document.getElementById('date').addEventListener('change', validateBooking);
```

---

### Example 3: Cancel Pending Booking

```javascript
// User clicks "Cancel Booking" while still pending

async function cancelBooking(sessionId) {
  const confirmed = await confirm('Cancel this pending booking?');
  if (!confirmed) return;

  const result = Workflows.Booking.cancelPendingBooking(sessionId);

  if (!result.success) {
    showError(`Cannot cancel: ${result.message}`);
    return;
  }

  showSuccess(`Booking cancelled`);
  redirectToBookings();
}
```

---

### Example 4: Batch Check Multiple Dates

```javascript
// Find next available date for specific region/modules

async function findNextAvailable(regionId, moduleIds, participants) {
  const alternatives = Workflows.Booking.getSuggestedDates(regionId, 10);

  for (const date of alternatives) {
    const check = Workflows.Booking.checkAvailability(
      regionId,
      date,
      moduleIds,
      participants
    );

    if (check.canBook) {
      return {
        date,
        availableSetups: check.availability.availableSetups,
        operators: check.availability.operatorsAvailable
      };
    }
  }

  return null;  // Nothing available in next 10 days
}

// Usage
const nextDate = await findNextAvailable('occitanie', ['module_tir'], 12);
if (nextDate) {
  console.log(`Next available: ${nextDate.date} (${nextDate.availableSetups} setups)`);
}
```

---

## Session Statuses

### `pending_confirmation`
- Booking created by client
- Awaiting enterprise validation
- Can be cancelled without releasing setups
- No setup allocated yet

### `confirmed`
- Enterprise validated the booking
- Setup has been allocated
- Ready for session execution
- Must use Mission workflow to cancel

### Other Statuses
- `scheduled`, `in_progress`, `completed`, `cancelled`
  (Managed by Mission workflow, not Booking workflow)

---

## Error Handling

All functions return structured responses:

```javascript
{
  success: boolean,
  error?: string,      // Error code (e.g., 'NO_AVAILABILITY')
  message?: string,    // Human-readable message
  [data fields...]     // Context-specific fields
}
```

**Safe Pattern:**
```javascript
const result = Workflows.Booking.createSessionBooking(data);

if (!result.success) {
  console.error(`[${result.error}] ${result.message}`);
  return;
}

// Proceed with result.sessionId
```

---

## Data Persistence

### Session Fields Added by Booking

```javascript
{
  status: 'pending_confirmation' | 'confirmed',
  setupIds: [],           // Empty until confirmed
  regionId: '...',        // Set by booking request
  bookingSource: 'client_portal',
  createdAt: '2025-02-20T15:30:00Z',
  confirmedAt: '2025-02-20T16:00:00Z'  // Set when confirmed
}
```

### Storage

- Persisted via DB.sessions.create/update
- Fallback to localStorage if DB unavailable
- Compatible with existing session structure

---

## Integration Points

### AvailabilityEngine (Read-Only)
- `isDateAvailable()` - Check if date bookable
- `getAvailableSetups()` - Get setup info
- `getAvailableDates()` - Get alternatives

### SessionResourceService (Used for Confirmation)
- `assignSetupToSession()` - Allocate setup during confirm

### ModuleCapacityService (Read-Only)
- `validateParticipantCount()` - Check capacity

### SetupRepository (Read-Only)
- `getByRegion()` - Find available setups
- `getById()` - Load setup details

### DB.sessions (Read-Write)
- `getById()` - Load session
- `create()` - Create new session
- `update()` - Update session status/fields
- `delete()` - Delete pending bookings

---

## Testing in Console

```javascript
// 1. Check availability
Workflows.Booking.checkAvailability('occitanie', '2025-03-10', ['mod_1'], 10);

// 2. Create booking
const created = Workflows.Booking.createSessionBooking({
  clientId: 'test_client',
  regionId: 'occitanie',
  date: '2025-03-10',
  moduleIds: ['mod_1'],
  requestedParticipants: 10
});

// 3. Get status
Workflows.Booking.getBookingStatus(created.sessionId);

// 4. Confirm booking
const confirmed = Workflows.Booking.confirmSessionBooking(created.sessionId);

// 5. Verify confirmed
Workflows.Booking.getBookingStatus(confirmed.sessionId);

// 6. Get alternatives
Workflows.Booking.getSuggestedDates('occitanie', 5);
```

---

## Architectural Decisions

### Why Two Phases?

**Phase 1 (Create):**
- Reduces latency for client request
- Validates against current availability snapshot
- Allows enterprise to review before allocation

**Phase 2 (Confirm):**
- Re-checks availability (might have changed)
- Allocates specific setup
- Locks in booking

### Why No Auto-Allocation?

Auto-allocation during creation could fail if availability changed.
Two-phase design handles this gracefully.

### Why Delete vs Archive?

Pending bookings are deleted (not archived) because:
- They have no setup allocated
- No business data to preserve
- Clean database

---

## FAQ

**Q: Can a session have multiple setups?**
A: Currently one setup per session. BookingWorkflow allocates first available.

**Q: What if all dates are full?**
A: `getSuggestedDates()` returns empty array. UI should show "No availability."

**Q: Can I change a confirmed booking?**
A: No, use Mission workflow to cancel+rebook.

**Q: What if operator becomes unavailable after confirm?**
A: AvailabilityEngine will exclude that date next time. Already-confirmed sessions stay.

**Q: How long can a booking stay pending?**
A: No timeout enforced. Can stay pending indefinitely until confirmed or cancelled.

---

**Last Updated:** 2025-02-20
**Version:** 1.0 Booking Workflow
