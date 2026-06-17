# Intelligence Guide

This guide covers how the Baseplate intelligence layer works, how to add custom rules, and how the ML scaffolding prepares for Phase 5 model training.

## Architecture

```
packages/intelligence/
  src/
    types.ts              — RiskLevel, RiskFlag, RiskScore, RuleContext, RuleEvaluator
    rules-engine/
      evaluate.ts         — evaluateRisk() orchestrator (async, needs Supabase)
      evaluate.ts         — evaluateRiskSync() (sync, takes pre-built context)
      data-fetchers.ts    — buildRuleContext() (fetches from Supabase)
      rules/
        no-show-risk.ts   — Rule 1
        churn-risk.ts     — Rule 2
        revenue-drop.ts   — Rule 3
        package-abandonment.ts — Rule 4
        inventory-expiry.ts    — Rule 5
        follow-up-gap.ts       — Rule 6
    predictions/
      types.ts            — PredictionModel, TrainingData, ModelMetrics interfaces
      no-show-predictor.ts     — Heuristic stub (falls back to rules)
      churn-predictor.ts       — Heuristic stub
      revenue-predictor.ts     — Heuristic stub
      features.ts              — Feature extractors (appointment, payment, engagement)
      training.ts              — trainModel(), evaluateModel() interfaces
```

## How Rules Work

Each rule implements the `RuleEvaluator` interface:

```typescript
interface RuleEvaluator {
  id: string;
  evaluate(ctx: RuleContext): RiskFlag[];
}
```

The orchestrator (`evaluateRisk`) runs all rules and aggregates results:
1. Fetches data from Supabase via `buildRuleContext()` (appointments, payments, packages, audit logs)
2. Runs each rule against the context
3. Collects all flags
4. Computes overall risk level = max severity across all flags
5. Returns a `RiskScore` with recommendation text

## Adding a Custom Rule

```typescript
import type { RuleEvaluator } from '@baseplate/intelligence';
import { evaluateRisk, defaultRules } from '@baseplate/intelligence';

const satisfactionRule: RuleEvaluator = {
  id: 'low-satisfaction',
  evaluate(ctx) {
    const recent = ctx.appointments.filter(
      (a) => a.patient_id === ctx.customerId && a.status === 'completed'
    );
    // Your logic here
    if (recent.length === 0) return [];
    return [{
      type: 'satisfaction_gap',
      severity: 'low',
      reason: 'Customer has not had a follow-up within 2 weeks',
      action: 'Send care instructions',
    }];
  },
};

// Use with default rules + custom
const score = await evaluateRisk({
  tenantId,
  customerId,
  client,
  rules: [...defaultRules, satisfactionRule],
});
```

## Connect API Endpoint

```
POST /api/v1/intelligence/risk-score
X-API-Key: sk_...
Content-Type: application/json

{
  "tenant_id": "uuid",
  "customer_id": "uuid"  // optional — omit for tenant-level analysis
}
```

Response:
```json
{
  "tenant_id": "uuid",
  "customer_id": "uuid",
  "overall_risk": "high",
  "flags": [
    {
      "type": "no_show_risk",
      "severity": "high",
      "reason": "3 no-shows in the last 90 days",
      "action": "Send SMS reminder 72h before next appointment",
      "data": { "no_show_count": 3, "window_days": 90 }
    }
  ],
  "recommendation": "Immediate follow-up recommended...",
  "evaluated_at": "2026-06-15T20:35:02.000Z"
}
```

## ML Scaffolding (Phase 3E)

The predictions module defines interfaces for future ML models. Until real pilot data exists (Phase 5: 50+ clinics, 6+ months), all predictors fall back to the rules-engine heuristics.

### Available Predictors

| Predictor | Input | Output | Fallback |
|-----------|-------|--------|----------|
| `NoShowPredictor` | RuleContext | `{ probability, confidence, factors }` | No-show-risk rule |
| `ChurnPredictor` | RuleContext | `{ probability, confidence, timeline }` | Churn-risk rule |
| `RevenuePredictor` | RuleContext | `{ projected, confidence, trend }` | Revenue-drop rule |

### Feature Extractors

```typescript
import { allFeatureExtractors } from '@baseplate/intelligence';

const features = allFeatureExtractors.map(ext => ext.extract(ruleContext));
// Returns number[][]: [appointmentFeatures, paymentFeatures, engagementFeatures]
```

### Training Pipeline (Phase 5 activation)

```typescript
import { trainModel, NoShowPredictor } from '@baseplate/intelligence';

const model = new NoShowPredictor();
await trainModel({
  modelType: 'no-show',
  data: { inputs: [...], labels: [...] },
  model,
});
// model.isTrained === true, predictions now use trained model
```

## Synthetic Test Data

Migration `0012_intelligence_seed.sql` creates 3 synthetic clinics, 5 patients, and test data that exercises all 6 rules. Cleanup commands are included at the bottom of the migration file.
