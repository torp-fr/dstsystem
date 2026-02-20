# OperatorAutoMatchEngine — Quick Start Guide

## Requirements

Before using OperatorAutoMatchEngine, ensure:

1. ✅ PlanningRealtimeService is initialized
2. ✅ Services are loaded in correct order (index.html)
3. ✅ You're on the dashboard (where PlanningRealtimeService starts)

---

## 5-Minute Console Demo

### Step 1: Check if services are ready

```javascript
// Verify PlanningRealtimeService is initialized
console.log(window.PlanningRealtimeService);
// → PlanningRealtimeService { initialize, cleanup, getDailyPlanning, ... }

// Verify OperatorAutoMatchEngine is available
console.log(window.OperatorAutoMatchEngine);
// → OperatorAutoMatchEngine { getSessionsNeedingOperators, getSuggestedOperators, ... }

// Or access via Domain object
console.log(Domain.PlanningRealtimeService);
console.log(Domain.OperatorAutoMatchEngine);
```

### Step 2: Find sessions needing operators

```javascript
// Get all sessions that are confirmed but understaffed
const needOperators = OperatorAutoMatchEngine.getSessionsNeedingOperators();

console.log(`Found ${needOperators.length} sessions needing operators:`);

needOperators.forEach(session => {
  console.log(`
    📅 ${session.date}
    Session: ${session.id}
    Staffing: ${session.operatorIds.length}/${session.operatorRequirement.minOperators}
    Gap: ${session.staffingGap} operators needed
    Progress: ${session.staffingPercent}%
  `);
});
```

**Expected Output:**
```
Found 2 sessions needing operators:

    📅 2025-03-15
    Session: sess_12345
    Staffing: 1/2
    Gap: 1 operators needed
    Progress: 50%

    📅 2025-03-16
    Session: sess_67890
    Staffing: 0/1
    Gap: 1 operators needed
    Progress: 0%
```

### Step 3: Get suggested operators for a session

```javascript
// Get best candidates for the first session needing operators
const needOperators = OperatorAutoMatchEngine.getSessionsNeedingOperators();
const sessionId = needOperators[0].id;

const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

console.log(`
  🎯 Suggested operators for ${sessionId}:
  Date: ${suggestions.sessionDate}
  Region: ${suggestions.sessionRegion}
`);

// Show top 3 candidates
suggestions.candidates.slice(0, 3).forEach((op, i) => {
  console.log(`
    ${i + 1}. ${op.name} — Score: ${op.score}/100
       Email: ${op.email}
       Region: ${op.region}
       Status: ${op.scoring.available ? '✅ Available' : '❌ Busy'}
       Load: ${op.scoring.currentLoad} sessions
  `);
});

console.log(`
  Founder fallback required: ${suggestions.founderFallbackRequired}
`);
```

**Expected Output:**
```
  🎯 Suggested operators for sess_12345:
  Date: 2025-03-15
  Region: occitanie

    1. Jean Dupont — Score: 92/100
       Email: jean.dupont@example.com
       Region: occitanie
       Status: ✅ Available
       Load: 1 sessions

    2. Marie Martin — Score: 78/100
       Email: marie.martin@example.com
       Region: occitanie
       Status: ✅ Available
       Load: 3 sessions

    3. Pierre Leblanc — Score: 65/100
       Email: pierre.leblanc@example.com
       Region: occitanie
       Status: ❌ Busy
       Load: 2 sessions

  Founder fallback required: false
```

### Step 4: Check if founder fallback is needed

```javascript
// For the most critical session
const needOperators = OperatorAutoMatchEngine.getSessionsNeedingOperators();
const mostCritical = needOperators[0];

const fallback = OperatorAutoMatchEngine.isFounderFallbackRequired(mostCritical.id);

if (fallback.required) {
  console.log(`
    ⚠️ FOUNDER FALLBACK REQUIRED
    Session: ${fallback.sessionId}
    Date: ${fallback.sessionDate}
    Issue: ${fallback.reason}

    Recommended Actions:
    ${fallback.fallbackActions.map(a => `  • ${a}`).join('\n')}
  `);
} else {
  console.log(`✅ Session ${fallback.sessionId} has suitable candidates`);
}
```

**Expected Output:**
```
    ⚠️ FOUNDER FALLBACK REQUIRED
    Session: sess_67890
    Date: 2025-03-16
    Issue: NO_OPERATOR_AVAILABLE

    Recommended Actions:
      • NOTIFY_FOUNDERS
      • ALLOW_FORCED_ASSIGNMENT
      • MARK_FOR_REVIEW
```

---

## Common Tasks

### Monitor all understaffed sessions

```javascript
function monitorStaffing() {
  const sessions = OperatorAutoMatchEngine.getSessionsNeedingOperators();

  if (sessions.length === 0) {
    console.log('✅ All sessions are fully staffed!');
    return;
  }

  console.log(`⚠️ ${sessions.length} sessions need attention\n`);

  sessions.forEach(s => {
    const isCritical = s.staffingPercent === 0;
    const icon = isCritical ? '🔴' : '🟡';

    console.log(`${icon} ${s.date}: ${s.staffingGap} operator(s) needed (${s.staffingPercent}% staffed)`);
  });
}

monitorStaffing();
```

