# DST-System — Domain Foundation Layer

## Overview

The Domain Foundation Layer is a pure business logic layer that implements core resource capacity management for the DST-System platform.

**Key Concept:** DST is NOT an LMS. It is a **RESOURCE CAPACITY MANAGEMENT** platform for booking tactical training sessions.

- A **SESSION** = one booked training day for ONE client
- Price is per **SESSION**, not per participant
- Each session consumes **SETUPS**
- A **SETUP** = simulator + operator requirement + regional deployment

### Availability Model

Availability is based on **SETUPS**, not sessions. Works like booking.com:
- Region Occitanie has 5 SETUPS
- Session booked on March 10 uses 1 SETUP
- That SETUP is now unavailable on March 10 for all other clients
- Other 4 SETUPS remain available on March 10

---

## Architecture Stack

```
Layer 5: React Components (UI)
  ↓ (uses)
Layer 4: Workflows (Orchestration)
  ↓ (uses)
Layer 3: Domain (Foundation) ← NEW
  ↓ (uses)
Layer 2: Engine (Calculations)
  ↓ (uses)
Layer 1: DB (Data Access)
```

---

## Files Created

```
/js/domain/
├── index.js                              (Central export)
├── setup.repository.js                   (Setup CRUD)
├── operatorAvailability.repository.js    (Operator planning)
├── availability.engine.js                (Booking logic)
└── moduleCapacity.service.js             (Capacity constraints)
```

---

## Module Documentation

### 1. SetupRepository

**Responsibility:** Manage SETUPs (simulators/operators/regions)

```javascript
// Get all setups
const allSetups = Domain.SetupRepository.getAll();

// Get setups in a specific region
const occitanieSetups = Domain.SetupRepository.getByRegion('occitanie');

// Get setup by ID
const setup = Domain.SetupRepository.getById('setup_123');

// Get only active setups
const activeSetups = Domain.SetupRepository.getActive();

// Create new setup
const newSetup = Domain.SetupRepository.create({
  name: 'Setup Occitanie 1',
  regionIds: ['occitanie'],
  active: true
});

// Update setup
Domain.SetupRepository.update('setup_123', {
  name: 'Updated Name',
  active: false
});

// Delete setup (soft delete)
Domain.SetupRepository.delete('setup_123');
```

**Expected Structure:**
```javascript
{
  id: 'setup_123',
  name: 'Setup Occitanie 1',
  regionIds: ['occitanie', 'nouvelle_aquitaine'],
  active: true,
  createdAt: '2025-02-20T10:30:00Z'
}
```

---

### 2. OperatorAvailabilityRepository

**Responsibility:** Track operator availability hints (planning only)

**IMPORTANT:** Operator declarations are planning hints. Enterprise admin validates final availability.

```javascript
// Check if operator is available on a specific date
const available = Domain.OperatorAvailabilityRepository.isAvailableOnDate(
  'op_456',
  '2025-03-10'
);

// Get all unavailable dates for operator
const unavailable = Domain.OperatorAvailabilityRepository.getUnavailableDates('op_456');

// Add unavailable date
Domain.OperatorAvailabilityRepository.addUnavailableDate('op_456', '2025-03-10');

// Remove unavailable date
Domain.OperatorAvailabilityRepository.removeUnavailableDate('op_456', '2025-03-10');

// Set explicit available dates (whitelist mode)
Domain.OperatorAvailabilityRepository.setAvailableDates('op_456', [
  '2025-03-10',
  '2025-03-11',
  '2025-03-12'
]);

// Get available dates
const available = Domain.OperatorAvailabilityRepository.getAvailableDates('op_456');

// Clear all restrictions
Domain.OperatorAvailabilityRepository.clearAvailability('op_456');

// Get full availability record
const record = Domain.OperatorAvailabilityRepository.getByOperator('op_456');
```

**Expected Structure:**
```javascript
{
  operatorId: 'op_456',
  unavailableDates: ['2025-03-10', '2025-03-15'],
  availableDates: []  // Empty = no whitelist (uses blacklist)
}
```

---

### 3. AvailabilityEngine

**Responsibility:** Calculate available SETUPS per date and region

This is the **CORE** of the booking system.

#### getAvailableSetups(date, regionId)

Returns availability snapshot for a specific date.

