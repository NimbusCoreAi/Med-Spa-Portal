# @baseplate/intelligence

Rules-based risk intelligence and ML scaffolding for the Baseplate platform.

## Quick Start

```ts
import { evaluateRisk } from '@baseplate/intelligence';
import { getServiceSupabaseClient } from '@baseplate/core/config';

const score = await evaluateRisk({
  tenantId: 'clinic-uuid',
  customerId: 'patient-uuid',
  client: getServiceSupabaseClient(),
});
```

## API

### `evaluateRisk(params): Promise<RiskScore>`

Runs all (or a subset of) rules against tenant/customer data.

```ts
interface RiskScore {
  tenantId: string;
  customerId?: string;
  overallRisk: 'low' | 'medium' | 'high';
  flags: RiskFlag[];
  recommendation: string;
  evaluatedAt: Date;
}
```

### `evaluateRiskSync(ctx, rules?): RiskScore`

Synchronous evaluation given a pre-built `RuleContext`. Useful for testing or when you already have the data.

## Rules Engine

| Rule | ID | Severity | Trigger |
|------|----|----------|---------|
| No-Show Risk | `no-show-risk` | HIGH | 2+ no-shows in 90 days |
| Churn Risk | `churn-risk` | MEDIUM | No appointment in 60+ days (avg cycle ≤28d) |
| Revenue Drop | `revenue-drop` | LOW | Revenue down >15% vs prior 3-month period |
| Package Abandonment | `package-abandonment` | MEDIUM | Remaining sessions, 90+ days inactive |
| Inventory Expiry | `inventory-expiry` | MEDIUM | Products expiring within 30 days |
| Follow-Up Gap | `follow-up-gap` | LOW | No follow-up 14+ days after completed appointment |

### Adding Custom Rules

```ts
import type { RuleEvaluator } from '@baseplate/intelligence';

const myRule: RuleEvaluator = {
  id: 'my-custom-rule',
  evaluate(ctx) {
    if (someCondition(ctx)) {
      return [{ type: 'custom_risk', severity: 'medium', reason: '...', action: '...' }];
    }
    return [];
  },
};

const score = await evaluateRisk({
  tenantId, customerId, client,
  rules: [...defaultRules, myRule],
});
```

## ML Scaffolding (Phase 3E + Phase 4D)

```ts
import { NoShowPredictor, ChurnPredictor, RevenuePredictor } from '@baseplate/intelligence';

const noShowPredictor = new NoShowPredictor();
// Falls back to rules-engine heuristics until trained
const prediction = await noShowPredictor.predict(ruleContext);
```

### Python ML Pipeline (Phase 4D)

A Python training pipeline lives in `ml-models/` with:
- `features.py` — feature extraction aligned with TS extractors
- `train.py` — churn + LTV model training (scikit-learn)
- `serve.py` — FastAPI prediction server
- `evaluate.py` — model evaluation (accuracy, precision, recall, F1)
- `notebooks/churn_prediction.ipynb` — walkthrough notebook

The Connect API endpoint `POST /api/v1/intelligence/churn-prediction` uses the heuristic fallback (rules-engine ChurnPredictor) until models are trained on real data in Phase 5.

See `docs/INTELLIGENCE_GUIDE.md` for the full developer guide.

## Pricing

Intelligence is an add-on to Connect: **$99-199/month** (activated in Phase 5 when customers exist).
