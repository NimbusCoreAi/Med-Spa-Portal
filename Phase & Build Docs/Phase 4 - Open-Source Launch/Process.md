# Phase 4: Open-Source Launch — Process Guide

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Goal:** Publish complete platform to GitHub, marketing, docs, MCP server publishing
**Note:** Final build phase before customer onboarding (Phase 5). AI-accelerated timelines.

---

## Entry Requirements

You only start Phase 4 once:
- ✅ Phase 3 gate passed (platform complete, 2 verticals scaffolded and tested, ML infrastructure ready)
- ✅ `packages/core` and Connect proven reusable with 2 verticals (validated through internal testing)
- ✅ No customer contact during Phases 1-4 (build-first model — customer onboarding starts Phase 5)

If any of these are false, stay in Phase 3. Phase 4 is about open-source distribution and ecosystem readiness, not customer acquisition.

---

## Phase 4, Part 1: Marketplace Infrastructure

### Step 1: Plan Marketplace Model (Week 35, 4-6 hours)

A marketplace lets third-party developers build and sell modules (plugins) to your customers.

**Examples of marketplace modules:**
- "HIPAA Compliance Pack" (for Med Spa vertical)
- "Advanced Invoicing" (QuickBooks, Xero sync, multi-currency)
- "SMS Reminders" (Twilio integration)
- "Tenant Screening" (property management vertical)
- "Google Calendar Sync" (all verticals)

**Marketplace economics:**
- Developer submits module (free to publish)
- Customer buys module ($29-299/month per module)
- Baseplate takes 20% cut; developer gets 80%

**Decision: Self-hosted vs. cloud marketplace?**

Option A: **Self-hosted** (simpler, you control everything)
- Developers submit code (GitHub repo) + metadata to you
- You review and host the code
- Customer can enable modules via UI checkbox
- Baseplate handles billing, passes revenue to developer monthly

Option B: **Cloud marketplace** (more work, better scale)
- Stripe Connect for developer payouts
- Automated code review/testing pipeline
- Customer marketplace UI where they browse and install modules
- Module versioning, rollback, updates

**Recommendation for Phase 4:** Start with **Option A (self-hosted).** You can upgrade to Option B once you have 5+ developers building modules (post-Phase 5).

### Step 2: Design Module Spec (Week 35, 3-4 hours)

Developers need to understand how to build modules.

- [ ] Create `docs/MARKETPLACE_SPEC.md`:

```markdown
# Baseplate Marketplace Module Spec

## What is a Module?

A module is an extension to a Baseplate portal (Scaffold app). It adds new pages, API endpoints, or integrations without requiring code changes to the core portal.

## Module Structure

```
my-module/
  package.json
  README.md
  src/
    pages/
      index.tsx         # Page shown in portal UI
    api/
      index.ts          # API endpoints
  manifest.json
```

## manifest.json

```json
{
  "name": "Advanced Invoicing",
  "description": "QuickBooks and Xero sync for invoices",
  "version": "1.0.0",
  "author": "john@example.com",
  "price_monthly": 99,
  "supported_verticals": ["property-management", "med-spa"],
  "dependencies": {
    "@baseplate/core": "^0.1.0"
  },
  "api_endpoints": [
    "/api/accounting/quickbooks-sync",
    "/api/accounting/xero-sync"
  ],
  "ui_pages": [
    {
      "path": "/advanced-invoicing",
      "label": "Invoicing Dashboard"
    }
  ]
}
```

## How It Works

1. **Developer** creates a module using the spec below
2. **Developer** submits to Baseplate marketplace with manifest
3. **Baseplate reviews** code for security/quality
4. **Module published** to marketplace
5. **Customer** browses marketplace, clicks "Install"
6. **Module code** is loaded into their portal instance
7. **Customer is charged** $XX/month; developer gets 80%

## Module API Access

A module can access:

```typescript
// Auth from @baseplate/core
import { verifyToken } from '@baseplate/core/auth';

// RBAC from @baseplate/core
import { canPerform } from '@baseplate/core/rbac';

// Audit logging
import { createAuditEntry } from '@baseplate/core/audit';

