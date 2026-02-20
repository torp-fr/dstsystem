# StaffingRiskEngine — Usage Guide

## Overview

The **StaffingRiskEngine** is a forward-looking intelligence service that evaluates future staffing risk for sessions. Unlike OperatorAutoMatchEngine which analyzes current status, this engine focuses on **preventive risk detection** and **proactive alerts**.

**Key Properties:**
- ✅ NO database writes
- ✅ NO workflow calls
- ✅ ONLY reads from PlanningRealtimeService + OperatorAutoMatchEngine
- ✅ Time-based risk analysis
- ✅ Operator overload detection
- ✅ Founder fallback probability calculation

---

## Architecture

```
┌──────────────────────────┐
│  PlanningRealtimeService │
│  (Real-time state)       │
└────────────┬─────────────┘
             │
             ├─────────────────────────┐
             ↓                         ↓
┌──────────────────────────┐  ┌─────────────────────┐
│ OperatorAutoMatchEngine  │  │ StaffingRiskEngine  │
│ (Suggestions)            │  │ (This service)      │
└──────────────────────────┘  └────────────┬────────┘
             ▲                             │
             └─────────────────────────────┘
                    (combines analysis)
                             │
                             ↓
                    ┌──────────────────┐
                    │ Risk Alerts/     │
                    │ Dashboards       │
                    └──────────────────┘
```

---

## Risk Levels

### CRITICAL 🔴
**Conditions:**
- Session date < 48 hours
- AND operators assigned < operators required

**Actions:**
- Urgent founder notification
- Allow emergency assignment
- Manual intervention required

**Example:** Session in 24 hours, needs 2 operators, has 0 assigned

---

### HIGH 🟠
**Conditions:**
- Session date < 5 days
- AND staffing < 50%

**Actions:**
- Accelerate marketplace applications
- Contact top candidates directly
- Prepare fallback plan

**Example:** Session in 3 days, 30% staffed (1/3 operators)

---

### MEDIUM 🟡
**Conditions:**
- Only 1 candidate available, OR
- < 5 days with staffing gap

**Actions:**
- Monitor closely
- Secure backup candidates
- Prepare fallback plan

**Example:** Session in 4 days with gap, but only 1 suitable operator available

---

### LOW 🟢
**Conditions:**
- Fully staffed, OR
- Sufficient candidates + time

**Actions:**
- Routine monitoring

**Example:** Session in 10 days, fully staffed

---

## Console Usage Examples

### 1. Get all sessions with risk evaluation

```javascript
// Get risk assessment for all sessions
const riskSessions = StaffingRiskEngine.getRiskSessions();

console.log(`[Risk Report] ${riskSessions.length} sessions evaluated`);
console.log('');

riskSessions.forEach(session => {
  const icon = {
    'CRITICAL': '🔴',
    'HIGH': '🟠',
    'MEDIUM': '🟡',
    'LOW': '🟢'
  }[session.riskLevel];

  console.log(`
    ${icon} ${session.date} (${session.daysUntil} days)
    Session: ${session.sessionId}
    Risk Level: ${session.riskLevel}
    Staffing: ${session.staffingPercent}% (${session.staffingGap} more needed)
    Candidates: ${session.availableCandidates}/${session.candidateCount} available
    Fallback Probability: ${session.fallbackProbability}%

    Factors: ${session.riskFactors.join(' | ')}
    Actions: ${session.recommendedActions.join(' | ')}
  `);
});
```

