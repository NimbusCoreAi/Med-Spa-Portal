# Phase 5: Customer Onboarding
## Pilot Recruitment + Production Deploy + Feedback + Revenue

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Status:** First customer-facing phase — begins after Phases 1-4 (build) are complete
**Goal:** Deploy to production with real clinics, recruit pilots, collect feedback, generate revenue, train ML models

> **Key Advantage:** By Phase 5, the product is complete, tested, and polished. Pilots get a
> finished platform — not a work-in-progress. This maximizes first impressions and minimizes
> bridge-burning risk.

---

## INHERITANCE FROM PHASE 4

**What Phase 4 delivered:**
- ✅ Complete platform published to GitHub (open-source)
- ✅ MCP server published for AI agent distribution
- ✅ Marketing materials prepared
- ✅ Documentation complete
- ✅ Marketplace framework live
- ✅ All 12 pain points solved in code across 2 verticals
- ✅ Connect API + Intelligence + ML scaffolding all built

**What Phase 5 adds:** Real customers, real data, real revenue.

---

## PHASE 5 OBJECTIVES

### 1. Recruit Pilot Clinics
- Cold outreach using `COLD_OUTREACH_PLAYBOOK.md` (6 channels)
- Target: 3+ committed pilot clinics from the 50+ leads in `PILOT_LEADS_AND_TEMPLATES.md`
- Offer: Free through Month 6, 20-min feedback call every 2 weeks

### 2. Production Deploy
- Deploy to production Vercel + Supabase (not staging)
- Configure real Stripe/Postmark/Twilio accounts
- Onboard clinics with the finished product
- Verify all integrations work with real patient data

### 3. Onboarding Sequence (Per Clinic)
- 4-touch onboarding: Call 1 (overview), Call 2 (data setup), Call 3 (patient flow), Check-in (Week 2)
- Staff training
- Baseline metrics recording

### 4. Feedback Collection & Iteration
- Bi-weekly feedback calls per pilot
- Structured feedback log (pain points, feature requests, bugs)
- Iterate on real-world usage data
- Triage: low-effort fixes immediately, medium features evaluate, hard features log

### 5. Train ML Models
- With real usage data flowing, train the ML models scaffolded in Phase 3
- Churn prediction, LTV, demand forecasting
- Models now have sufficient data (50+ clinics recommended for best results)

### 6. Convert to Revenue
- Convert pilots to paying Connect customers ($49-99/mo)
- Upsell Intelligence add-on ($99-199/mo)
- Run second outreach round with real references
- Launch pricing tiers

---

## PHASE 5 GATE CRITERIA

### Phase 5 → Phase 6+ (Expansion)

All of the following must be true:
- [ ] **3+ pilots onboarded** with the finished product
- [ ] **2+ pilots using weekly** without hand-holding
- [ ] **No critical bugs** blocking daily usage
- [ ] **Intake completion rate >80%** (patients filling intakes before appointments)
- [ ] **Payment webhook success ~100%**
- [ ] **$500+ MRR** (Connect subscriptions from converted pilots)
- [ ] **ML models trained** on real usage data
- [ ] **Clear list of next features** from real feedback

**If gate missed:** Iterate on customer feedback — the product needs refinement based on real usage. Do not force scaling.

---

## REVENUE PROJECTION (Phase 5)

| Source | Revenue |
|--------|---------|
| 3 pilot conversions ($49-99/mo) | $147-297/mo |
| Second outreach round (5-7 new customers) | $245-693/mo |
| Intelligence add-on (30% adoption) | $99-199/mo |
| **Total projected** | **$491-1,189/mo** |

---

## DOCUMENTATION

- **`../../PHASE_5_ONBOARDING_GUIDE.md`** — Manual steps for pilot recruitment, onboarding, feedback
- **`../../COLD_OUTREACH_PLAYBOOK.md`** — 6-channel cold outreach templates
- **`../../PILOT_LEADS_AND_TEMPLATES.md`** — 50+ verified leads + outreach templates
