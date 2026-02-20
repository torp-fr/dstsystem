# Operator Marketplace UI — Complete Usage Guide

## Overview

The Operator Marketplace is a **PURE UI LAYER** that allows operators to:
- ✅ Browse confirmed marketplace sessions
- ✅ View session details (date, region, client, staffing state)
- ✅ Apply manually to sessions
- ✅ See application status (pending/accepted/rejected)
- ❌ NO automation, NO scoring, NO matching suggestions

```
Supabase Data
    ↓
SupabaseAdapter (read-only)
    ↓
BookingFlowController.getMarketplaceSessions()
    ↓
MarketplaceDashboard (UI layer)
    ↓
MarketplaceSessionCard × N
    ↓
Operator sees marketplace
```

---

## Architecture

### Component Structure

```
MarketplaceDashboard (main component)
  ├── Error state handling
  ├── Loading state
  ├── Empty state (MarketplaceEmptyState)
  └── Session grid (responsive 1/2/3 cols)
      ├── MarketplaceSessionCard × N
      │   ├── Session details display
      │   ├── Staffing information
      │   ├── Apply button OR
      │   └── MarketplaceApplicationBadge
      └── ...
```

### Data Sources

| Source | Purpose | Method |
|--------|---------|--------|
| **BookingFlowController** | Get marketplace sessions | `getMarketplaceSessions(filters)` |
| **MarketplaceController** | Apply to session | `applyToSession(sessionId, operatorId)` |
| **AccountRepository** | Get current operator | `getCurrentAccount()` |
| **RoleGuardService** | Check permissions | `can('operator', 'apply')` |

---

## Components

### 1. MarketplaceDashboard

**Purpose:** Main operator marketplace interface

**Data Flow:**
```typescript
useEffect on mount
  ↓
  BookingFlowController.getMarketplaceSessions({ limit: 50 })
  ↓
  [session, session, session, ...]
  ↓
  setSessions(result.sessions)
  ↓
  Render grid of MarketplaceSessionCard
```

**Features:**
- Fetches on mount only (no polling)
- Handles loading state
- Handles error state
- Displays empty state if no sessions
- Shows informational tip

**Props:** None (reads from controllers)

**State:**
```typescript
const [sessions, setSessions] = useState<MarketplaceSession[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [applicationRefresh, setApplicationRefresh] = useState(0);
```

---

### 2. MarketplaceSessionCard

**Purpose:** Individual session display card with apply button

**Display:**
```
┌────────────────────────────────────┐
│ 15 Mar 2025 (bold)    [CONFIRMED] │
│ occitanie             [MARKETPLACE]
├────────────────────────────────────┤
│ Required Operators:           2    │
│ Accepted Operators:           1    │
│ Pending Applications:         3    │
├────────────────────────────────────┤
│ ⚠ AWAITING STAFFING               │
│   (orange, because 1 < 2)          │
├────────────────────────────────────┤
│ Client: client_gendarme_01         │
│ Session: sess_abc123               │
├────────────────────────────────────┤
│ [Apply to Session] button          │
│ or MarketplaceApplicationBadge     │
└────────────────────────────────────┘
```

**Logic:**

```typescript
// On mount
→ Get current operator ID from AccountRepository
→ Check if operator has applied (from session details)

// If not applied
→ Show blue [Apply to Session] button

// If applied
→ Show MarketplaceApplicationBadge with status
  - pending (yellow): "Application Pending"
  - accepted (green): "Accepted"
  - rejected (red): "Rejected"

// On apply button click
→ Call MarketplaceController.applyToSession(sessionId, operatorId)
→ If success: show badge instead of button
→ If error: show error message
```

**Props:**
```typescript
interface MarketplaceSessionCardProps {
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
  };
  onApply: (sessionId: string) => void;  // Callback for UI refresh
}
```

---

### 3. MarketplaceApplicationBadge

**Purpose:** Display application status

**Statuses:**

| Status | Style | Icon | Label |
|--------|-------|------|-------|
| **pending** | Yellow | Clock | "Application Pending" |
| **accepted** | Green | CheckCircle | "Accepted" |
| **rejected** | Red | XCircle | "Rejected" |

**Props:**
```typescript
interface MarketplaceApplicationBadgeProps {
  status: 'pending' | 'accepted' | 'rejected';
}
```

---

### 4. MarketplaceEmptyState

**Purpose:** Show when no marketplace sessions available

**Display:**
```
     📭 (CalendarX icon)

Aucune session disponible actuellement

Revenez plus tard ou contactez l'entreprise pour découvrir les nouvelles opportunités.
```

---

## Usage Examples

### Basic Integration

```typescript
import { MarketplaceDashboard } from '@/components/marketplace';

export function MarketplacePage() {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <MarketplaceDashboard />
    </div>
  );
}
```

### Display Flow

```typescript
// User navigates to /dashboard/marketplace
  ↓
// MarketplacePage renders
  ↓
// MarketplaceDashboard mounts
  ↓
// useEffect calls BookingFlowController.getMarketplaceSessions()
  ↓
// Sessions loaded and displayed in grid
  ↓
// Operator sees confirmed sessions + apply button
  ↓
// Click "Apply to Session"
  ↓
// MarketplaceController.applyToSession() called
  ↓
// Card updates to show "Application Pending" badge
  ↓
// Enterprise reviews later
  ↓
// Badge updates to "Accepted" or "Rejected"
```

### Manual Application Flow