```javascript
const availability = Domain.AvailabilityEngine.getAvailableSetups(
  '2025-03-10',
  'occitanie'
);

console.log(availability);
// {
//   success: true,
//   date: '2025-03-10',
//   regionId: 'occitanie',
//   totalSetups: 5,          // Total in region
//   usedSetups: 2,           // Already booked
//   availableSetups: 3,      // Free to book
//   operatorsAvailable: 4,   // Operators with no conflicts
//   isAvailable: true,       // Can book this date?
//   details: {
//     usedBy: [
//       { sessionId: 'sess_1', clientId: 'client_1', setupId: 'setup_1' },
//       { sessionId: 'sess_2', clientId: 'client_2', setupId: 'setup_2' }
//     ]
//   }
// }
```

#### isDateAvailable(date, regionId, setupRequiredCount)

Quick check if enough setups are available.

```javascript
// Check if 1 setup available (default)
const canBook = Domain.AvailabilityEngine.isDateAvailable('2025-03-10', 'occitanie');

// Check if 3 setups available
const canBook3 = Domain.AvailabilityEngine.isDateAvailable('2025-03-10', 'occitanie', 3);
```

#### getAvailabilityCalendar(regionId, daysAhead)

Get availability for next 90 days (default).

```javascript
const calendar = Domain.AvailabilityEngine.getAvailabilityCalendar(
  'occitanie',
  90
);

console.log(calendar);
// {
//   success: true,
//   regionId: 'occitanie',
//   startDate: '2025-02-20',
//   daysAhead: 90,
//   totalSetups: 5,
//   days: [
//     {
//       date: '2025-02-20',
//       dayOfWeek: 'jeudi',
//       availableSetups: 3,
//       operatorsAvailable: 4,
//       isAvailable: true,
//       usedSetups: 2
//     },
//     // ... 90 days total
//   ],
//   summary: {
//     totalDays: 90,
//     availableDays: 75,
//     utilizationPercentage: 16.67
//   }
// }
```

#### getFirstAvailableDate(regionId, daysAhead)

Find next available date quickly.

```javascript
const firstDate = Domain.AvailabilityEngine.getFirstAvailableDate(
  'occitanie',
  90
);
// Returns: '2025-02-21' (or null if none available)
```

#### getAvailableDates(regionId, count, maxDaysSearch)

Get next N available dates.

```javascript
const nextAvailable = Domain.AvailabilityEngine.getAvailableDates(
  'occitanie',
  5,  // Return 5 dates
  180 // Search up to 180 days
);
// Returns: ['2025-02-21', '2025-02-22', '2025-02-24', '2025-02-25', '2025-02-26']
```

#### getCapacityAnalysis(regionId, daysAhead)

Detailed capacity planning analysis.

```javascript
const analysis = Domain.AvailabilityEngine.getCapacityAnalysis('occitanie', 90);

console.log(analysis);
// {
//   success: true,
//   regionId: 'occitanie',
//   period: {
//     days: 90,
//     startDate: '2025-02-20'
//   },
//   capacity: {
//     totalSetups: 5,
//     potentialSessionSlots: 450  // 5 setups × 90 days
//   },
//   utilization: {
//     bookedSessionSlots: 75,
//     utilizationPercentage: 16.67,
//     peakDay: {
//       date: '2025-03-15',
//       usedSetups: 5,
//       availableSetups: 0
//     },
//     slowestDay: {
//       date: '2025-02-20',
//       usedSetups: 0,
//       availableSetups: 5
//     }
//   },
//   constraints: {
//     daysWithoutOperators: 2,    // No operators available
//     daysFullyBooked: 5,         // All setups used
//     daysPartiallyAvailable: 15  // Some setups free
//   }
// }
```

---

### 4. ModuleCapacityService

**Responsibility:** Compute session capacity from selected modules

**Business Rule:** `Session.capacityMax = MIN(capacityMax of all selected modules)`

```javascript
// Compute capacity for modules
const capacity = Domain.ModuleCapacityService.computeSessionCapacity([
  'module_basic',
  'module_advanced'
]);

console.log(capacity);
// {
//   success: true,
//   capacityMax: 12,           // Minimum across modules
//   limitingModuleId: 'module_advanced',
//   moduleCount: 2,
//   moduleDetails: [
//     { moduleId: 'module_basic', moduleName: 'Basic Training', capacityMax: 20 },
//     { moduleId: 'module_advanced', moduleName: 'Advanced Training', capacityMax: 12 }
//   ],
//   hasRestriction: true,
//   note: 'Limited by Advanced Training'
// }
```

