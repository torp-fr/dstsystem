# Planning Dashboard UI — Complete Usage Guide

## Overview

The Planning Dashboard is a **PURE UI LAYER** that reads exclusively from `Domain.PlanningStateService`. It displays planning state without any business logic, automation, or mutation capability.

```
Supabase
    ↓
SupabaseAdapter
    ↓
Domain Layer
    ↓
PlanningStateService (READ-ONLY)
    ↓
Planning Dashboard Components ← YOU ARE HERE
    ↓
React UI
```

## Architecture

### Components

| Component | Purpose | Consumer |
|-----------|---------|----------|
| **PlanningDashboard** | Main planning view with filters and stats | Enterprise, Client |
| **PlanningSessionCard** | Individual session display | PlanningDashboard |
| **PlanningFilters** | Filter controls (date, region, status) | PlanningDashboard |
| **PlanningOperatorView** | Operator schedule (accepted sessions) | Operator |

### Data Flow

```
Domain.PlanningStateService.getPlanningSessions(filters)
    ↓
    └→ [session, session, session, ...]
           ↓
       PlanningDashboard (useState)
           ↓
       PlanningSessionCard × N
```

## Component Usage

### PlanningDashboard

**Purpose:** Main enterprise/client planning dashboard

**Props:** None (reads filters from local state)

**Data Source:** `Domain.PlanningStateService.getPlanningSessions(filters)`

**Layout:**
```
┌─────────────────────────────────────┐
│ FILTERS BAR (sticky)                │
│ dateFrom | dateTo | region | status │
└─────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ Total: 5     │ Operational: 3 │ Awaiting: 2  │
└──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┐
│ SessionCard  │ SessionCard  │ SessionCard  │
├──────────────┼──────────────┼──────────────┤
│ SessionCard  │ SessionCard  │               │
└──────────────┴──────────────┴──────────────┘
```

**Example:**
```typescript
import { PlanningDashboard } from '@/components/planning';

export function EnterpriseView() {
  return <PlanningDashboard />;
}
```

**Features:**
- ✅ Filters (date range, region, status)
- ✅ Stats row (total, operational, awaiting)
- ✅ Responsive grid (1/2/3 columns)
- ✅ Error handling
- ✅ Loading state
- ✅ Empty state
- ✗ NO buttons, NO actions

### PlanningSessionCard

**Purpose:** Display individual session with staffing state

**Props:**
```typescript
{
  session: {
    id: string;
    date: string;
    regionId: string;
    clientId: string;
    status: string;
    marketplaceVisible: boolean;
    setupIds: string[];
    staffing: {
      minOperators: number;
      acceptedOperators: number;
      pendingApplications: number;
      isOperational: boolean;
    };
  }
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ DATE (bold)           STATUS BADGE  │
│ Region (lowercase)    MARKETPLACE?  │
├─────────────────────────────────────┤
│ Accepted Operators: 2               │
│ Pending Applications: 3             │
│ Required Operators: 2               │
├─────────────────────────────────────┤
│ ✓ OPERATIONAL (green)               │
│  or                                 │
│ ⚠ AWAITING STAFFING (orange)        │
├─────────────────────────────────────┤
│ Client: client_xyz                  │
│ Session: sess_123                   │
└─────────────────────────────────────┘
```

**Example:**
```typescript
<PlanningSessionCard
  session={{
    id: 'sess_123',
    date: '2025-03-15',
    regionId: 'occitanie',
    clientId: 'client_001',
    status: 'confirmed',
    marketplaceVisible: true,
    setupIds: ['setup_1', 'setup_2'],
    staffing: {
      minOperators: 2,
      acceptedOperators: 1,
      pendingApplications: 3,
      isOperational: false
    }
  }}
/>
```

**Status Badges:**
- `pending_confirmation` → Gray
- `confirmed` → Blue
- `cancelled` → Red
- `marketplaceVisible` → Purple (if true)

**Operational Badge:**
- GREEN: `acceptedOperators >= minOperators` ✓
- ORANGE: `acceptedOperators < minOperators` ⚠

### PlanningFilters