**Output:**
```
[Risk Report] 3 sessions evaluated

    🔴 2025-03-15 (1 days)
    Session: sess_12345
    Risk Level: CRITICAL
    Staffing: 50% (1 more needed)
    Candidates: 0/3 available
    Fallback Probability: 85%

    Factors: Session in 24 hours with 1 gap
    Actions: URGENT_FOUNDER_NOTIFICATION | ALLOW_EMERGENCY_ASSIGNMENT

    🟠 2025-03-16 (2 days)
    Session: sess_67890
    Risk Level: HIGH
    Staffing: 33% (2 more needed)
    Candidates: 1/4 available
    Fallback Probability: 70%

    Factors: 2 days until session | Only 33% staffed
    Actions: ACCELERATE_APPLICATIONS | CONTACT_CANDIDATES

    🟡 2025-03-18 (4 days)
    Session: sess_11111
    Risk Level: MEDIUM
    Staffing: 75% (1 more needed)
    Candidates: 1/2 available
    Fallback Probability: 25%

    Factors: Only 1 candidate available | 4 days until session with gap
    Actions: MONITOR_CLOSELY | PREPARE_FALLBACK_PLAN
```

### 2. Get detailed risk for a specific session

```javascript
// Deep dive into a single session's risk profile
const sessionId = 'sess_12345';
const risk = StaffingRiskEngine.getSessionRisk(sessionId);

console.log(`[Detailed Risk Analysis] ${sessionId}`);
console.log(`
  Date: ${risk.date}
  Status: ${risk.riskLevel}

  Timeline:
  • Days: ${risk.timeline.daysUntil}
  • Hours: ${risk.timeline.hoursUntil}
  • Minutes: ${risk.timeline.minutesUntil}
  • Critical Window: ${risk.timeline.isCriticalWindow ? '⚠️ YES' : 'No'}

  Staffing:
  • Assigned: ${risk.staffingPercent}%
  • Gap: ${risk.staffingGap} operators needed

  Candidates:
  • Total: ${risk.candidateCount}
  • Available: ${risk.availableCandidates}

  Founder Fallback:
  • Probability: ${risk.fallbackProbability}%

  Risk Factors:
  ${risk.riskFactors.map(f => `  • ${f}`).join('\n')}

  Recommended Actions:
  ${risk.recommendedActions.map(a => `  • ${a}`).join('\n')}
`);
```

**Output:**
```
[Detailed Risk Analysis] sess_12345

  Date: 2025-03-15
  Status: CRITICAL

  Timeline:
  • Days: 1
  • Hours: 24
  • Minutes: 1440
  • Critical Window: ⚠️ YES

  Staffing:
  • Assigned: 50%
  • Gap: 1 operators needed

  Candidates:
  • Total: 3
  • Available: 0

  Founder Fallback:
  • Probability: 85%

  Risk Factors:
    • Session in 24 hours with 1 gap

  Recommended Actions:
    • URGENT_FOUNDER_NOTIFICATION
    • ALLOW_EMERGENCY_ASSIGNMENT
```

### 3. Check operator overload situations

```javascript
// Evaluate if an operator is overloaded
const operatorId = 'op_123';
const overload = StaffingRiskEngine.getOperatorOverload(operatorId);

console.log(`[Operator Overload Check] ${overload.name}`);
console.log(`
  Operator: ${overload.name} (${overload.region})
  Status: ${overload.availabilityStatus}

  Workload:
  • Total Sessions: ${overload.currentLoad}
  • Overloaded: ${overload.isOverloaded ? '⚠️ YES' : 'No'}
  • Risk Level: ${overload.riskLevel}

  Peak Load:
  • Date: ${overload.maxLoadDate}
  • Sessions: ${overload.maxLoadCount}

  Busy Dates: ${overload.busyDates.join(', ')}

  ${overload.overloadCount > 0 ? `
  Overload Situations: ${overload.overloadCount}
  ${overload.overloadSessions.map(o => `
    • ${o.date}: ${o.sessionCount} sessions
      Sessions: ${o.sessions.map(s => s.sessionId).join(', ')}
  `).join('\n')}
  ` : 'No overload situations'}
`);
```

**Output:**
```
[Operator Overload Check] Jean Dupont

  Operator: Jean Dupont (occitanie)
  Status: ACTIVE

  Workload:
  • Total Sessions: 6
  • Overloaded: ⚠️ YES
  • Risk Level: HIGH

  Peak Load:
  • Date: 2025-03-15
  • Sessions: 5

  Busy Dates: 2025-03-15, 2025-03-16, 2025-03-17, 2025-03-18, 2025-03-19, 2025-03-20

  Overload Situations: 1

    • 2025-03-15: 5 sessions
      Sessions: sess_12345, sess_67890, sess_11111, sess_22222, sess_33333
```