#### validateParticipantCount(moduleIds, participantCount)

Check if participant count fits capacity.

```javascript
const validation = Domain.ModuleCapacityService.validateParticipantCount(
  ['module_basic', 'module_advanced'],
  15
);

if (!validation.isValid) {
  console.error(`Too many participants: ${validation.message}`);
  // Output: "15 participants exceeds capacity of 12. Limited by Advanced Training"
}
```

#### getCapacitySummary(moduleIds)

Get display-friendly capacity summary.

```javascript
const summary = Domain.ModuleCapacityService.getCapacitySummary([
  'module_basic',
  'module_advanced'
]);

console.log(summary.text);
// "Session capacity: 12 people"
```

#### getRestrictedModules()

Find all modules with capacity limits.

```javascript
const restricted = Domain.ModuleCapacityService.getRestrictedModules();
// Returns modules where capacityMax is defined
```

---

## Usage Examples

### Example 1: Check if Date is Bookable

```javascript
// User wants to book session on March 10 in Occitanie
const date = '2025-03-10';
const region = 'occitanie';

const availability = Domain.AvailabilityEngine.getAvailableSetups(date, region);

if (availability.isAvailable && availability.availableSetups >= 1) {
  console.log(`✓ Can book ${availability.availableSetups} sessions`);
  console.log(`  ${availability.operatorsAvailable} operators available`);
  // Show booking form
} else {
  console.log(`✗ No availability on ${date}`);
  // Show alternative dates
  const alternatives = Domain.AvailabilityEngine.getAvailableDates(region, 5);
  console.log('Next available:', alternatives);
}
```

### Example 2: Display Availability Calendar

```javascript
const calendar = Domain.AvailabilityEngine.getAvailabilityCalendar('occitanie');

calendar.days.forEach(day => {
  if (day.isAvailable) {
    console.log(`${day.date} (${day.dayOfWeek}): ${day.availableSetups} free`);
  } else {
    console.log(`${day.date} (${day.dayOfWeek}): FULL`);
  }
});
```

### Example 3: Validate Participants Fit Capacity

```javascript
const moduleIds = ['tir_precision', 'scenario_tactical'];
const participantCount = 18;

const check = Domain.ModuleCapacityService.validateParticipantCount(
  moduleIds,
  participantCount
);

if (check.isValid) {
  createSession(moduleIds, participantCount);
} else {
  showError(check.message);
  console.log(`Max capacity: ${check.capacityMax}`);
}
```

### Example 4: Manage Operator Availability

```javascript
// Operator says they're unavailable March 10-15
const operatorId = 'op_jean_dupont';

for (let day = 10; day <= 15; day++) {
  Domain.OperatorAvailabilityRepository.addUnavailableDate(
    operatorId,
    `2025-03-${String(day).padStart(2, '0')}`
  );
}

// Later, check if available
const available = Domain.OperatorAvailabilityRepository.isAvailableOnDate(
  operatorId,
  '2025-03-10'
);
// false - operator marked as unavailable
```

### Example 5: Create and Manage Setups

```javascript
// Create new setup for a region
const newSetup = Domain.SetupRepository.create({
  name: 'Setup Paca #2',
  regionIds: ['provence-alpes-cote-azur'],
  active: true
});

if (newSetup.id) {
  console.log(`Setup created: ${newSetup.id}`);

  // Later, check what setups are in that region
  const regionSetups = Domain.SetupRepository.getByRegion(
    'provence-alpes-cote-azur'
  );
  console.log(`Region has ${regionSetups.length} setups`);

  // Deactivate setup temporarily
  Domain.SetupRepository.update(newSetup.id, { active: false });
}
```

### Example 6: Capacity Planning Dashboard

```javascript
// Get insights for decision making
const analysis = Domain.AvailabilityEngine.getCapacityAnalysis('occitanie', 90);

console.log(`Current Utilization: ${analysis.utilization.utilizationPercentage}%`);
console.log(`Fully Booked Days: ${analysis.constraints.daysFullyBooked}`);
console.log(`Peak Day: ${analysis.utilization.peakDay.date}`);

if (analysis.utilization.utilizationPercentage > 80) {
  console.warn('Region is heavily booked - consider adding setups');
}

if (analysis.constraints.daysWithoutOperators > 5) {
  console.warn('Many days lack available operators');
}
```