```
Operator sees session:
┌─────────────────────────┐
│ 20 Mar 2025             │
│ occitanie               │
├─────────────────────────┤
│ Required: 2, Accepted: 1│
│ ⚠ AWAITING STAFFING     │
├─────────────────────────┤
│ [Apply to Session]      │ ← Operator clicks
└─────────────────────────┘
        ↓
  MarketplaceController.applyToSession(
    'sess_123',           // sessionId
    'op_jean_dupont'      // operatorId
  )
        ↓
  SupabaseAdapter inserts:
  session_operators {
    session_id: 'sess_123',
    operator_id: 'op_jean_dupont',
    status: 'pending',
    applied_at: now()
  }
        ↓
  Card updates:
┌─────────────────────────┐
│ 20 Mar 2025             │
│ occitanie               │
├─────────────────────────┤
│ ⏳ Application Pending   │
│ Awaiting enterprise     │
│ review                  │
└─────────────────────────┘
```

---

## Data Access Pattern

### SessionData Structure

```typescript
interface MarketplaceSession {
  id: string;                           // sess_abc123
  date: string;                         // 2025-03-15
  regionId: string;                     // occitanie
  clientId: string;                     // client_gendarme_01
  status: string;                       // confirmed
  marketplaceVisible: boolean;          // true
  setupIds: string[];                   // ['setup_1', 'setup_2']
  staffing: {
    minOperators: number;               // 2
    acceptedOperators: number;          // 1
    pendingApplications: number;        // 3
    isOperational: boolean;             // false
  };
}
```

### Controller Methods Called

```javascript
// Get marketplace sessions
const result = BookingFlowController.getMarketplaceSessions({
  limit: 50
});
// Returns: { success: true, sessions: [...], count, message }

// Apply to session
const result = MarketplaceController.applyToSession(
  sessionId,
  operatorId
);
// Returns: { success: true, application: {...}, message }

// Get current operator
const account = Domain.AccountRepository.getCurrentAccount();
// Returns: { operator_id: 'op_123', ... }
```

---

## Styling

### Theme Colors

| Element | Color | Class |
|---------|-------|-------|
| Card | White | `bg-white rounded-2xl shadow-sm border border-gray-100` |
| Text Heading | Dark Gray | `text-lg font-semibold text-gray-800` |
| Text Body | Gray | `text-gray-600` |
| Status Gray | Gray | `bg-gray-100 text-gray-700` |
| Status Blue | Blue | `bg-blue-100 text-blue-700` |
| Status Green | Green | `bg-green-100 text-green-700` |
| Status Orange | Orange | `bg-orange-100 text-orange-700` |
| Status Purple | Purple | `bg-purple-100 text-purple-700` |
| Status Red | Red | `bg-red-100 text-red-700` |
| Button Primary | Primary | `bg-primary text-white hover:bg-primary/90` |

### Responsive Grid

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {sessions.map(session => (
    <MarketplaceSessionCard key={session.id} session={session} />
  ))}
</div>
```

---

## Key Design Principles

### ✅ What It Does

```typescript
✓ Displays confirmed marketplace sessions
✓ Shows session staffing state
✓ Allows manual application
✓ Shows application status
✓ NO loading spinner (only on fetch)
✓ NO auto-refresh/polling
✓ NO AI recommendations
✓ NO automatic anything
```

### ❌ What It Does NOT Do

```typescript
✗ NO automatic operator matching
✗ NO scoring system
✗ NO suggestions engine
✗ NO realtime updates
✗ NO polling/auto-refresh
✗ NO caching
✗ NO predictions
✗ NO background processes
```

---

## Error Handling

### Error States

```typescript
// Service not initialized
if (!result) {
  return 'Service not initialized';
}

// Controller returns error
if (!result.success) {
  return result.error || 'Failed to load marketplace sessions';
}

// Try-catch block
catch (err) {
  return err instanceof Error ? err.message : 'Unknown error';
}
```

### User Feedback

```typescript
// Loading
<div className="text-center py-12 text-gray-500">
  Loading marketplace sessions...
</div>

// Error
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  {error}
</div>

// Empty
<MarketplaceEmptyState />

// Success (cards displayed)
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {sessions.map(session => (...))}
</div>
```

---

## Integration Points

### Route

```typescript
// App.tsx
<Route path="marketplace" element={<MarketplacePage />} />
```

### Sidebar

```typescript
// DashboardSidebar.tsx
{
  icon: ShoppingCart,
  label: 'Marketplace',
  path: '/dashboard/marketplace'
}
```

### Dependencies

```typescript
// In-app access
window.BookingFlowController.getMarketplaceSessions()
window.MarketplaceController.applyToSession()
window.Domain.AccountRepository.getCurrentAccount()
window.Domain.RoleGuardService.can()
```

---

## Testing Checklist

- [ ] Route `/dashboard/marketplace` works
- [ ] Marketplace menu item visible in sidebar
- [ ] Operator can see marketplace sessions grid
- [ ] Sessions display date, region, client, staffing info
- [ ] Apply button visible (if not applied)
- [ ] Click apply → status changes to "Application Pending"
- [ ] No errors in console
- [ ] Responsive on mobile (1 col)
- [ ] Responsive on tablet (2 cols)
- [ ] Responsive on desktop (3 cols)
- [ ] Empty state shows when no sessions
- [ ] Error state shows on failure
- [ ] Loading state shows on fetch

---

## Summary

**MarketplaceUI** provides:

✨ **Clean operator interface** for browsing confirmed sessions
✨ **Manual apply workflow** (no automation)
✨ **Real-time status feedback** (accepted/rejected)
✨ **Responsive design** (mobile to desktop)
✨ **No business logic** (pure presentation layer)

All intelligence and decisions remain with humans.