### Find best operator for a session

```javascript
function findBestOperator(sessionId) {
  const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

  if (suggestions.candidates.length === 0) {
    console.log('❌ No suitable operators available');
    return null;
  }

  const best = suggestions.candidates[0];
  console.log(`
    Best match: ${best.name}
    Score: ${best.score}/100
    Region: ${best.region}
    Available: ${best.scoring.available ? 'Yes' : 'No'}
  `);

  return best;
}

const session = OperatorAutoMatchEngine.getSessionsNeedingOperators()[0];
const best = findBestOperator(session.id);
```

### Check all fallback situations

```javascript
function checkAllFallbacks() {
  const sessions = OperatorAutoMatchEngine.getSessionsNeedingOperators();

  const fallbacks = sessions
    .map(s => ({
      sessionId: s.id,
      date: s.date,
      fallback: OperatorAutoMatchEngine.isFounderFallbackRequired(s.id)
    }))
    .filter(item => item.fallback.required);

  if (fallbacks.length === 0) {
    console.log('✅ No founder fallback situations');
    return;
  }

  console.log(`⚠️ ${fallbacks.length} sessions require founder intervention:\n`);

  fallbacks.forEach(item => {
    console.log(`
      📅 ${item.date} - Session ${item.sessionId.slice(-8)}
      Reason: ${item.fallback.reason}
      Actions: ${item.fallback.fallbackActions.join(' | ')}
    `);
  });
}

checkAllFallbacks();
```

---

## Real-time Updates

The engine pulls data from PlanningRealtimeService, which auto-updates via Supabase realtime subscriptions. Results are always current:

```javascript
// Monitor changes live
setInterval(() => {
  const sessions = OperatorAutoMatchEngine.getSessionsNeedingOperators();
  console.log(`[${new Date().toLocaleTimeString()}] ${sessions.length} sessions need operators`);
}, 5000);
```

---

## Integration with Workflows

Once you have suggestions, use workflows to take action:

```javascript
// Example: Use suggestions to trigger marketplace applications
const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);
const topCandidate = suggestions.candidates[0];

if (topCandidate && !suggestions.founderFallbackRequired) {
  // Use workflow to apply this operator
  await OperatorMarketplaceWorkflow.applyToSession(
    sessionId,
    topCandidate.operatorId
  );
  console.log(`Applied ${topCandidate.name} to session`);
}
```

---

## Debugging

### View raw planning state

```javascript
// Get the complete state from PlanningRealtimeService
const state = PlanningRealtimeService.getRawState();

console.log('Sessions by date:', state.sessionsByDate);
console.log('Operators available:', state.operatorsAvailable);
console.log('Operators busy:', state.operatorsBusy);
console.log('Setups busy:', state.setupsBusy);
```

### Check service health

```javascript
// Check PlanningRealtimeService status
const monitor = PlanningRealtimeService.getMonitor();

console.log(`
  Status: ${monitor.syncStatus}
  Sessions: ${monitor.totalSessions}
  Assignments: ${monitor.totalAssignments}
  Operators: ${monitor.totalOperators}
  Last update: ${monitor.lastUpdate}
  Update count: ${monitor.updateCount}
`);
```

### Verify suggestions details

```javascript
const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

// Show ALL candidates (not just top 3)
console.log('All candidates:');
suggestions.candidates.forEach(c => {
  console.log(`
    ${c.name}:
    • Score: ${c.score}
    • Region match: ${c.scoring.regionMatch}
    • Available: ${c.scoring.available}
    • Current load: ${c.scoring.currentLoad}
    • Already applied: ${c.scoring.alreadyApplied}
  `);
});
```

---

## Key Differences from Workflows

| Aspect | OperatorAutoMatchEngine | OperatorMarketplaceWorkflow |
|--------|------------------------|---------------------------|
| **Reads** | ✅ Yes | ✅ Yes |
| **Writes** | ❌ No | ✅ Yes |
| **Purpose** | Analyze & suggest | Apply & manage applications |
| **Use case** | Intelligence | Action |

**In practice:**
1. **OperatorAutoMatchEngine** analyzes: "Session X needs operators, here are candidates"
2. **OperatorMarketplaceWorkflow** acts: "Apply operator Y to session X"

---

## Next Steps

After getting comfortable with console examples:

1. Read full documentation: [`OPERATOR_AUTOMATCH_USAGE.md`](./OPERATOR_AUTOMATCH_USAGE.md)
2. Review scoring system details
3. Implement dashboard monitoring widget
4. Set up automated alert system
5. Integrate with your workflows

---

## Cheat Sheet

```javascript
// Get sessions needing operators
const needOps = OperatorAutoMatchEngine.getSessionsNeedingOperators();

// Get suggestions for a session
const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

// Check if founder fallback needed
const fallback = OperatorAutoMatchEngine.isFounderFallbackRequired(sessionId);

// Access from Domain object
Domain.OperatorAutoMatchEngine.getSessionsNeedingOperators();
Domain.PlanningRealtimeService.getRawState();
```

That's it! You're ready to use OperatorAutoMatchEngine.