**Purpose:** Filter controls for planning dashboard

**Props:**
```typescript
{
  onFiltersChange: (filters: FilterState) => void;
}
```

**Filter Options:**

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| **dateFrom** | date input | Any ISO date | undefined |
| **dateTo** | date input | Any ISO date | undefined |
| **region** | select | occitanie, paca, idf, nouvelle-aquitaine | undefined |
| **status** | select | pending_confirmation, confirmed, cancelled | undefined |

**Example:**
```typescript
<PlanningFilters
  onFiltersChange={(filters) => {
    console.log('Filters:', filters);
    // { dateFrom: '2025-03-01', region: 'occitanie' }
  }}
/>
```

**Filter Behavior:**
- ✓ Immediate emission (no debounce)
- ✓ Clear value = `undefined`
- ✓ Responsive layout (1 col mobile, 4 cols desktop)

### PlanningOperatorView

**Purpose:** Display operator's accepted sessions only

**Props:**
```typescript
{
  operatorId: string; // e.g., 'op_jean_dupont'
}
```

**Data Source:** `Domain.PlanningStateService.getOperatorPlanning(operatorId)`

**Layout:**
```
╔════════════════════════════════════╗
║ Mes Sessions Confirmées            ║
╠════════════════════════════════════╣
│ 15 Mar 2025                Accepted │
│ occitanie • client_xyz          15 Mar
│                                     │
│ 20 Mar 2025                Accepted │
│ paca • client_abc               20 Mar
│                                     │
│ 25 Mar 2025                Accepted │
│ idf • client_def                 25 Mar
╚════════════════════════════════════╝
```

**Example:**
```typescript
import { PlanningOperatorView } from '@/components/planning';

export function OperatorDashboard() {
  const operatorId = 'op_jean_dupont';
  return <PlanningOperatorView operatorId={operatorId} />;
}
```

**Features:**
- ✓ Lists accepted sessions only
- ✓ Sorted by date
- ✓ Shows region and client
- ✓ Displays accepted date
- ✗ NO staffing display
- ✗ NO marketplace info
- ✗ NO actions

---

## Usage Examples

### Enterprise View

```typescript
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PlanningDashboard } from '@/components/planning';

export function EnterprisePlanning() {
  return (
    <DashboardLayout title="Planning">
      <PlanningDashboard />
    </DashboardLayout>
  );
}

// User sees:
// 1. Filter bar (sticky)
// 2. Stats: Total (5), Operational (3), Awaiting (2)
// 3. Grid of 3 sessions
//    • 1 OPERATIONAL (green badge)
//    • 2 AWAITING STAFFING (orange badge)
```

### Client View

```typescript
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PlanningDashboard } from '@/components/planning';

export function ClientPlanning() {
  return (
    <DashboardLayout title="My Sessions">
      <PlanningDashboard />
    </DashboardLayout>
  );
}

// RoleGuardService already filters
// Client sees ONLY their own sessions
// PlanningStateService respects permissions
```

### Operator View

```typescript
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PlanningOperatorView } from '@/components/planning';

export function OperatorDashboard({ operatorId }) {
  return (
    <DashboardLayout title="My Schedule">
      <PlanningOperatorView operatorId={operatorId} />
    </DashboardLayout>
  );
}

// Shows operator's accepted sessions
// Simple list, no staffing details
```

---

## Data Flow Examples

### Filter Change Scenario

```typescript
// User selects region = 'occitanie'

PlanningFilters
  ↓ onChange
PlanningDashboard
  ↓ setFilters({ region: 'occitanie' })
  ↓ useEffect dependency
  ↓ Domain.PlanningStateService.getPlanningSessions({ region: 'occitanie' })
  ↓ SupabaseAdapter queries filtered data
  ↓ setSessions(result.sessions)
  ↓ Re-render with new cards
```

### Session Loading Scenario

```typescript
Component mounts
  ↓
useEffect() triggered
  ↓
Domain.PlanningStateService.getPlanningSessions({})
  ↓
Service checks RoleGuardService
  ↓
Returns sessions visible to current user
  ↓
setSessions(result.sessions)
  ↓
Render grid
```