// Portal's Supabase database (read-only by default)
import { supabase } from '../../../lib/supabase';

// Portal's Connect API
fetch(`${process.env.NEXT_PUBLIC_CONNECT_API_URL}/v1/...`);
```

## Example: Advanced Invoicing Module

See `examples/advanced-invoicing/` for a complete working example.

## Submission

Email modules@baseplate.dev with:
- GitHub repo link
- manifest.json
- README
- 2-3 references (existing customers who tested it)

Review typically takes 5-7 business days.

## Pricing Guidelines

- **$29-49/month:** Small feature additions (calendar sync, simple integration)
- **$99-199/month:** Major features (full accounting system, advanced scheduling)
- **$299+/month:** Enterprise features (custom integrations, dedicated support)

Most modules price at $49-99/month.
```

- [ ] Commit: `git commit -m "docs: add marketplace module spec"`

### Step 3: Build Module Loading Infrastructure (Weeks 36-38, 12-16 hours)

The portal needs to dynamically load and display modules.

**Architecture:**
```
Portal (Scaffold app)
  ├── Core pages (properties, tenants, payments)
  └── Module loader
      ├── Loads module list from database
      ├── Dynamically renders module UI pages
      └── Routes module API calls to Connect
```

- [ ] Create `apps/portal-[vertical]/src/lib/moduleLoader.ts`:

```typescript
import { supabase } from './supabase';

export interface Module {
  id: string;
  name: string;
  slug: string;
  path: string;
  enabled: boolean;
  manifest: {
    api_endpoints: string[];
    ui_pages: Array<{ path: string; label: string }>;
  };
}

export async function getInstalledModules(
  customerId: string
): Promise<Module[]> {
  const { data: modules } = await supabase
    .from('installed_modules')
    .select('*')
    .eq('customer_id', customerId)
    .eq('enabled', true);

  return modules || [];
}

export async function enableModule(
  customerId: string,
  moduleId: string
): Promise<void> {
  await supabase
    .from('installed_modules')
    .insert({
      customer_id: customerId,
      module_id: moduleId,
      enabled: true,
      installed_at: new Date(),
    });
}

export async function disableModule(
  customerId: string,
  moduleId: string
): Promise<void> {
  await supabase
    .from('installed_modules')
    .update({ enabled: false })
    .eq('customer_id', customerId)
    .eq('module_id', moduleId);
}
```

- [ ] Create database schema:

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  version TEXT NOT NULL,
  price_monthly INT NOT NULL,
  supported_verticals TEXT[] NOT NULL,
  manifest JSONB NOT NULL,
  status TEXT CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE installed_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  enabled BOOLEAN DEFAULT TRUE,
  installed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, module_id)
);