### 4. Filter sessions by risk level

```javascript
// Get only CRITICAL and HIGH risk sessions
function getUrgentRiskSessions() {
  const allRisk = StaffingRiskEngine.getRiskSessions();
  return allRisk.filter(s =>
    s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH'
  );
}

const urgent = getUrgentRiskSessions();
console.log(`[URGENT] ${urgent.length} sessions need immediate attention`);

urgent.forEach(session => {
  console.log(`  ${session.date}: ${session.riskLevel} (${session.daysUntil}d, ${session.fallbackProbability}% fallback risk)`);
});
```

**Output:**
```
[URGENT] 2 sessions need immediate attention
  2025-03-15: CRITICAL (1d, 85% fallback risk)
  2025-03-16: HIGH (2d, 70% fallback risk)
```

### 5. Identify operators approaching overload

```javascript
// Find operators at risk of overload
function getOverloadedOperators() {
  const { planning } = _getServices(); // Internal: for demo only
  const state = planning.getRawState();
  const overloaded = [];

  for (const operatorId of Object.keys(state.operatorsAvailable)) {
    const overload = StaffingRiskEngine.getOperatorOverload(operatorId);
    if (overload.riskLevel === 'HIGH' || overload.riskLevel === 'CRITICAL') {
      overloaded.push(overload);
    }
  }

  return overloaded;
}

const overloadedOps = getOverloadedOperators();
console.log(`[OPERATOR OVERLOAD] ${overloadedOps.length} operators overloaded`);

overloadedOps.forEach(op => {
  console.log(`  ${op.name}: ${op.currentLoad} sessions (Peak: ${op.maxLoadCount} on ${op.maxLoadDate})`);
});
```

**Output:**
```
[OPERATOR OVERLOAD] 2 operators overloaded
  Jean Dupont: 6 sessions (Peak: 5 on 2025-03-15)
  Marie Martin: 5 sessions (Peak: 4 on 2025-03-16)
```

---

## Risk Dashboard Example

```javascript
/**
 * Complete Risk Dashboard
 * Shows all risk metrics at a glance
 */
function displayRiskDashboard() {
  const allRisk = StaffingRiskEngine.getRiskSessions();

  // Aggregate by risk level
  const byLevel = {
    CRITICAL: allRisk.filter(s => s.riskLevel === 'CRITICAL'),
    HIGH: allRisk.filter(s => s.riskLevel === 'HIGH'),
    MEDIUM: allRisk.filter(s => s.riskLevel === 'MEDIUM'),
    LOW: allRisk.filter(s => s.riskLevel === 'LOW')
  };

  // Calculate metrics
  const avgFallbackRisk = allRisk.length > 0
    ? Math.round(allRisk.reduce((sum, s) => sum + s.fallbackProbability, 0) / allRisk.length)
    : 0;

  const totalStaffingGap = allRisk.reduce((sum, s) => sum + s.staffingGap, 0);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                  🎯 STAFFING RISK DASHBOARD                ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  RISK SUMMARY                                              ║
║  ┌──────────────────────────────────────────────────────┐  ║
║  │ 🔴 CRITICAL: ${byLevel.CRITICAL.length.toString().padStart(2)}              🟠 HIGH: ${byLevel.HIGH.length.toString().padStart(2)}            │  ║
║  │ 🟡 MEDIUM:   ${byLevel.MEDIUM.length.toString().padStart(2)}              🟢 LOW:  ${byLevel.LOW.length.toString().padStart(2)}            │  ║
║  │                                                     │  ║
║  │ Total Sessions at Risk: ${(byLevel.CRITICAL.length + byLevel.HIGH.length + byLevel.MEDIUM.length).toString().padStart(2)} / ${allRisk.length}                  │  ║
║  └──────────────────────────────────────────────────────┘  ║
║                                                            ║
║  METRICS                                                   ║
║  ┌──────────────────────────────────────────────────────┐  ║
║  │ Avg Fallback Risk: ${avgFallbackRisk}%                                │  ║
║  │ Total Staffing Gap: ${totalStaffingGap} operators                       │  ║
║  └──────────────────────────────────────────────────────┘  ║
║                                                            ║
║  CRITICAL SESSIONS (< 48h, understaffed)                  ║
║  ┌──────────────────────────────────────────────────────┐  ║
${byLevel.CRITICAL.slice(0, 3).map(s => `║  │ • ${s.date} [${s.daysUntil}d] Gap:${s.staffingGap} Prob:${s.fallbackProbability}%       │  `).join('\n')}
${byLevel.CRITICAL.length > 3 ? `║  │ ... and ${byLevel.CRITICAL.length - 3} more                                │  ` : ''}
║  └──────────────────────────────────────────────────────┘  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

displayRiskDashboard();
```

