# Enterprise Staffing Board — Complete Usage Guide

## Overview

The **Enterprise Staffing Board** is a **PURE UI LAYER** for manual operator validation. Enterprise users can:

✅ View all marketplace sessions (confirmed + visible)
✅ See all operator applications (accepted/pending/rejected)
✅ **Manually ACCEPT** operators (one click)
✅ **Manually REJECT** operators (one click)
✅ Understand session operational status visually
✅ No automation, no scoring, no suggestions

```
Domain.PlanningStateService (reads sessions + operators)
    ↓
StaffingBoardDashboard (enterprise view)
    ↓
StaffingSessionCard × N (per session)
    ↓
StaffingOperatorRow × N (per application)
    ↓
MarketplaceController (ACCEPT/REJECT actions)
    ↓
Enterprise makes manual decisions
```

---

## Architecture

### Component Stack

```
StaffingBoardDashboard (main)
  ├── Stats row (total/operational/awaiting)
  ├── Error handling
  ├── Loading state
  ├── Empty state
  └── Session grid (responsive 1/2/3 cols)
      ├── StaffingSessionCard × N
      │   ├── Session info display
      │   ├── Staffing summary
      │   ├── Operational status banner
      │   └── Operator lists:
      │       ├── Accepted operators
      │       │   └── StaffingOperatorRow
      │       │       └── StaffingStatusBadge
      │       ├── Pending operators
      │       │   └── StaffingOperatorRow
      │       │       ├── ACCEPT button
      │       │       ├── REJECT button
      │       │       └── StaffingStatusBadge
      │       └── Rejected operators
      │           └── StaffingOperatorRow
      │               └── StaffingStatusBadge
      └── ...
```

### Data Sources

| Source | Purpose | Method |
|--------|---------|--------|
| **PlanningStateService** | Get sessions + operators | `getPlanningSessions()`, `getSessionPlanningDetails()` |
| **MarketplaceController** | Accept/reject operators | `acceptOperator()`, `rejectOperator()` |
| **AccountRepository** | Current user info | (implicit via RoleGuardService) |

---

## Components

### 1. StaffingBoardDashboard

**Purpose:** Enterprise staffing management interface

**Features:**
- Loads confirmed marketplace sessions on mount (ONE TIME)
- No polling, no realtime, no auto-refresh
- Displays stats: total, operational, awaiting
- Responsive grid (1/2/3 columns)
- Error, loading, empty states

**Data Flow:**
```typescript
useEffect on mount
  ↓
Domain.PlanningStateService.getPlanningSessions({ status: 'confirmed' })
  ↓
Filter: marketplaceVisible === true
  ↓
setSessions(filteredSessions)
  ↓
Render grid of StaffingSessionCard
```

**Stats Calculation:**
```typescript
total = sessions.length
operational = sessions.filter(s => s.staffing.isOperational).length
awaiting = sessions.filter(s => !s.staffing.isOperational).length
```

---

### 2. StaffingSessionCard

**Purpose:** Display one session with all its operators

**Display:**
```
┌────────────────────────────────────┐
│ 20 Mar 2025 (bold)    [CONFIRMED] │
│ occitanie             [MARKETPLACE]
├────────────────────────────────────┤
│ Required: 2                         │
│ Accepted: 1 (green)                │
│ Pending: 2 (yellow)                │
├────────────────────────────────────┤
│ ✓ SESSION OPÉRATIONNELLE (green)   │
│ OR                                  │
│ ⚠ EN ATTENTE DE VALIDATION (orange)│
├────────────────────────────────────┤
│ Client: client_xyz                  │
│ Session: sess_abc123                │
├────────────────────────────────────┤
│ ✓ ACCEPTED (1)                      │
│ ├─ Jean Dupont              [✓]     │
│                                     │
│ ⏳ PENDING (2)                       │
│ ├─ Marie Martin    [Accept] [Reject]
│ ├─ Pierre Fontaine [Accept] [Reject]
│                                     │
│ ✗ REJECTED (0)                      │
│                                     │
└────────────────────────────────────┘
```

**Key Logic:**
```typescript
// Load operators for this session
Domain.PlanningStateService.getSessionPlanningDetails(sessionId)
  ↓
Separate into: accepted[], pending[], rejected[]
  ↓
Render StaffingOperatorRow for each
```

