# OperatorAutoMatchEngine — Usage Guide

## Overview

The **OperatorAutoMatchEngine** is a read-only intelligence layer that analyzes real-time planning state to detect sessions needing operators and suggest the best candidates.

**Key Properties:**
- ✅ NO database writes
- ✅ NO marketplace actions
- ✅ ONLY analysis and suggestions
- ✅ Depends on PlanningRealtimeService for state
- ✅ Founder fallback detection

---

## Architecture

```
┌──────────────────────────┐
│  Supabase Database       │
│  (Real, authoritative)   │
└────────────┬─────────────┘
             │
             ↓ (realtime subscriptions)
┌──────────────────────────┐
│  PlanningRealtimeService │
│  (In-memory projection)  │
└────────────┬─────────────┘
             │
             ↓ (analyzes state)
┌──────────────────────────┐
│ OperatorAutoMatchEngine  │
│ (Intelligence layer)     │
└────────────┬─────────────┘
             │
             ↓ (suggestions/insights)
┌──────────────────────────┐
│  Workflows/Dashboard     │
│  (Takes action)          │
└──────────────────────────┘
```

---

## Console Usage Examples

### 1. Get all sessions needing operators

```javascript
// Get sessions that are confirmed but understaffed
const sessionsNeedingOps = OperatorAutoMatchEngine.getSessionsNeedingOperators();

console.log('[Sessions needing operators]');
sessionsNeedingOps.forEach(session => {
  console.log(`
    Session: ${session.id} (${session.date})
    Status: ${session.status}
    Staffing: ${session.operatorIds.length}/${session.operatorRequirement.minOperators}
    Gap: ${session.staffingGap} operators needed
    Progress: ${session.staffingPercent}%
  `);
});
```

**Output:**
```
[Sessions needing operators]
    Session: sess_12345 (2025-03-15)
    Status: confirmed
    Staffing: 1/2
    Gap: 1 operators needed
    Progress: 50%

    Session: sess_67890 (2025-03-15)
    Status: confirmed
    Staffing: 0/1
    Gap: 1 operators needed
    Progress: 0%
```

### 2. Get suggested operators for a specific session

```javascript
// Get best operator candidates for a session
const suggestions = OperatorAutoMatchEngine.getSuggestedOperators('sess_12345');

console.log(`[Suggested operators for ${suggestions.sessionId}]`);
console.log(`Date: ${suggestions.sessionDate}, Region: ${suggestions.sessionRegion}`);

suggestions.candidates.slice(0, suggestions.suggestedCount).forEach((candidate, index) => {
  console.log(`
    ${index + 1}. ${candidate.name} (${candidate.email})
       Region: ${candidate.region}
       Score: ${candidate.score}/100

       Scoring Details:
       • Region Match: ${candidate.scoring.regionMatch ? '✓' : '✗'}
       • Available: ${candidate.scoring.available ? '✓' : '✗'}
       • Current Load: ${candidate.scoring.currentLoad} sessions
       • Already Applied: ${candidate.scoring.alreadyApplied ? '✓' : '✗'}
  `);
});

console.log(`Founder Fallback Required: ${suggestions.founderFallbackRequired}`);
```

**Output:**
```
[Suggested operators for sess_12345]
Date: 2025-03-15, Region: occitanie

    1. Jean Dupont (jean.dupont@example.com)
       Region: occitanie
       Score: 92/100

       Scoring Details:
       • Region Match: ✓
       • Available: ✓
       • Current Load: 1 sessions
       • Already Applied: ✗

    2. Marie Martin (marie.martin@example.com)
       Region: occitanie
       Score: 78/100

       Scoring Details:
       • Region Match: ✓
       • Available: ✓
       • Current Load: 3 sessions
       • Already Applied: ✗

Founder Fallback Required: false
```

### 3. Check if founder fallback is required