---

## Integration with React Components

### Example: React Component Using Domain

```javascript
import { useEffect, useState } from 'react';

export function AvailabilityWidget({ regionId }) {
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    // Domain is available globally after page load
    if (window.Domain) {
      const result = window.Domain.AvailabilityEngine.getAvailabilityCalendar(
        regionId
      );
      setAvailability(result);
    }
  }, [regionId]);

  if (!availability?.success) {
    return <div>Loading availability...</div>;
  }

  return (
    <div className="availability-calendar">
      {availability.days.map(day => (
        <div
          key={day.date}
          className={day.isAvailable ? 'available' : 'booked'}
        >
          <div>{day.date}</div>
          <div>{day.availableSetups} free</div>
        </div>
      ))}
    </div>
  );
}
```

---

## Data Persistence

### Current Implementation

Files are stored in:
- **localStorage** if DB is not available
- **DB.* methods** if they exist (Supabase, legacy DB, etc.)

### Storage Keys

- `dst_setups` - Array of setup objects
- `dst_operator_availability` - Operator availability records
- `dst_modules` - Module definitions (for capacity)

### Example: Local Storage Format

```javascript
// localStorage['dst_setups']
[
  {
    id: 'setup_1',
    name: 'Setup Occitanie 1',
    regionIds: ['occitanie'],
    active: true,
    createdAt: '2025-02-20T10:30:00Z'
  }
]
```

---

## Error Handling

All functions return structured responses:

```javascript
{
  success: boolean,
  data: any,              // Result (if success)
  error: string,          // Error message (if failure)
  message: string         // Additional context
}
```

Example:
```javascript
const result = Domain.AvailabilityEngine.getAvailableSetups('invalid', 'region');

if (!result.success) {
  console.error('Availability check failed:', result.error);
}
```

---

## Critical Rules

✓ **DO NOT modify existing sessions logic**
✓ **DO NOT modify engine.js functions**
✓ **DO NOT modify DB layer**
✓ Domain works standalone (no React dependency)
✓ Operator availability = planning hint only
✓ Enterprise validation always takes precedence
✓ All dates in YYYY-MM-DD format (ISO 8601)

---

## Testing Domain Layer

### In Browser Console

```javascript
// Test available setups
Domain.AvailabilityEngine.getAvailableSetups('2025-03-10', 'occitanie');

// Test capacity
Domain.ModuleCapacityService.computeSessionCapacity(['mod_1', 'mod_2']);

// Test setups
Domain.SetupRepository.getActive();

// Test operator
Domain.OperatorAvailabilityRepository.isAvailableOnDate('op_1', '2025-03-10');
```

---

## Next Steps

1. **Setup Data Migration:** Populate setups from existing data
2. **Operator Integration:** Link operators to setup assignments
3. **Session Booking:** Use AvailabilityEngine in booking flow
4. **Capacity Display:** Show capacityMax in session forms
5. **Calendar UI:** Display getAvailabilityCalendar in UI

---

## File Structure

```
/js/domain/
├── index.js                              (Core export)
│   └── Exports: window.Domain
│
├── setup.repository.js
│   └── SetupRepository: CRUD operations
│
├── operatorAvailability.repository.js
│   └── OperatorAvailabilityRepository: Planning hints
│
├── availability.engine.js
│   └── AvailabilityEngine: Core booking logic
│
└── moduleCapacity.service.js
    └── ModuleCapacityService: Capacity constraints
```

Each file is an IIFE module:
- No external dependencies
- Pure business logic
- Backward compatible with localStorage fallback
- Ready for React component integration

---

## FAQ

**Q: Can operators override availability?**
A: No. Operator declarations are hints only. Enterprise admin validation is required.

**Q: What if a setup has no operator?**
A: That setup is unavailable (see AvailabilityEngine logic).

**Q: Can a session book multiple setups?**
A: Current model: 1 session = 1 setup. Can be extended.

**Q: What about multiple participants per session?**
A: Handled by ModuleCapacityService.capacityMax. Participants are a soft constraint, not related to setup count.

**Q: Can I use Domain without React?**
A: Yes. Domain works in any JavaScript environment (scripts, Node.js, etc.).

---

**Last Updated:** 2025-02-20
**Version:** 1.0 Foundation Layer