---

## Data Structures

### Risk Session

```javascript
{
  sessionId: "sess_12345",
  clientId: "client_001",
  date: "2025-03-15",
  daysUntil: 1,
  riskLevel: "CRITICAL",           // CRITICAL|HIGH|MEDIUM|LOW
  staffingGap: 1,                   // Operators needed
  staffingPercent: 50,              // 0-100
  candidateCount: 3,                // Total candidates
  availableCandidates: 0,           // Not busy on session date
  fallbackProbability: 85,          // 0-100%
  riskFactors: [                    // Why this risk level
    "Session in 24 hours with 1 gap"
  ],
  recommendedActions: [             // What to do
    "URGENT_FOUNDER_NOTIFICATION",
    "ALLOW_EMERGENCY_ASSIGNMENT"
  ]
}
```

### Detailed Session Risk

```javascript
{
  sessionId: "sess_12345",
  date: "2025-03-15",
  riskLevel: "CRITICAL",
  staffingGap: 1,
  staffingPercent: 50,
  candidateCount: 3,
  availableCandidates: 0,
  fallbackProbability: 85,
  riskFactors: [...],
  recommendedActions: [...],
  timeline: {
    daysUntil: 1,
    hoursUntil: 24,
    minutesUntil: 1440,
    isCriticalWindow: true
  }
}
```

### Operator Overload

```javascript
{
  operatorId: "op_123",
  name: "Jean Dupont",
  email: "jean@example.com",
  region: "occitanie",
  currentLoad: 6,                   // Total sessions
  isOverloaded: true,
  overloadCount: 1,                 // Dates with > 4 sessions
  overloadSessions: [
    {
      date: "2025-03-15",
      sessionCount: 5,
      sessions: [
        { sessionId: "sess_1", clientId: "client_1" }
        // ...
      ]
    }
  ],
  riskLevel: "HIGH",
  busyDates: ["2025-03-15", "2025-03-16", ...],
  maxLoadDate: "2025-03-15",
  maxLoadCount: 5,
  availabilityStatus: "ACTIVE"
}
```

---

## Risk Calculation Details

### Fallback Probability

Calculated from multiple factors:

```
Base probability (from risk level):
  CRITICAL: 80%
  HIGH: 50%
  MEDIUM: 20%
  LOW: 0%

Adjustments:
  + Staffing gap: 15% per missing operator
  + Candidate scarcity: 40% (none), 20% (1), 10% (insufficient)
  + Time urgency: 20% (0 days), 15% (1 day), 10% (< 3 days)

Result: 0-100%
```

**Example:**
```
Base:           80% (CRITICAL risk level)
Gap (+1×15%):   +15%
No candidates:  +40%
0 days:         +20%
─────────────────────
Total:          155% → capped at 100%
```

---

## Best Practices

### 1. Monitor Critical Sessions Daily

```javascript
// Daily check for critical sessions
function dailyRiskCheck() {
  const critical = StaffingRiskEngine.getRiskSessions()
    .filter(s => s.riskLevel === 'CRITICAL');

  if (critical.length > 0) {
    notifyFounders(critical);
  }
}

// Run at start of business day
dailyRiskCheck();
```