```javascript
// Check if a session needs founder intervention
const fallbackStatus = OperatorAutoMatchEngine.isFounderFallbackRequired('sess_12345');

if (fallbackStatus.required) {
  console.log(`[⚠️ FOUNDER FALLBACK REQUIRED]`);
  console.log(`Session: ${fallbackStatus.sessionId}`);
  console.log(`Date: ${fallbackStatus.sessionDate}`);
  console.log(`Reason: ${fallbackStatus.reason}`);
  console.log(`\nRecommended Actions:`);

  fallbackStatus.fallbackActions.forEach(action => {
    console.log(`  • ${action}`);
  });
} else {
  console.log(`[✓] Session has available operators`);
}
```

**Output (when fallback required):**
```
[⚠️ FOUNDER FALLBACK REQUIRED]
Session: sess_67890
Date: 2025-03-15
Reason: NO_OPERATOR_AVAILABLE

Recommended Actions:
  • NOTIFY_FOUNDERS
  • ALLOW_FORCED_ASSIGNMENT
  • MARK_FOR_REVIEW
```

---

## Integration Examples

### Example 1: Dashboard Monitoring Widget

```javascript
class OperatorStaffingMonitor {
  constructor() {
    this.refreshInterval = 5000; // 5 seconds
  }

  async initialize() {
    console.log('[OperatorStaffingMonitor] Starting monitoring');

    // Wait for PlanningRealtimeService to be ready
    while (!window.PlanningRealtimeService) {
      await new Promise(r => setTimeout(r, 100));
    }

    this.startMonitoring();
  }

  startMonitoring() {
    setInterval(() => {
      this.updateDashboard();
    }, this.refreshInterval);
  }

  updateDashboard() {
    const sessionsNeedingOps =
      OperatorAutoMatchEngine.getSessionsNeedingOperators();

    if (sessionsNeedingOps.length > 0) {
      console.log(`[Dashboard] ${sessionsNeedingOps.length} sessions need operators`);

      // Update UI
      document.getElementById('staffing-alert').innerText =
        `⚠️ ${sessionsNeedingOps.length} sessions need operators`;

      // Highlight most critical
      const mostCritical = sessionsNeedingOps[0];
      const suggestions =
        OperatorAutoMatchEngine.getSuggestedOperators(mostCritical.id);

      this.displaySuggestions(mostCritical, suggestions);
    } else {
      console.log('[Dashboard] All sessions fully staffed');
      document.getElementById('staffing-alert').innerText =
        '✓ All sessions staffed';
    }
  }

  displaySuggestions(session, suggestions) {
    const html = `
      <div class="staffing-card">
        <h3>${session.date} - Session ${session.id.slice(-8)}</h3>
        <p>Needs ${session.staffingGap} more operator(s)</p>

        <h4>Suggested:</h4>
        <ul>
          ${suggestions.candidates
            .slice(0, 3)
            .map(c => `<li>${c.name} (Score: ${c.score})</li>`)
            .join('')}
        </ul>

        ${suggestions.founderFallbackRequired
          ? '<p class="danger">⚠️ Founder fallback required</p>'
          : ''}
      </div>
    `;

    document.getElementById('staffing-suggestions').innerHTML = html;
  }
}

// Initialize in app
const monitor = new OperatorStaffingMonitor();
await monitor.initialize();
```

### Example 2: Automated Notification System

```javascript
class StaffingAlertSystem {
  constructor() {
    this.checkInterval = 30000; // 30 seconds
    this.alertedSessions = new Set();
  }

  async initialize() {
    // Wait for services to be ready
    await new Promise(r => {
      const check = () => {
        if (window.PlanningRealtimeService && window.Domain?.PlanningRealtimeService) {
          r();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });

    this.startChecking();
  }

  startChecking() {
    setInterval(() => this.checkAndAlert(), this.checkInterval);
  }

  checkAndAlert() {
    const sessionsNeedingOps =
      OperatorAutoMatchEngine.getSessionsNeedingOperators();

    sessionsNeedingOps.forEach(session => {
      // Skip if already alerted about this session
      if (this.alertedSessions.has(session.id)) return;

      const fallback =
        OperatorAutoMatchEngine.isFounderFallbackRequired(session.id);

      if (fallback.required) {
        // CRITICAL: Send alert to founders
        this.sendAlert({
          severity: 'CRITICAL',
          sessionId: session.id,
          date: session.date,
          reason: fallback.reason,
          actions: fallback.fallbackActions
        });

        this.alertedSessions.add(session.id);
      } else {
        // INFO: Show suggestions
        const suggestions =
          OperatorAutoMatchEngine.getSuggestedOperators(session.id);

        this.showSuggestion({
          sessionId: session.id,
          date: session.date,
          candidates: suggestions.candidates.slice(0, 3)
        });
      }
    });
  }

  sendAlert(alert) {
    console.log(`[ALERT] Session ${alert.sessionId} - ${alert.reason}`);
    // Send email, Slack notification, etc.
  }

  showSuggestion(suggestion) {
    console.log(`[INFO] Suggested operators for ${suggestion.sessionId}`);
    suggestion.candidates.forEach(c => {
      console.log(`  • ${c.name} (${c.score} points)`);
    });
  }
}

// Initialize
const alertSystem = new StaffingAlertSystem();
await alertSystem.initialize();
```

