# StaffingRiskEngine — Quick Start

## 5-Minute Setup

### Prerequisites

Services must be loaded in order (automatic via index.html):
1. ✅ PlanningRealtimeService
2. ✅ OperatorAutoMatchEngine
3. ✅ StaffingRiskEngine

### Verify Setup

```javascript
// Check services are ready
console.log(window.StaffingRiskEngine);
// → StaffingRiskEngine { getRiskSessions, getSessionRisk, getOperatorOverload, ... }

// Or via Domain
console.log(Domain.StaffingRiskEngine);
```

---

## Core Concepts

**Risk Levels:**
- 🔴 **CRITICAL** — < 48h + understaffed → immediate action needed
- 🟠 **HIGH** — < 5 days + < 50% staffed → accelerate hiring
- 🟡 **MEDIUM** — Limited candidates or approaching → prepare fallback
- 🟢 **LOW** — Fully staffed or plenty of time → routine monitoring

**Fallback Probability:** 0-100% likelihood founder intervention needed

---

## Common Tasks

### Get Risk Overview

```javascript
// All sessions with risk assessment
const risks = StaffingRiskEngine.getRiskSessions();

console.log(`Risk Report: ${risks.length} sessions`);
risks.forEach(s => {
  const icon = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' }[s.riskLevel];
  console.log(`${icon} ${s.date}: ${s.riskLevel} (${s.daysUntil}d, Gap:${s.staffingGap}, Fallback:${s.fallbackProbability}%)`);
});
```

### Check Specific Session

```javascript
// Deep dive into one session
const risk = StaffingRiskEngine.getSessionRisk('sess_12345');

console.log(`
  Session: ${risk.sessionId}
  Risk: ${risk.riskLevel}

  Timeline:
  • ${risk.timeline.daysUntil}d / ${risk.timeline.hoursUntil}h / ${risk.timeline.minutesUntil}m
  • Critical Window: ${risk.timeline.isCriticalWindow ? '⚠️' : '✓'}

  Staffing:
  • ${risk.staffingPercent}% (${risk.staffingGap} needed)
  • Candidates: ${risk.availableCandidates}/${risk.candidateCount}

  Fallback Risk: ${risk.fallbackProbability}%
`);
```

### Find Critical Sessions

```javascript
// Only CRITICAL + HIGH risk
const urgent = StaffingRiskEngine.getRiskSessions()
  .filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');

console.log(`🚨 ${urgent.length} URGENT sessions:`);
urgent.forEach(s => {
  console.log(`  ${s.date}: ${s.riskLevel} (Fallback: ${s.fallbackProbability}%)`);
});
```

### Monitor Operator Load

```javascript
// Is this operator overloaded?
const load = StaffingRiskEngine.getOperatorOverload('op_123');

console.log(`
  ${load.name}: ${load.currentLoad} sessions
  Overloaded: ${load.isOverloaded ? '⚠️ YES' : 'No'}
  Risk: ${load.riskLevel}
  Peak: ${load.maxLoadCount} on ${load.maxLoadDate}
`);
```

### Dashboard Summary

```javascript
// Quick metrics
function riskSummary() {
  const all = StaffingRiskEngine.getRiskSessions();
  const critical = all.filter(s => s.riskLevel === 'CRITICAL').length;
  const high = all.filter(s => s.riskLevel === 'HIGH').length;
  const avg = Math.round(all.reduce((sum, s) => sum + s.fallbackProbability, 0) / all.length);

  console.log(`
    Sessions: ${all.length}
    🔴 CRITICAL: ${critical}  🟠 HIGH: ${high}
    Avg Fallback Risk: ${avg}%
  `);
}

riskSummary();
```

---

## Real-Time Monitoring

```javascript
// Check every 5 minutes
setInterval(() => {
  const risks = StaffingRiskEngine.getRiskSessions();
  const critical = risks.filter(s => s.riskLevel === 'CRITICAL');

  if (critical.length > 0) {
    console.log(`[${new Date().toLocaleTimeString()}] 🚨 ${critical.length} CRITICAL sessions`);
    // Trigger notifications
  }
}, 5 * 60 * 1000);
```

---

## Integration with Other Engines

```javascript
// Combine intelligence layers
async function smartActionPlan(sessionId) {
  // 1. Check current status
  const autoMatch = OperatorAutoMatchEngine.getSuggestedOperators(sessionId);

  // 2. Check future risk
  const risk = StaffingRiskEngine.getSessionRisk(sessionId);

  // 3. Make decision
  if (risk.riskLevel === 'CRITICAL') {
    return 'TRIGGER_EMERGENCY_PROTOCOL';
  } else if (autoMatch.founderFallbackRequired) {
    return 'PREPARE_FALLBACK';
  } else if (autoMatch.candidates.length > 0) {
    return 'APPLY_TOP_CANDIDATE';
  } else {
    return 'MONITOR_CLOSELY';
  }
}
```

---

## Data Reference

### Risk Session
```javascript
{
  sessionId: "...",
  date: "2025-03-15",
  daysUntil: 1,
  riskLevel: "CRITICAL",        // CRITICAL|HIGH|MEDIUM|LOW
  staffingGap: 1,
  staffingPercent: 50,
  candidateCount: 3,
  availableCandidates: 0,
  fallbackProbability: 85,
  riskFactors: ["..."],
  recommendedActions: ["..."]
}
```

### Risk Details (getSessionRisk)
```javascript
{
  // ... all fields from above, plus:
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
  name: "...",
  currentLoad: 6,
  isOverloaded: true,
  riskLevel: "HIGH",
  maxLoadDate: "2025-03-15",
  maxLoadCount: 5,
  busyDates: ["2025-03-15", ...]
}
```

---

## Cheat Sheet

```javascript
// Get all risks
StaffingRiskEngine.getRiskSessions()

// Check one session
StaffingRiskEngine.getSessionRisk(sessionId)

// Check operator overload
StaffingRiskEngine.getOperatorOverload(operatorId)

// Risk levels
StaffingRiskEngine.RISK_LEVELS
// → { CRITICAL, HIGH, MEDIUM, LOW }
```

---

## Next Steps

1. Read full guide: [`STAFFING_RISK_USAGE.md`](./STAFFING_RISK_USAGE.md)
2. Set up dashboard monitoring
3. Configure alert thresholds
4. Integrate with workflows

---

## Key Differences

| Engine | Focus | Use For |
|--------|-------|---------|
| **OperatorAutoMatchEngine** | Current status | "Who can I apply now?" |
| **StaffingRiskEngine** | Future risk | "What will go wrong?" |
| **Combined** | Intelligent action | "What should I do?" |

That's it! You're ready to use StaffingRiskEngine.
