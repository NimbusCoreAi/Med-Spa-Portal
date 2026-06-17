# Phase 3: Intelligence & Ecosystem Build
## Rules Engine + Marketplace + MCP Server + ML Scaffolding + Second Vertical

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Status:** Builds on Phase 2 completion (Connect API built, modules generalized)
**Goal:** Build intelligence layer, marketplace framework, MCP server, ML scaffolding, and home services portal

> **Note:** Pure build phase — no customer contact. AI-accelerated timelines.

⚠️ **MODULE LIBRARY MANDATE (Phase 3):**
- Build `packages/intelligence/rules-engine` module (rules-based risk flagging)
- Build `apps/portal-homeservices/` using SAME `packages/` modules from Phase 1-2
- Build marketplace framework + MCP server
- Build ML model scaffolding (models trained in Phase 5 with real data)
- **Success Metric:** Zero rewrite needed for 2nd vertical (proves modules are reusable)
- See `MODULES_LIBRARY.md` for what's reusable across verticals

---

## INHERITANCE FROM PHASE 2

**What Phase 2 delivered:**
- ✅ Connect API endpoints built (SMS reminder, package-deduct, treatment-metrics)
- ✅ All modules generalized (vertical-agnostic, zero med spa specifics)
- ✅ Repo prepared for open-source launch
- ✅ Complete module library ready for any vertical

**Data the Intelligence Layer Will Consume (Built Now, Trained in Phase 5):**
- SMS reminder success rates → will validate whether reminders reduce no-shows
- Package deduction accuracy → will confirm packages are tracked correctly
- Revenue patterns → will surface which treatments/providers are profitable
- Patient behavior → will flag who re-books vs. who churns
- Clinic operational metrics → will identify busy times, providers, seasonal trends

> **Note:** No real customer data exists yet. Intelligence features are BUILT with synthetic/test data and will be trained on real pilot data in Phase 5.

**What Phase 3 builds from this:** Intelligence layer + second vertical.

---

## THE INTELLIGENCE API (Layer 3)

### Objective
Build data-driven features that clinics will pay extra for. Start simple (rules-based), add ML later.

### The Intelligence Layer: What It Does

**Problem:** Clinic owners have data (payment history, appointment data, patient behavior) but can't act on it.

**Solution:** Intelligence API gives them insights + automation.

### What You're Building: Rules-Based Risk Flagging

**Start with RULES (not ML)** because you don't have enough data for ML yet.

**Rules-Based Intelligence Flags:**

```
POST /v1/intelligence/risk-score

Returns:
{
  "patientId": "abc-123",
  "flags": [
    {
      "type": "no_show_risk",
      "severity": "high",
      "reason": "2 no-shows in last 90 days",
      "action": "Send reminder SMS 72h before next appointment"
    },
    {
      "type": "churn_risk",
      "severity": "medium",
      "reason": "No appointment booked in 60 days (normally books every 28 days)",
      "action": "Send re-engagement email with special offer"
    },
    {
      "type": "revenue_risk",
      "severity": "low",
      "reason": "Treatment revenue down 15% from 3-month average",
      "action": "Consider promotion or package offer"
    }
  ]
}
```

**Rules You Can Build (Validated with Synthetic Data, Refined with Real Data in Phase 5):**

| Risk Type | Rule | Data Source | Action |
|---|---|---|---|
| **No-Show Risk** | 2+ no-shows in 90 days | Appointment history | Send SMS reminder 72h before |
| **Churn Risk** | No appointment in 60 days (usually books every 28d) | Booking frequency | Send win-back email |
| **Revenue Drop** | Monthly revenue down >15% YoY | Payment data | Recommend promotion |
| **Package Abandonment** | Package expires unused | Package data | Send "complete your package" reminder |
| **Clinician Burnout** | >30 appointments/week, declining satisfaction | Appointment volume | Recommend hiring |
| **Patient Satisfaction** | No follow-up care within 2 weeks (historical norm) | Charting data | Auto-send care instructions |

**Why Rules, Not ML Yet?**
- No real customer data exists yet — models will be trained on pilot data in Phase 5
- ML needs 50+ clinics × 6 months = minimum 2,500 data points per signal
- Rules are explainable ("You have 2 no-shows in 90 days") vs. magic ("Model says 67% churn probability")
- Rules ship fast; ML takes months of real data accumulation

### Projected Pricing & Revenue (Activated in Phase 5+)

**Intelligence as Add-On (Projected Model):**
- Target: Future Connect customers ($49/mo base)
- New tier: **Intelligence** = $99-199/mo add-on
- Per-clinic pricing (not per-API-call)
- Expected: 30-50% of Connect customers add Intelligence

**Projected Revenue Impact (Phase 5+):**
- 10 Connect customers × 50% Intelligence adoption = 5 Intelligence customers
- 5 clinics × $99/mo = **$495/mo** (profitable standalone)
- Add to projected $500 Connect MRR = **$995/mo** once pilots are live

> **Note:** No revenue during build phases. This pricing model is designed now and will be activated when pilots onboard in Phase 5.

### Success Metric (End of Intelligence Build)
- ✅ Intelligence API live + documented
- ✅ Rules-based flags implemented and tested with synthetic data
- ✅ Intelligence pricing page built (not live until Phase 5)
- ✅ Ready for second vertical build

---

## SECOND VERTICAL BUILD

### Objective
Prove that `baseplate-core` + Connect API work across DIFFERENT verticals (not just med spas).

### Strategy: Home Services (HVAC/Plumbing/Cleaning)

**Why Home Services?** (From Phase 0 research)
- Tier 1 vertical (same caliber as Med Spas)
- Different pain points (job costing, QB sync, dispatch) → tests if core is truly vertical-agnostic
- Quick to launch (core already exists; only build vertical-specific features)