### Example 3: Workflow Integration

```javascript
// In a workflow that handles auto-matching
class OperatorAutoAssignmentWorkflow {
  /**
   * Auto-suggest operators without modifying database
   * Workflow can then use suggestions to trigger marketplace applications
   */
  static async suggestOperatorsForSession(sessionId) {
    const suggestions =
      OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

    console.log(`[Workflow] Getting suggestions for ${sessionId}`);

    // Get top 3 candidates
    const topCandidates = suggestions.candidates.slice(0, 3);

    if (topCandidates.length === 0) {
      // Handle founder fallback
      const fallback =
        OperatorAutoMatchEngine.isFounderFallbackRequired(sessionId);

      if (fallback.required) {
        console.log('[Workflow] No available operators - founder intervention needed');
        // Trigger founder notification workflow
        await this.notifyFoundersOfCriticalGap(sessionId, fallback);
      }
      return null;
    }

    // Return suggestions (Workflow can then use these to trigger marketplace applications)
    return {
      sessionId,
      suggestions: topCandidates,
      founderRequired: suggestions.founderFallbackRequired
    };
  }

  static async notifyFoundersOfCriticalGap(sessionId, fallbackStatus) {
    console.log(`[Workflow] Notifying founders about ${sessionId}`);
    console.log(`Reason: ${fallbackStatus.reason}`);
    console.log(`Actions: ${fallbackStatus.fallbackActions.join(', ')}`);

    // Implementation would:
    // 1. Send email to founders
    // 2. Create alert in dashboard
    // 3. Log for manual review
  }
}

// Usage in workflow
const result =
  await OperatorAutoAssignmentWorkflow.suggestOperatorsForSession('sess_12345');

if (result) {
  console.log(`Suggested: ${result.suggestions.map(s => s.name).join(', ')}`);
}
```

---

## Data Structures

### Sessions Needing Operators

```javascript
{
  id: "sess_12345",
  clientId: "client_001",
  date: "2025-03-15",
  status: "confirmed",
  operatorIds: ["op_100"],          // Current assignments
  setupIds: ["setup_1"],
  operatorRequirement: {
    minOperators: 2
  },
  staffingGap: 1,                    // How many more needed
  staffingPercent: 50                // 1/2 = 50%
}
```

### Suggested Operators

```javascript
{
  sessionId: "sess_12345",
  sessionDate: "2025-03-15",
  sessionRegion: "occitanie",
  candidates: [
    {
      operatorId: "op_200",
      name: "Jean Dupont",
      email: "jean@example.com",
      region: "occitanie",
      score: 92,                      // Out of 100
      scoring: {
        regionMatch: true,            // +40 points
        available: true,              // +30 points
        currentLoad: 1,               // 1 session (load-balanced scoring)
        alreadyApplied: false         // Not yet applied
      }
    }
    // ... more candidates
  ],
  suggestedCount: 3,                  // How many to show
  founderFallbackRequired: false      // Fallback status
}
```

### Founder Fallback Status

```javascript
{
  required: true,
  sessionId: "sess_67890",
  sessionDate: "2025-03-15",
  reason: "NO_OPERATOR_AVAILABLE",  // or "NO_QUALIFIED_OPERATOR"
  fallbackActions: [
    "NOTIFY_FOUNDERS",
    "ALLOW_FORCED_ASSIGNMENT",
    "MARK_FOR_REVIEW"
  ]
}
```