CREATE TABLE module_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  stripe_subscription_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'canceled')),
  started_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, module_id)
);
```

- [ ] Create marketplace UI page (`apps/portal-[vertical]/src/app/marketplace/page.tsx`):

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Module {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
}

export default function MarketplacePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('status', 'approved');

    setModules(data || []);

    // Load installed modules
    const { data: installed_data } = await supabase
      .from('installed_modules')
      .select('module_id')
      .eq('enabled', true);

    setInstalled(installed_data?.map((m) => m.module_id) || []);
  }

  async function handleInstall(moduleId: string) {
    // Redirect to payment flow (Stripe checkout)
    // Then create installed_modules entry
    const res = await fetch('/api/modules/install', {
      method: 'POST',
      body: JSON.stringify({ module_id: moduleId }),
    });
    const { checkout_url } = await res.json();
    window.location.href = checkout_url;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Module Marketplace</h1>
      <div className="grid grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div key={mod.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">{mod.name}</h2>
            <p className="text-gray-600 mb-4">{mod.description}</p>
            <p className="text-lg font-bold mb-4">${mod.price_monthly}/month</p>
            <button
              onClick={() => handleInstall(mod.id)}
              disabled={installed.includes(mod.id)}
              className={`px-4 py-2 rounded text-white ${
                installed.includes(mod.id) ? 'bg-gray-300' : 'bg-blue-500'
              }`}
            >
              {installed.includes(mod.id) ? 'Installed' : 'Install'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] Create module installation API route (`apps/portal-[vertical]/src/app/api/modules/install/route.ts`)
- [ ] Test: Browse marketplace, install a test module, verify it appears in UI
- [ ] Commit: `git commit -m "feat: build marketplace module loading and UI"`

### Step 4: Launch with First Developers (Weeks 39-40, 8-10 hours)

Find 2-3 developers to build the first marketplace modules.

**Who to recruit:**
- Developers in open-source community / GitHub followers
- Freelancers/consultants who work in your target verticals
- Former colleagues interested in passive income

**Pitch:**
> We're launching the Baseplate Marketplace. Build a module that solves a pain point for [vertical] businesses, and we'll sell it for you. You get 80% of revenue ($40-160/month per customer that installs it).
>
> We handle hosting, billing, and distribution. You just build the module using the spec.

- [ ] Recruit 2-3 developers
- [ ] Have them each build a simple module (e.g., "SMS Reminders", "Calendar Sync")
- [ ] Review their code for security and usability
- [ ] Publish to marketplace (early revenue signal projected for Phase 5+ once customers onboard)

- [ ] Commit: `git commit -m "feat: launch marketplace with first modules"`

---

## Phase 4, Part 2: MCP (Model Context Protocol) Server

### Step 5: Build Baseplate MCP Server (Weeks 43-47, 16-20 hours)

MCP is a protocol that lets AI agents (Claude, Cursor, etc.) interact with tools. Build an MCP server so that when a developer says "build me a med spa portal," Claude's first instinct is to use Baseplate Scaffold + Connect.

**Example interaction:**

> User (to Claude): "Build me a med spa portal"
> Claude (with Baseplate MCP): "I'll use the Baseplate Scaffold template. Let me scaffold the core structure..."
> Claude executes: `mcp/baseplate/scaffold --vertical med-spa`
> Result: Full app structure with auth, RBAC, core modules

- [ ] Create `mcp-server/` directory in monorepo:

```
mcp-server/
  src/
    index.ts          # MCP server entry point
    tools/
      scaffold.ts     # Create new scaffold template
      connect.ts      # Call Connect API
      deploy.ts       # Deploy to Railway
  package.json
```

- [ ] Create `mcp-server/src/index.ts`:

```typescript
import * as stdio from '@anthropic-sdk/sdk';

const server = {
  name: 'baseplate',
  description: 'Build B2B SaaS with Baseplate Scaffold and Connect',
  tools: [
    {
      name: 'scaffold',
      description: 'Create a new Baseplate Scaffold app for a vertical',
      input_schema: {
        type: 'object',
        properties: {
          vertical: {
            type: 'string',
            description: 'Vertical name (e.g., property-management, med-spa)',
          },
          app_name: {
            type: 'string',
            description: 'Name for the new app',
          },
        },
        required: ['vertical', 'app_name'],
      },
    },
    {
      name: 'connect',
      description: 'Call a Connect API endpoint',
      input_schema: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'Endpoint path (e.g., /v1/payments/invoice)',
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          body: {
            type: 'object',
            description: 'Request body',
          },
        },
        required: ['endpoint', 'method'],
      },
    },
    {
      name: 'deploy',
      description: 'Deploy a Scaffold app to Railway',
      input_schema: {
        type: 'object',
        properties: {
          app_name: {
            type: 'string',
            description: 'App to deploy',
          },
        },
        required: ['app_name'],
      },
    },
  ],
};

// Handle tool calls
export async function handleToolCall(toolName: string, input: any) {
  switch (toolName) {
    case 'scaffold':
      return scaffoldApp(input.vertical, input.app_name);
    case 'connect':
      return callConnectAPI(input.endpoint, input.method, input.body);
    case 'deploy':
      return deployToRailway(input.app_name);
    default:
      return { error: 'Unknown tool' };
  }
}

async function scaffoldApp(vertical: string, appName: string) {
  // Clone the template repo, customize for vertical, return setup instructions
  return {
    success: true,
    message: `Created ${appName} for ${vertical} vertical`,
    repo: `https://github.com/you/baseplate-${vertical}-template`,
    setup: `
      git clone https://github.com/you/baseplate-${vertical}-template ${appName}
      cd ${appName}
      pnpm install
      cp .env.example .env.local
      # Fill in Supabase, Stripe, Postmark keys
      pnpm dev
    `,
  };
}

