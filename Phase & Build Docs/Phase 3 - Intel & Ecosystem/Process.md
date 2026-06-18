# Phase 3: Intelligence & Ecosystem Build — Process Guide

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Goal:** Build intelligence layer, marketplace, MCP server, ML scaffolding, home services portal
**Note:** Pure build phase — no customer contact. AI-accelerated timelines.

---

## Rules-Based Risk Intelligence

### Step 1: Design the Data Model for Intelligence (4-6 hours)

Before building intelligence, design what data the intelligence layer will consume once real pilots are live in Phase 5.

- [ ] Define the data model that will power risk scoring (design schema now, populate with synthetic/test data):

```sql
-- Tables that will feed the intelligence layer (designed in Phase 3, populated with real data in Phase 5)
SELECT 
  COUNT(DISTINCT user_id) as total_customers,
  COUNT(DISTINCT tenant_id) as total_entities,
  COUNT(*) as total_payments,
  MIN(created_at) as oldest_payment,
  MAX(created_at) as latest_payment
FROM payments;

SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as payment_count,
  AVG(amount) as avg_amount,
  SUM(amount) as total_volume
FROM payments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

- [ ] Seed synthetic test data to validate the model:
  - Synthetic customers: 10-20 test tenants
  - Synthetic transactions: 100-200 test payments
  - Edge cases: failed payments, dormant accounts, revenue drops

**Decision point:** ML vs. rules-based (deferred to Phase 5)
- **Phase 3:** Build rules-based intelligence (no real data yet — models will be trained on pilot data in Phase 5)
- **Phase 5+:** Once 50+ customers have 6+ months of real data, revisit ML models

### Step 2: Design Rules-Based Risk Flagging (6-8 hours)

Rather than black-box ML, build **explainable rules** first.

**Business logic for "churn risk":**

1. **Payment failure risk:** 2+ failed payment attempts in the last 90 days
2. **Engagement risk:** No portal login in 30+ days
3. **Revenue drop risk:** Average payment amount dropped >20% month-over-month
4. **Late payment risk:** Average days-to-pay increased from baseline

- [ ] Create `apps/connect-api/src/endpoints/intelligence.ts`:

```typescript
import express from 'express';
import { supabase } from '../lib/supabase'; // Assuming Supabase client

const router = express.Router();

interface RiskScore {
  tenant_id: string;
  risk_level: 'low' | 'medium' | 'high';
  factors: Array<{
    factor: string;
    value: string | number;
    threshold: string | number;
    explanation: string;
  }>;
  recommendation: string;
}