**Why NOT another med spa vertical?**
- Proves nothing (same vertical, different clinic)
- Doesn't test if core is reusable
- Phase 4 requires proving reusability across different business types

### What Phase 3 Does for Second Vertical

**Audit baseplate-core:**
- What's vertical-agnostic? (Auth, RBAC, Audit Logs, Payments, Notifications) ✅ ALL of it
- What's med-spa-specific? (Intake forms, Treatment charting, Face mapping) ✅ Just these

**Plan: Repeat Phase 1-2 (Compressed)**
- Build `portal-homeservices` on existing `packages/core`
  - Different portal features (job costing, dispatch, invoice management)
  - **Same** Auth, RBAC, Audit Logs, Payments
  - Proves core reusability
   
- Finish build + prepare for Phase 5 onboarding
  - Home service portal fully built and tested
  - New Connect endpoints scaffolded (job costing, dispatch scheduling)
  - Proves Connect is expandable for new verticals
  - **Customer onboarding deferred to Phase 5+** (build-first model)

### Timeline Compression
```
Med Spa (Phase 1-2): Build complete
├── Phase 1: Auth + Portal features
├── Phase 2: Connect APIs + Module generalization

Home Services (Phase 3): Build on existing core
├── Build portal on existing core (faster — core modules already exist)
├── Build vertical-specific features (job costing, dispatch)
└── Prepare for Phase 5 onboarding (no pilots during build)
```

**Why Faster?**
- Core already built
- Connect already works
- You know the process
- Just building vertical-specific UI + features

---

## GATE TO PHASE 4

**Threshold:** Second vertical portal built and `baseplate-core` proven reusable (no customer onboarding — that happens in Phase 5)

**Actual Criteria:**
- ✅ Home services portal fully built + tested (not yet onboarded)
- ✅ `baseplate-core` proved reusable (no rewrites needed)
- ✅ Intelligence layer built and tested with synthetic data (trained on real data in Phase 5)
- ✅ Connect endpoints scaffolded for second vertical
- ✅ Zero rewrite needed for 2nd vertical (modules are truly vertical-agnostic)

**If Missed:**
- `baseplate-core` isn't actually vertical-agnostic (refactor before continuing)
- Reconsider marketplace/Phase 4 strategy
- Pick third vertical based on core/Connect learnings

**If Passed:**
- Prove we can scale to 3, 4, 5 verticals with same core
- Marketplace becomes viable (lots of developers for different verticals)
- Intelligence layer gets richer data (patterns emerge across verticals)
- Ready for Phase 4

---

## ALIGNMENT TO PHASE 0 RESEARCH

**Pain Points Being Solved (Phase 3):**

| Phase 0 Pain Point | Phase 2 Solution | Phase 3 Enhancement |
|---|---|---|
| No-show prevention (HIGH) | SMS reminder API | Risk-score API predicts high-risk patients |
| Package management (MEDIUM) | Package deduction API | Risk flag alerts when package expires |
| Reporting gaps (MEDIUM) | Treatment metrics API | Intelligence shows revenue per provider + churn prediction |
| Inventory waste (HIGH) | [Will build in Phase 3] | Risk flag alerts when products expire |
| QB integration gap (HIGH) | [Phase 2 waiting] | [Home services Phase 3 solves job costing] |

**Med Spa + Home Services Data Together:**
- Pattern: "High no-show clinics need SMS reminders" + "Plumbers with high job cancellations need SMS confirmations"
- Insight: SMS reduces cancellations across BOTH verticals
- Revenue: Sell Intelligence add-on confidently because pattern is proven

---

## ARCHITECTURE: SUPPORTING 2 VERTICALS

**Monorepo After Phase 3:**
```
Med Spa App/
  apps/
    portal-medspa/          # Phase 1-2 (mature, proven)
    portal-homeservices/    # Phase 3 (new, validates core)
    connect-api/            # Shared, used by both
  packages/
    core/                   # Auth, RBAC, Audit Logs, etc.
    ui/                     # Shared components
    intelligence/           # NEW: Risk-scoring rules engine
```

**Key Insight:** 
- Both portals import `packages/core` + `packages/ui`
- Both use `apps/connect-api` for integrations
- Each has vertical-specific features in their own `/pages` directory
- This architecture is the foundation for Phase 4 marketplace

---

## PROJECTED UNIT ECONOMICS (Phase 5+ Targets)

> **Note:** No revenue during Phase 3 (pure build phase). These are projected targets that will be validated once pilots onboard in Phase 5.

**Projected Revenue (Phase 5+):**
- Med Spa Connect customers: 10-15 × $49-99/mo = $490-1,485/mo
- Med Spa Intelligence customers: 3-5 × $99-199/mo = $297-995/mo
- Home Services (starting in Phase 5): 2-3 × $49-99/mo = $98-297/mo
- **Total projected: $885-2,777/mo**

**Projected Gross Margin:**
- Connect: >80% (API calls cost pennies; price $49/mo)
- Intelligence: >95% (rules are computed in-memory; minimal cost)
- **Blended: >85%**

**What This Means (When Activated in Phase 5):**
- Profitable business (can hire 1-2 people)
- Can invest in Phase 4 marketplace + ML training

---

## RESOURCES

**Related Documentation:**
- `Phase 0 - Vertical Validation.md` — Med Spas + other verticals researched
- `Comprehensive Med Spa Market Research.md` — Why Home Services is good second choice
- `Phase 1 - The Wedge & First Build.md` — What you're repeating for Home Services
- `Phase 2 - Platform Layer/Phase 2 - Platform Layer.md` — Connect architecture you'll extend