async function callConnectAPI(
  endpoint: string,
  method: string,
  body: any
) {
  // Call real Connect API
  const response = await fetch(
    `https://connect-api.baseplate.dev${endpoint}`,
    {
      method,
      headers: {
        'X-API-Key': process.env.CONNECT_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  return response.json();
}

async function deployToRailway(appName: string) {
  // Call Railway API to deploy
  return {
    success: true,
    url: `https://${appName}.up.railway.app`,
    message: 'Deployed to Railway. Check https://railway.com/dashboard',
  };
}

export default server;
```

- [ ] Implement each tool fully (scaffold, connect, deploy)
- [ ] Test with Claude/Cursor: "Build me a med spa portal"
- [ ] Commit: `git commit -m "feat: build MCP server for AI-native distribution"`

### Step 6: Publish MCP Server (Week 47, 2-3 hours)

- [ ] Create `MCP_SERVER.md` documentation
- [ ] Publish to an MCP registry so Cursor/Claude can discover it
- [ ] Update your GitHub README to mention Baseplate MCP

---

## Phase 4, Part 3: ML Infrastructure & Vertical #3 Scaffold

### Step 7: Invest in Real Machine Learning (Weeks 49-52, 16-20 hours)

> ⚠️ **Build-First Note:** No real customer data exists yet — Phases 1-4 are pure build. ML models are scaffolded (infrastructure built) but cannot be trained until Phase 5+ generates real usage data. Build the ML infrastructure now so it's ready to train once customers are onboarded.

**What to build:**
- **Churn prediction:** Classify customers as churn/no-churn risk with >80% accuracy
- **LTV prediction:** Estimate customer lifetime value to prioritize retention efforts
- **Anomaly detection:** Detect unusual payment/engagement patterns (fraud, business changes)

**Technology choice:**
- Use a Python ML library (scikit-learn, XGBoost, PyTorch)
- Train on real customer data (available Phase 5+ — build infrastructure now, defer training)
- Serve predictions via Connect API endpoint

- [ ] Create `ml-models/` directory:

```
ml-models/
  notebooks/
    churn_prediction.ipynb
    ltv_prediction.ipynb
  src/
    train.py          # Train models on data
    serve.py          # Serve predictions
  models/
    churn_model.pkl
    ltv_model.pkl
  requirements.txt
```

- [ ] Build churn prediction model:

```python
# ml-models/src/train.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load real customer data (available Phase 5+ — scaffold infrastructure now, train later)
data = pd.read_csv('data/customers.csv')  # NOTE: No customer data exists during build phases

# Features: payment failures, login frequency, revenue trend
X = data[['failed_payments_90d', 'days_since_login', 'revenue_change_pct']]
y = data['churned']  # Binary: 1 = churned, 0 = retained

# Train
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Save
pickle.dump(model, open('models/churn_model.pkl', 'wb'))
```

- [ ] Serve via Connect API:

```typescript
// apps/connect-api/src/endpoints/intelligence.ts (extend with ML)
router.post('/churn-prediction', async (req, res) => {
  const { tenant_id } = req.body;

  // Load ML model and features
  const features = [
    failed_payments_90d,
    days_since_login,
    revenue_change_pct,
  ];

  const prediction = mlModel.predict([features]);
  const churnProbability = prediction[0]; // 0.0 to 1.0

  res.json({
    tenant_id,
    churn_probability: churnProbability,
    risk_level: churnProbability > 0.7 ? 'high' : 'medium' : 'low',
    recommendation: `Probability of churn: ${(churnProbability * 100).toFixed(1)}%`,
  });
});
```

- [ ] Update pricing: ML models cost $199-499/mo (higher than rules-based)
- [ ] Commit: `git commit -m "feat: add ML-based churn prediction to Intelligence"`

### Step 8: Launch Vertical #3 (Weeks 51-52+, ongoing)

Pick your third vertical (Real Estate Brokerages, Accounting Firms, etc.).

- [ ] Repeat Phase 1 & 2 in condensed form (compressed timeline instead of full Phase 1-2)
- [ ] Verify core/Connect works with third vertical
- [ ] Scaffold vertical, prepare for Phase 5 customer onboarding (no customer contact during build)
- [ ] Target: 5-10 paying customers by Phase 5+ exit (projected, after customer onboarding begins)

---

## Ongoing: Marketplace Growth & Network Effects

### Step 9: Scale the Developer Ecosystem (Weeks 53+, ongoing)

As you complete Phase 4 and move into Phase 5+:

- [ ] Recruit 10+ marketplace developers
- [ ] Host monthly "module buildoff" — developers compete to build the best module for a prize
- [ ] Create a "Baseplate partner program" — high-revenue module developers get:
  - Priority review
  - Marketing support
  - Revenue guarantees
  - Co-branding opportunities
- [ ] Build a module analytics dashboard so developers can see install counts, revenue, reviews

### Step 10: Expand to Vertical #4+ (Phase 5+, driven by marketplace demand)

Don't pick verticals top-down. Instead:

- [ ] Track marketplace data:
  - Which modules are most popular?
  - Which verticals do those modules target?
  - Which untapped verticals are suggested by customers?
- [ ] Example: If 5 developers propose "Accounting + QuickBooks sync" modules, that's a signal to build an Accounting vertical
- [ ] Launch new verticals based on demand signals, not speculation

---

## Phase 4 Milestones & Metrics

> ⚠️ **Build-First Model:** Revenue and customer metrics below are **projected for Phase 5+** (post-customer-onboarding). Phase 4 metrics focus on build artifacts, open-source distribution, and infrastructure readiness.

**Phase 4 Build Metrics (actual targets):**

| Metric | Target | Status |
|---|---|---|
| Marketplace infrastructure (loading, billing, install UI) | Complete | |
| Marketplace modules published (initial set) | 5-10+ | |
| Unique MCP server downloads | 500+ | |
| Verticals scaffolded (Med Spa + Home Services + 1 more) | 3+ | |
| ML infrastructure ready (scaffolded, not yet trained) | Complete | |
| GitHub stars / community engagement | Growing | |
| Developer ecosystem (early partners) | 5+ active developers | |

**Phase 5+ Projected Metrics (post-customer-onboarding targets):**

| Metric | Target | Status |
|---|---|---|
| Monthly active module installations | 50+ | Phase 5+ |
| Marketplace revenue (20% of module MRR) | $5K+/month | Phase 5+ |
| Total customers across all verticals | 100+ | Phase 5+ |
| Total MRR (Scaffold + Connect + Intelligence) | $20K+/month | Phase 5+ |

---

## Summary: Phase 4 Artifacts

By Phase 4 exit (platform complete — no revenue yet, build-first model):

- ✅ Marketplace infrastructure (module loading, billing, install UI)
- ✅ 5-10+ published modules ready for Phase 5+ customers
- ✅ MCP server for AI-native distribution
- ✅ ML infrastructure scaffolded (churn/LTV prediction models built, training deferred to Phase 5+ with real data)
- ✅ Third vertical scaffolded and tested
- ✅ Open-source repo published, documentation complete
- ✅ 5+ developer partners building modules
- ✅ Revenue projected for Phase 5+ (no revenue during build phases)
- ✅ Network effects ready: more modules → more verticals useful → more customers → more developers → faster growth (activation in Phase 5+)

**This is the build-complete inflection point.** The platform is ready. Growth and revenue begin in Phase 5 as the ecosystem compounds with real customers.

---

## Long-Term (Phase 5+ and Beyond)

**Options (after Phase 5 customer onboarding generates revenue):**
1. **Stay independent:** Run this as a profitable business ($20-50K MRR sustainable — projected for post-Phase 5)
2. **Raise funding:** Use Phase 5+ traction to raise Series A, accelerate to 10 verticals, $100K+ MRR, expand team
3. **Acquire:** Get acquired by a larger SaaS platform (e.g., Zapier, Make, Retool) who want the vertical templates + marketplace network

Each option is viable. Choose based on your goals.