---

## Styling Reference

### Tailwind Classes Used

| Element | Classes |
|---------|---------|
| Card | `bg-white rounded-2xl shadow-sm border border-gray-100 p-4` |
| Header | `text-lg font-semibold text-gray-800` |
| Label | `text-xs text-gray-500 uppercase tracking-wide` |
| Grid | `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` |
| Badge Green | `bg-green-100 text-green-700` |
| Badge Orange | `bg-orange-100 text-orange-700` |
| Badge Blue | `bg-blue-100 text-blue-700` |
| Badge Gray | `bg-gray-100 text-gray-700` |

---

## Important Design Rules

### ✅ What the Dashboard Does

- ✓ Reads from `Domain.PlanningStateService` ONLY
- ✓ Displays session state
- ✓ Shows staffing counts (accepted, pending)
- ✓ Indicates operational status
- ✓ Filters (no mutations)
- ✓ Respects RoleGuardService visibility
- ✓ Responsive design

### ❌ What the Dashboard Does NOT Do

- ✗ NO business logic
- ✗ NO automation
- ✗ NO scoring, matching, or predictions
- ✗ NO operator assignment
- ✗ NO session confirmation
- ✗ NO application acceptance/rejection
- ✗ NO database writes
- ✗ NO realtime subscriptions
- ✗ NO caching
- ✗ NO buttons for actions

**All mutations** are handled by Controllers:
- `BookingFlowController` — Create/confirm sessions
- `MarketplaceController` — Apply/accept/reject operators

---

## Error Handling

Each component gracefully handles errors:

```typescript
if (error) {
  return <div className="bg-red-50 border border-red-200...">
    {error}
  </div>;
}

if (loading) {
  return <div className="text-center py-8 text-gray-500">
    Loading...
  </div>;
}

if (sessions.length === 0 && !error) {
  return <div className="text-center py-12 text-gray-400">
    No sessions found.
  </div>;
}
```

---

## State Management

### PlanningDashboard State

```typescript
const [sessions, setSessions] = useState<PlanningSession[]>([]);
const [filters, setFilters] = useState<FilterState>({});
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

- **sessions** — Data from service
- **filters** — User-applied filters
- **loading** — Fetch state
- **error** — Error message

### No Redux/Context

- Components use local `useState` only
- Parent-child prop passing
- No global state management
- Simpler, more testable

---

## Performance Notes

- **No infinite loops** — useEffect dependencies specified
- **No excessive re-renders** — Filter changes trigger fetch once
- **No caching** — Fresh data each filter change
- **No realtime** — Per-request basis only
- **No large lists** — Pagination not needed for MVP

---

## Integration Checklist

- [x] Components read ONLY from `Domain.PlanningStateService`
- [x] NO database mutations
- [x] NO automation logic
- [x] NO prediction or scoring
- [x] RoleGuardService permissions respected
- [x] Responsive Tailwind styling
- [x] Error and loading states
- [x] Empty states handled
- [x] No external API calls
- [x] Pure UI layer

---

## Support for Different Roles

### Enterprise

```
PlanningDashboard
  ↓
  getPlanningSessions({})
  ↓
  Sees ALL sessions
  ↓
  Stats: total operational, awaiting
  ↓
  Can filter: date, region, status
```

### Client

```
PlanningDashboard
  ↓
  getPlanningSessions({})
  ↓
  RLS filters to own sessions
  ↓
  See own planning only
```

### Operator

```
PlanningOperatorView
  ↓
  getOperatorPlanning(operatorId)
  ↓
  See accepted sessions only
  ↓
  Simple schedule display
```

---

## Next Steps

To integrate into your app:

1. **Import component**
   ```typescript
   import { PlanningDashboard } from '@/components/planning';
   ```

2. **Add route**
   ```typescript
   <Route path="/planning" element={<PlanningDashboard />} />
   ```

3. **Ensure Domain is loaded**
   - `index.html` loads all domain scripts ✓

4. **Done!**
   - Component handles everything
   - Reads from service
   - Displays state