---

## Scoring System

The engine scores candidates using these criteria:

| Criterion | Points | Details |
|-----------|--------|---------|
| Region Match | 40 | Operator's region matches session's region |
| Availability | 30 | Operator not busy on session date |
| Load Balance | 30 | Operators with lower load score higher (6 pts per session) |
| **Total** | **100** | Maximum possible score |

**Example:**
- Operator in same region + available + 0 sessions = 40 + 30 + 30 = **100 points**
- Operator in same region + available + 2 sessions = 40 + 30 + 18 = **88 points**
- Operator in different region + available = 0 + 30 + 30 = **60 points**

---

## Founder Fallback Rules

Fallback is triggered when:

1. **Session is confirmed** and understaffed
2. **AND** one of:
   - `NO_OPERATOR_AVAILABLE` — No operators in system match any criteria
   - `NO_QUALIFIED_OPERATOR` — Operators exist but none available on date

**Recommended actions:**
- `NOTIFY_FOUNDERS` — Alert key decision makers
- `ALLOW_FORCED_ASSIGNMENT` — Enable assigning operators without consent
- `MARK_FOR_REVIEW` — Flag for manual review

---

## Best Practices

### 1. Check for Understaffing Regularly

```javascript
// Every 30 seconds
setInterval(() => {
  const needOps = OperatorAutoMatchEngine.getSessionsNeedingOperators();
  if (needOps.length > 0) {
    console.log(`${needOps.length} sessions need attention`);
  }
}, 30000);
```

### 2. Always Check Founder Fallback Before Taking Action

```javascript
const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

if (suggestions.founderFallbackRequired) {
  // Don't auto-apply, require manual intervention
  await notifyFounders(sessionId);
} else if (suggestions.candidates.length > 0) {
  // Safe to auto-apply top candidate
  await applyOperator(sessionId, suggestions.candidates[0].operatorId);
}
```

### 3. Respect Existing Applications

The engine never suggests operators who already applied (pending or rejected). This prevents duplicate applications.

### 4. Monitor Load Balance

Consider current load when making assignments. High-scoring operators may be busier than you think.

```javascript
const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);
const topCandidate = suggestions.candidates[0];

console.log(`${topCandidate.name} is already doing ${topCandidate.scoring.currentLoad} sessions`);
```

---

## Dependencies

| Service | Required | Purpose |
|---------|----------|---------|
| PlanningRealtimeService | ✅ Yes | Provides real-time state |
| Supabase Client | ✅ (indirect) | Via PlanningRealtimeService |
| RoleGuardService | ❌ No | Can be used separately |

---

## Troubleshooting

### "PlanningRealtimeService not initialized"

```javascript
// Make sure PlanningRealtimeService is initialized first
await PlanningRealtimeService.initialize();

// Then use OperatorAutoMatchEngine
const sessions = OperatorAutoMatchEngine.getSessionsNeedingOperators();
```

### No sessions returned even though some are understaffed

Possible reasons:
1. Sessions not marked as `confirmed` yet
2. Sessions missing `setup_ids`
3. All required operators already assigned

Check the raw state:
```javascript
const state = PlanningRealtimeService.getRawState();
console.log('Sessions:', state.sessionsByDate);
```

### Suggested operators have 0 score

This means:
- They're in a different region (no region match)
- They're busy on that date (no availability)
- Or both

Consider relaxing criteria if needed.

---

## No Database Writes

This service is **completely read-only**. All operations are on in-memory state from PlanningRealtimeService. To act on suggestions, use:

- **OperatorMarketplaceWorkflow.applyToSession()** — Apply operator to marketplace
- **OperatorMarketplaceWorkflow.acceptOperator()** — Accept an application
- **Custom admin workflow** — For founder fallback forced assignments

---

## Summary

The **OperatorAutoMatchEngine** provides intelligent, real-time analysis for staffing decisions without modifying data. Use it to:

✅ Detect understaffed sessions
✅ Suggest best operator candidates
✅ Identify critical staffing gaps
✅ Support founder fallback decisions

All suggestions are actionable but non-binding—workflows make the actual changes.