**Operational Banner:**
```typescript
isOperational = session.staffing.acceptedOperators >= session.staffing.minOperators

if (isOperational) {
  show: "✓ SESSION OPÉRATIONNELLE" (GREEN)
} else {
  show: "⚠ EN ATTENTE DE VALIDATION" (ORANGE)
}
```

---

### 3. StaffingOperatorRow

**Purpose:** Display one operator with ACCEPT/REJECT actions

**Display (Pending):**
```
┌────────────────────────────────────┐
│ Marie Martin                   ⏳   │
│ marie@example.com                  │
│ Applied: 15 Mar                    │
│                                    │
│ [Accept]              [Reject]    │
└────────────────────────────────────┘
```

**Display (Accepted):**
```
┌────────────────────────────────────┐
│ Jean Dupont                    ✓   │
│ jean@example.com                   │
│ Applied: 14 Mar    Accepted: 16 Mar
│                                    │
│ (No buttons - already decided)     │
└────────────────────────────────────┘
```

**Actions:**
```typescript
handleAccept() → MarketplaceController.acceptOperator(sessionId, operatorId)
  ↓ if success
  ↓ trigger parent refresh

handleReject() → MarketplaceController.rejectOperator(sessionId, operatorId)
  ↓ if success
  ↓ trigger parent refresh
```

**Button States:**
- **Pending**: Show [Accept] and [Reject] buttons (green/red)
- **Accepted**: Show "✓ Accepted" badge only
- **Rejected**: Show "✗ Rejected" badge only

---

### 4. StaffingStatusBadge

**Purpose:** Display application status as a pill badge

**Statuses:**

| Status | Style | Icon | Label |
|--------|-------|------|-------|
| **pending** | 🟡 Yellow | ⏳ Clock | "Pending" |
| **accepted** | 🟢 Green | ✓ CheckCircle | "Accepted" |
| **rejected** | 🔴 Red | ✗ XCircle | "Rejected" |

```typescript
<div className="rounded-full px-2 py-1 text-xs font-medium">
  <Icon className="h-3 w-3" />
  <span>{label}</span>
</div>
```

---

### 5. StaffingEmptyState

**Shows when:** No sessions need staffing

```
        👥✗

Aucune session en attente de staffing

Toutes les sessions marketplace actuelles sont opérationnelles
ou complètement staffées.
```

---

## Usage Examples

### Enterprise Views Staffing Board

```typescript
// User navigates to /dashboard/staffing
  ↓
StaffingPage renders
  ↓
StaffingBoardDashboard mounts
  ↓
useEffect loads sessions
  ↓
Grid displays with operator rows
  ↓
Enterprise sees:
  • 5 total sessions
  • 2 operational
  • 3 awaiting staffing
```

### Enterprise Accepts Operator

```
Enterprise sees pending application:
┌─────────────────────┐
│ Pierre Fontaine     │
│ Applied: 15 Mar     │
│ [Accept] [Reject]   │
└─────────────────────┘

Enterprise clicks [Accept]
  ↓
MarketplaceController.acceptOperator('sess_123', 'op_pierre')
  ↓
SupabaseAdapter updates:
   session_operators
   SET status = 'accepted',
       accepted_at = now()
  ↓
Parent refreshes
  ↓
Card updates:
┌─────────────────────┐
│ Pierre Fontaine  ✓  │
│ Applied: 15 Mar     │
│ Accepted: 18 Mar    │
└─────────────────────┘

Session now has:
  • Accepted: 2
  • Required: 2
  → ✓ SESSION OPÉRATIONNELLE (green)
```

### Enterprise Rejects Operator

```
Enterprise sees pending application:
┌─────────────────────┐
│ Marie Martin        │
│ Applied: 15 Mar     │
│ [Accept] [Reject]   │
└─────────────────────┘

Enterprise clicks [Reject]
  ↓
MarketplaceController.rejectOperator('sess_123', 'op_marie')
  ↓
SupabaseAdapter updates:
   session_operators
   SET status = 'rejected',
       rejected_at = now()
  ↓
Parent refreshes
  ↓
Card updates:
Operator moved to:
✗ REJECTED (1)
├─ Marie Martin    ✗
```

---

## Data Structures

### Session

```typescript
interface StaffingSession {
  id: string;                           // sess_abc123
  date: string;                         // 2025-03-20
  regionId: string;                     // occitanie
  clientId: string;                     // client_xyz
  status: string;                       // confirmed
  marketplaceVisible: boolean;          // true
  setupIds: string[];                   // ['setup_1', 'setup_2']
  staffing: {
    minOperators: number;               // 2
    acceptedOperators: number;          // 1
    pendingApplications: number;        // 2
    isOperational: boolean;             // false (1 < 2)
  };
}
```