router.post('/risk-score', async (req, res) => {
  const { tenant_id } = req.body;

  try {
    // Fetch tenant's payment history (last 90 days)
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenant_id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    const { data: loginEvents } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', tenant_id)
      .eq('action', 'login')
      .order('created_at', { ascending: false })
      .limit(1);

    const factors = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Rule 1: Failed payment attempts
    const failedPayments = payments?.filter((p) => p.paid_at === null) ?? [];
    if (failedPayments.length >= 2) {
      factors.push({
        factor: 'failed_payments',
        value: failedPayments.length,
        threshold: 2,
        explanation: `${failedPayments.length} unpaid invoices in 90 days`,
      });
      riskLevel = 'high';
    }

    // Rule 2: No recent login
    const lastLogin = loginEvents?.[0]?.created_at;
    const daysSinceLogin = lastLogin
      ? (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
      : null;

    if (daysSinceLogin && daysSinceLogin > 30) {
      factors.push({
        factor: 'no_recent_login',
        value: Math.round(daysSinceLogin),
        threshold: 30,
        explanation: `No portal login in ${Math.round(daysSinceLogin)} days`,
      });
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Rule 3: Revenue drop
    const last30Days = payments?.filter(
      (p) => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ) ?? [];
    const prior30Days = payments?.filter((p) => {
      const d = new Date(p.created_at).getTime();
      return (
        d > Date.now() - 60 * 24 * 60 * 60 * 1000 &&
        d < Date.now() - 30 * 24 * 60 * 60 * 1000
      );
    }) ?? [];

    if (last30Days.length > 0 && prior30Days.length > 0) {
      const avg30 = last30Days.reduce((sum, p) => sum + p.amount, 0) / last30Days.length;
      const avgPrior = prior30Days.reduce((sum, p) => sum + p.amount, 0) / prior30Days.length;
      const pctChange = ((avg30 - avgPrior) / avgPrior) * 100;

      if (pctChange < -20) {
        factors.push({
          factor: 'revenue_drop',
          value: Math.round(pctChange),
          threshold: -20,
          explanation: `Average payment dropped ${Math.round(Math.abs(pctChange))}% month-over-month`,
        });
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    const recommendation =
      riskLevel === 'high'
        ? 'Immediate follow-up recommended. Contact tenant to discuss payment issues.'
        : riskLevel === 'medium'
          ? 'Monitor closely. Consider sending reminder email.'
          : 'No concerns detected.';

    const result: RiskScore = {
      tenant_id,
      risk_level: riskLevel,
      factors,
      recommendation,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

- [ ] Add to Connect API main app:

```typescript
import intelligenceRouter from './endpoints/intelligence';
app.use('/v1/intelligence', intelligenceRouter);
```

- [ ] Test locally: Create a test tenant with various payment scenarios and run the endpoint
- [ ] Commit: `git commit -m "feat: add rules-based risk-score endpoint"`

### Step 3: Document the Rules (2-3 hours)

Future customers will need to understand why they're getting a "high risk" flag.

- [ ] Create `docs/endpoints/intelligence.md`:

```markdown
# POST /v1/intelligence/risk-score

Returns an explainable risk score for a tenant based on payment/engagement patterns.

## Scoring Rules

### Rule 1: Failed Payments
- **Trigger:** 2+ unpaid invoices in the last 90 days
- **Impact:** HIGH risk
- **Why:** Multiple overdue payments indicate cash flow stress

### Rule 2: No Recent Login
- **Trigger:** No portal login in 30+ days
- **Impact:** MEDIUM risk
- **Why:** Disengagement correlates with churn

### Rule 3: Revenue Drop
- **Trigger:** Average payment amount dropped >20% month-over-month
- **Impact:** MEDIUM risk
- **Why:** Declining revenue signals business stress

## Request

```json
{
  "tenant_id": "uuid"
}
```

## Response

```json
{
  "tenant_id": "uuid",
  "risk_level": "high|medium|low",
  "factors": [
    {
      "factor": "failed_payments",
      "value": 3,
      "threshold": 2,
      "explanation": "3 unpaid invoices in 90 days"
    }
  ],
  "recommendation": "Immediate follow-up recommended..."
}
```

## Pricing

Intelligence is an add-on to Connect: $99-199/mo (pricing activated in Phase 5 when customers exist).

## Example

```bash
curl -X POST https://connect-api.example.com/v1/intelligence/risk-score \
  -H "X-API-Key: sk_..." \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "123"}'

# Response
{
  "tenant_id": "123",
  "risk_level": "medium",
  "factors": [
    {
      "factor": "no_recent_login",
      "value": 45,
      "threshold": 30,
      "explanation": "No portal login in 45 days"
    }
  ],
  "recommendation": "Monitor closely. Consider sending reminder email."
}
```
```

- [ ] Commit: `git commit -m "docs: add intelligence endpoint docs with rule explanations"`

### Step 4: Integrate Intelligence into Portal UI (4-5 hours)

Build the UI to display risk scores in the portal.

- [ ] Create `apps/portal-[vertical]/src/app/tenants/page.tsx` update to display risk scores:

```typescript
'use client';

import { useState, useEffect } from 'react';

interface Tenant {
  id: string;
  name: string;
  email: string;
}

interface RiskScore {
  tenant_id: string;
  risk_level: 'low' | 'medium' | 'high';
  factors: Array<{ factor: string; explanation: string }>;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [riskScores, setRiskScores] = useState<Record<string, RiskScore>>({});

  useEffect(() => {
    // Fetch tenants
    fetchTenants();
  }, []);

  async function fetchTenants() {
    const res = await fetch('/api/tenants');
    const data = await res.json();
    setTenants(data);

    // Fetch risk scores for each tenant
    const scores: Record<string, RiskScore> = {};
    for (const tenant of data) {
      const scoreRes = await fetch('/api/intelligence/risk-score', {
        method: 'POST',
        body: JSON.stringify({ tenant_id: tenant.id }),
      });
      scores[tenant.id] = await scoreRes.json();
    }
    setRiskScores(scores);
  }

  const riskColor = (level: string) =>
    level === 'high' ? 'bg-red-100' : level === 'medium' ? 'bg-yellow-100' : 'bg-green-100';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tenants</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Risk Level</th>
            <th className="border p-2">Factors</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => {
            const score = riskScores[tenant.id];
            return (
              <tr key={tenant.id} className={riskColor(score?.risk_level || 'low')}>
                <td className="border p-2">{tenant.name}</td>
                <td className="border p-2">{tenant.email}</td>
                <td className="border p-2 font-bold">{score?.risk_level || 'calculating...'}</td>
                <td className="border p-2">
                  {score?.factors.map((f, i) => (
                    <div key={i} className="text-sm">{f.explanation}</div>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] Create `apps/portal-[vertical]/src/app/api/intelligence/risk-score/route.ts` that proxies to Connect:

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CONNECT_API_URL}/v1/intelligence/risk-score`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.CONNECT_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  return response;
}
```

- [ ] Test: Log in as a test user, navigate to Tenants, verify risk scores appear
- [ ] Commit: `git commit -m "feat: display tenant risk scores in portal UI"`

### Step 5: Build Intelligence Pricing Page (3-4 hours)

Build the pricing page and draft outreach templates — not activated until Phase 5 when customers exist.

- [ ] Build pricing page component (not live until Phase 5):

```typescript
{/* Intelligence Add-On */}
<div className="border rounded-lg p-6 mt-8">
  <h2 className="text-2xl font-bold mb-4">Intelligence (Add-On)</h2>
  <p className="text-lg mb-4">$99-199/month</p>
  <ul className="space-y-2 mb-6">
    <li>✅ Risk scoring API</li>
    <li>✅ Churn prediction</li>
    <li>✅ Recommendations</li>
  </ul>
  <button className="bg-purple-500 text-white px-4 py-2 rounded">Add to Plan</button>
</div>
```

- [ ] Draft outreach email template (to be used in Phase 5 when Connect customers exist):

> Subject: New: Churn Risk Scoring for [vertical]
>
> Hi [customer name],
>
> We just launched Intelligence, a new add-on to Connect. It analyzes your tenant/client payment and engagement patterns and flags high-risk accounts before they churn.
>
> It's rules-based (fully explainable, not a black box) and shows you exactly why a tenant is flagged as risky — so you can reach out proactively.
>
> We're offering it to existing Connect customers for $99/month. Want to hop on a quick call to see if it'd be useful for your business?

> **Note:** No outreach during build phases. Templates are prepared now and will be sent to real Connect customers in Phase 5.

- [ ] Commit: `git commit -m "feat: add Intelligence pricing page and outreach templates"`

---

## The Second Vertical

### Step 6: Audit Core Abstraction (4-6 hours)

**Question:** Is `packages/core` + Connect truly vertical-agnostic?

Review `baseplate-core` code:

- [ ] Check `packages/core/src/auth/` — is it generic?
  - Should have: password hash, JWT generation, token verification
  - Should NOT have: vertical-specific roles (those belong in the portal app)
  - ✅ REUSABLE

- [ ] Check `packages/core/src/rbac/` — is it generic?
  - Currently: `owner`, `staff`, `client` roles
  - Better: Make it fully configurable; second vertical may have different roles
  - If it's hardcoded, fix it now
  - ✅ Make it dynamic

- [ ] Check `packages/core/src/audit/` — is it generic?
  - Should have: generic audit entry creation, formatting
  - Should NOT have: med-spa-specific event types
  - ✅ REUSABLE

- [ ] Refactor any hardcoded roles:

```typescript
// Before (hardcoded)
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [...],
  staff: [...],
  client: [...],
};

// After (configurable)
export function createRoleBasedRBAC(rolesConfig: Record<string, Permission[]>) {
  return {
    canPerform: (role: string, resource: string, action: string) => {
      const permissions = rolesConfig[role] || [];
      return permissions.some((p) => p.resource === resource && ...);
    },
  };
}
```

- [ ] Check Connect endpoints — are they generic?
  - `/v1/payments/invoice` should work for any vertical
  - `/v1/notify/email` should work for any vertical
  - If they reference vertical-specific data (e.g., "property"), fix it
  - ✅ REUSABLE

- [ ] Commit refactorings: `git commit -m "refactor: make RBAC configurable for multiple verticals"`

### Step 7: Choose Second Vertical (2-3 hours)

Using the scoring framework from the business plan:

- [ ] Score remaining vertical candidates (Home Services, Fitness, etc.)
- [ ] Pick the ONE vertical most aligned with your current moat and network
- [ ] Document the choice: _______________

### Step 8: Build Second Vertical Portal (20-25 hours)

Repeat Phase 1 & 2, but faster because infrastructure exists.

**Key difference:** Core modules and Connect API already exist, so you're only building vertical-specific UI + features. No customer onboarding — that happens in Phase 5.

- [ ] Create `apps/portal-homeservices` directory
- [ ] Copy `apps/portal-medspa` structure (pages, components)
- [ ] Update domain-specific language (e.g., "patients" → "customers", "treatments" → "services", "intake forms" → "service request forms")
- [ ] Keep same tech stack, same `packages/core` dependency, same Connect integration
- [ ] Build and test all vertical-specific features locally
- [ ] Deploy to Railway (staging — production onboarding deferred to Phase 5)

**Build phase 1:** Infrastructure & core modules
- Create the app structure
- Ensure it imports `@baseplate/core`
- Create domain-specific pages and forms

**Build phase 2:** Integration & testing
- Connect to Stripe/Postmark/Supabase
- Test all integrations with synthetic data
- Verify portal works end-to-end

> **Note:** Pilot identification and customer onboarding are deferred to Phase 5 (build-first model). This step is pure build + test.

- [ ] Commit: `git commit -m "feat: launch second vertical portal [vertical-2]"`

### Step 9: Verify Abstraction Works (2-3 hours)

**The question:** Did you need to rewrite `packages/core` or Connect for the second vertical?

- [ ] Answer each:
  - Did you modify `packages/core`? How much? (< 5% = good; > 20% = problem)
  - Did you modify Connect endpoints? How much?
  - Did you need new endpoints specific to vertical #2?

- [ ] If YES to "needed significant rewrites":
  - The abstraction wasn't as clean as you thought
  - Spend time refactoring before going further
  - Do NOT proceed to Phase 3→4 gate

- [ ] If NO (mostly just copied apps/portal-[vertical-1]):
  - ✅ Abstraction is solid
  - Proceed confidently

### Step 10: Gate Check (2-3 hours)

**Phase 3 → Phase 4 gate threshold:**
- ✅ Second vertical portal built and tested (no customer onboarding during build phases)
- ✅ `baseplate-core` proven reusable with zero rewrites

**Build-focused criteria:**

| Metric | Target | Actual |
|---|---|---|
| Second vertical portal built | Complete | ___ |
| Core modules reused without rewrite | < 5% modification | ___ |
| Connect endpoints scaffolded for new vertical | Complete | ___ |
| Intelligence layer built + tested with synthetic data | Complete | ___ |

- [ ] If **gate passed (portal built, abstraction proven):**
  - Proceed to Phase 4
  - Plan marketplace launch

- [ ] If **gate missed:**
  - Spend more time on second vertical build
  - Refactor core/Connect abstraction
  - The core/Connect abstraction may need refinement

---

## Summary: Phase 3 Artifacts You'll Have

By end of Phase 3 (or when gate is passed):

- ✅ Rules-based risk intelligence endpoint in Connect
- ✅ Intelligence feature in portal UI showing risk scores (tested with synthetic data)
- ✅ Intelligence pricing page built (not live until Phase 5)
- ✅ Second vertical portal fully built and tested (not yet onboarded)
- ✅ Proof that `packages/core` and Connect are truly vertical-agnostic
- ✅ Refined `@baseplate/core` (configurable RBAC, etc.)
- ✅ Outreach email templates prepared (to be sent in Phase 5)
- ✅ Validated moat: "Reusable core + Connect middleware" proven with 2 verticals

> **Note:** No revenue or paying customers during Phase 3 (pure build phase). Customer onboarding, pilot launches, and revenue activation all happen in Phase 5.

**This is the most critical gate.** If you pass this, the path to Phase 4 and beyond is clear. If you don't, you have a solid codebase in one or two verticals, which is a strong foundation even without the ecosystem layer.