### 2. Alert on Risk Level Changes

```javascript
// Track previous state to detect worsening
let previousRisk = {};

function checkRiskEscalation() {
  const current = StaffingRiskEngine.getRiskSessions();

  current.forEach(session => {
    const prev = previousRisk[session.sessionId];
    if (prev && prev.riskLevel !== session.riskLevel) {
      // Risk level changed
      if (isWorse(prev.riskLevel, session.riskLevel)) {
        console.log(`⚠️ Risk escalated: ${session.sessionId} (${prev.riskLevel} → ${session.riskLevel})`);
        alertManagers(session);
      }
    }
  });

  // Update state
  previousRisk = Object.fromEntries(
    current.map(s => [s.sessionId, s])
  );
}
```

### 3. Prevent Operator Burnout

```javascript
// Monitor operators to prevent overload
function checkOperatorWellbeing() {
  const overloadedOps = [];

  // Check all operators
  const state = PlanningRealtimeService.getRawState();
  for (const opId of Object.keys(state.operatorsAvailable)) {
    const overload = StaffingRiskEngine.getOperatorOverload(opId);
    if (overload.isOverloaded) {
      overloadedOps.push(overload);
    }
  }

  if (overloadedOps.length > 0) {
    console.log(`⚠️ ${overloadedOps.length} operators at risk of burnout`);
    // Don't assign more sessions to them
  }
}
```

### 4. Combine with AutoMatch for Intelligent Suggestions

```javascript
// Use both engines for smart decisions
function smartOperatorAssignment(sessionId) {
  // Check risk
  const risk = StaffingRiskEngine.getSessionRisk(sessionId);

  if (risk.riskLevel === 'CRITICAL' || risk.fallbackProbability > 70) {
    // Use founder fallback
    return await triggerFounderFallback(sessionId);
  }

  // Get suggestions
  const suggestions = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

  if (suggestions.candidates.length > 0) {
    // Safe to apply
    const best = suggestions.candidates[0];
    return await applyOperator(sessionId, best.operatorId);
  }

  // No suitable candidates - escalate
  return await notifyFounders(sessionId);
}
```

---

## Dependencies

| Service | Required | Purpose |
|---------|----------|---------|
| PlanningRealtimeService | ✅ Yes | Real-time state |
| OperatorAutoMatchEngine | ✅ Yes | Candidate suggestions |
| Supabase | ❌ No | Not queried directly |

---

## Troubleshooting

### "Dependencies not initialized"

```javascript
// Make sure services load in order:
// 1. PlanningRealtimeService (in index.html)
// 2. OperatorAutoMatchEngine (in index.html)
// 3. StaffingRiskEngine (in index.html)
// 4. Dashboard initialization

// Check they're loaded:
console.log(window.PlanningRealtimeService);
console.log(window.OperatorAutoMatchEngine);
console.log(window.StaffingRiskEngine);
```

### No high-risk sessions returned

Possible reasons:
1. All sessions are > 5 days away
2. All sessions are fully staffed
3. Sessions not marked as `confirmed`

Check raw state:
```javascript
const state = PlanningRealtimeService.getRawState();
console.log('Sessions:', state.sessionsByDate);

// Or check specific dates
const risk = StaffingRiskEngine.getSessionRisk('sess_123');
console.log('Risk:', risk);
```

### Fallback probability seems high

The algorithm is conservative to prevent surprises. Check:
- Days until session (closer = higher risk)
- Number of available candidates
- Current staffing percentage

---

## Summary

**StaffingRiskEngine** provides:

✅ **Proactive risk detection** — Know problems before they happen
✅ **Time-aware analysis** — Sessions closing in on dates
✅ **Operator insights** — Detect overload situations
✅ **Probability scoring** — Estimate founder fallback likelihood
✅ **Actionable recommendations** — Clear next steps

Use it to stay ahead of staffing problems.