### Operator

```typescript
interface Operator {
  operatorId: string;                   // op_jean
  name: string;                         // Jean Dupont
  email?: string;                       // jean@example.com
  appliedAt: string;                    // 2025-02-15T10:30:00Z
  acceptedAt?: string;                  // 2025-02-18T14:00:00Z
  rejectedAt?: string;                  // null
  status: 'accepted' | 'pending' | 'rejected';
}
```

---

## Styling

### Theme

```typescript
// Card
bg-white rounded-2xl shadow-sm border border-gray-100 p-4

// Grid
grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4

// Buttons
Accept: bg-green-600 hover:bg-green-700 text-white
Reject: bg-red-600 hover:bg-red-700 text-white

// Badges
Pending: bg-yellow-100 text-yellow-700
Accepted: bg-green-100 text-green-700
Rejected: bg-red-100 text-red-700
Operational: bg-green-100 text-green-700
Awaiting: bg-orange-100 text-orange-700
```

---

## Key Features

### ✅ What It Does

```typescript
✓ Display marketplace sessions (confirmed + visible)
✓ Show operator applications grouped by status
✓ ACCEPT operators (manual button click)
✓ REJECT operators (manual button click)
✓ Update operational status visually
✓ No automation, no suggestions, no scoring
✓ Pure UI layer
✓ Read from PlanningStateService
✓ Mutate via MarketplaceController
```

### ❌ What It Does NOT Do

```typescript
✗ NO automatic assignment
✗ NO scoring or ranking
✗ NO suggestions engine
✗ NO realtime subscriptions
✗ NO polling/auto-refresh
✗ NO predictions
✗ NO caching
✗ NO business logic
```

---

## Integration

### Route

```typescript
// App.tsx
<Route path="staffing" element={<StaffingPage />} />
```

### Sidebar Menu

```typescript
// DashboardSidebar.tsx
{
  icon: Users,
  label: 'Staffing',
  path: '/dashboard/staffing'
}
```

### Access

```
http://localhost:xxxx/dashboard/staffing
```

---

## Workflow

### Complete Decision Flow

```
1. ENTERPRISE OPENS STAFFING BOARD
   /dashboard/staffing

2. SYSTEM LOADS SESSIONS
   PlanningStateService.getPlanningSessions({ status: 'confirmed' })

3. GRID DISPLAYS
   Sessions with pending operators shown

4. ENTERPRISE REVIEWS APPLICATIONS
   Can see: applicant name, date, status

5. ENTERPRISE MAKES DECISION
   Click [Accept] or [Reject]

6. CONTROLLER MUTATES
   MarketplaceController.acceptOperator()
   or rejectOperator()

7. UI UPDATES
   Parent refreshes
   Badge changes status
   Operational banner updates if needed

8. NEXT DECISION
   Loop back to step 4
```

---

## Best Practices

### 1. Check Operational Status

```
Before rejecting remaining operators, check:
  Required: 2
  Accepted: 1
  Pending: 2

If reject 1:
  Accepted: 1, Pending: 1
  Still awaiting (1 < 2)

If accept remaining:
  Accepted: 3, Pending: 0
  ✓ SESSION OPÉRATIONNELLE (3 >= 2)
```

### 2. Review All Candidates

```
Don't reject hastily.
View all pending applications.
Read applicant details (name, applied date).
Make deliberate choices.
```

### 3. Monitor Operational Status

```
Watch the green/orange banner.
Green = ready to proceed
Orange = still needs decision
```

---

## Troubleshooting

### Operators Not Showing

- Check if session has applications (loading may be in progress)
- Verify session is 'confirmed' status
- Verify marketplaceVisible = true

### Accept/Reject Button Not Working

- Check browser console for errors
- Verify MarketplaceController is loaded
- Ensure you have enterprise role (RoleGuardService)

### No Sessions Displayed

- All sessions may be already operational
- Or no marketplace sessions yet created
- Check "Aucune session en attente de staffing" empty state

---

## Summary

**Staffing Board** provides:

✨ **Complete visibility** into operator applications
✨ **Manual decision interface** for accept/reject
✨ **Clear operational status** per session
✨ **Pure UI layer** with no automation
✨ **Enterprise-driven workflow** (human-controlled)

All staffing decisions remain **explicitly human**.
