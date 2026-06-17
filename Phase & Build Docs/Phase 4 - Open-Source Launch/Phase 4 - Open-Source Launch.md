# Phase 4: Open-Source Launch
## Publish Repo + Marketing + Documentation + MCP Server Publishing

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Status:** Builds on Phase 3 completion (all features built and tested)
**Goal:** Publish the complete platform to GitHub, write marketing materials, complete documentation, publish MCP server

> **Note:** This is the final build phase before customer onboarding (Phase 5). No customer contact.

⚠️ **MODULE LIBRARY MANDATE (Phase 4):**
- **All modules from Phase 1-3** are now distributed as SDKs: `@baseplate/core`, `@baseplate/integrations`, `@baseplate/ui`, `@baseplate/patterns`, `@baseplate/intelligence`
- **MCP Server:** Modules available to Claude/Cursor agents for automatic use
- **Marketplace:** 3rd parties can build modules ON TOP OF Baseplate modules (not replacing them)
- **AI Agents:** When developer says "build clinic portal," Claude automatically pulls Baseplate modules
- See `MODULES_LIBRARY.md` for SDK distribution strategy

---

## INHERITANCE FROM PHASE 3

**What Phase 3 delivered:**
- ✅ Rules engine built (risk flagging across verticals)
- ✅ Marketplace framework built
- ✅ MCP server built
- ✅ ML model scaffolding ready (training deferred to Phase 5 with real data)
- ✅ Home services portal built using same core modules (proves vertical-agnostic)

**Platform State at Phase 4 Entry (No Customer Data Yet):**
- Platform complete and tested across 2 business types (Med Spa + Home Services)
- Clear patterns identified from the build: What connects verticals? What's different?
- Proven that baseplate-core works without rewrites (validated through internal testing, not customer usage)
- Ready to scale (more verticals, marketplace modules) once customer onboarding begins in Phase 5
- ⚠️ No real customer usage data exists yet — ML model training is deferred to Phase 5+ when real data becomes available

---

## PHASE 4 STRATEGY: THREE PARALLEL WORKSTREAMS

### Workstream 1: The Marketplace

**Problem:** You can't possibly build every feature every vertical needs. Developers can.

**Solution:** Marketplace where 3rd-party developers build + sell modules.

**Examples of Marketplace Modules:**

**For Med Spas:**
- "HIPAA Photo Management Pack" ($15/mo add-on)
- "Injectable Tracking + Mapping" ($25/mo add-on)
- "Patient Education Library" ($10/mo add-on)
- "Insurance Verification Integration" ($30/mo add-on)

**For Home Services:**
- "Job Costing & Equipment Tracking" ($25/mo add-on)
- "Subcontractor Management" ($30/mo add-on)
- "Permit/License Tracking" ($15/mo add-on)
- "Before/After Photo Management" ($20/mo add-on)

**For Future Verticals:**
- "Advanced Invoicing" (every vertical)
- "Compliance Pack" (medical/legal verticals)
- "AI-Powered Churn Prediction" (all verticals)

**How It Works:**
```
Developer builds → Submits to Marketplace → Baseplate reviews → Listed
Clinic shops → Clicks "Install" → Integrates with portal → Developer gets 80%, Baseplate 20%
```

**Revenue Model:**
- Baseplate takes **20% of every module sale**
- Example: Marketplace module sells 50 units @ $20/mo = $1K/mo revenue
  - Developer keeps: $800/mo
  - Baseplate gets: $200/mo
- Target: 20-30 marketplace modules (Phase 5+ ecosystem target, once customers drive demand)
  - Conservative: 10 modules × $500/mo avg = $5K/mo Baseplate revenue
  - Ambitious: 30 modules × $500/mo avg = $15K/mo Baseplate revenue

### Workstream 2: AI-Native Distribution

**Problem:** When developers use Cursor/Claude to build SaaS, they're told "use v0" or "use Lovable" — nobody says "use Baseplate."

**Solution:** Make Baseplate the default choice for B2B verticals.

**MCP Server (Model Context Protocol):**
- Developers can prompt Claude: "Build me a HIPAA clinic portal"
- Claude's first instinct: Look up Baseplate → Scaffold template exists → Use it
- Developer saves 2-3 weeks vs. building from scratch
- Developer uses Connect APIs → Baseplate gets recurring revenue

**Approach:**
```
Developer: "Build a HIPAA-compliant med spa portal"
Claude (with Baseplate MCP server): 
  "Found baseplate-medspa-portal template (5K stars, proven in production).
   Using that + Connect APIs for payments/SMS.
   Setting up Supabase, deploying to Vercel."
[Saves developer 2-3 weeks]
```

**How to Build:**
1. Document Baseplate Connect API as MCP server
   - Endpoints: `/v1/payments`, `/v1/communications`, `/v1/reporting`, `/v1/intelligence`
   - SDK: TypeScript/Python for easy integration
   
2. Publish to MCP registry (shared with Claude, Cursor, etc.)

3. Promote to AI developer community
   - Reddit r/webdev, r/SaaS
   - HN: "Show HN: Baseplate MCP Server"
   - AI agent communities

**Revenue Outcome:**
- Every developer using Baseplate Scaffold wants Connect APIs
- Higher conversion to paid (developers already familiar)
- Distribution becomes "free" (AI agents do the marketing)

### Workstream 3: Advanced Intelligence Layer

**Problem:** Rules-based Intelligence works, but ML is where real money is.

**Solution:** ML models were scaffolded in Phase 3 (infrastructure built, pipelines ready). They are NOT yet trained on real data — no customers exist during build phases. Training requires the customer usage data that Phase 5 onboarding will generate. In Phase 4, finalize the ML infrastructure so it's ready to train once real data flows in Phase 5+.

**ML Models to Build (Scaffolded in Phase 3, Train in Phase 5+):**

**1. Churn Prediction (High ROI)**
- Input: Patient booking history, treatment history, revenue, engagement
- Output: "Patient X has 73% likelihood of churning in 30 days"
- Action: Clinic gets alert → sends re-engagement offer
- Pricing: $200-500/mo for top-tier clinics
- Revenue impact for clinic: "Retain 20% of at-risk patients = $5-10K/month savings"

**2. Lifetime Value Prediction (High ROI)**
- Input: Patient demographics, treatment preferences, booking patterns
- Output: "This patient is worth $8K LTV; recommend premium treatment plan"
- Action: Clinic can personalize pricing + upsells
- Pricing: $200-500/mo for top-tier clinics

**3. Demand Forecasting**
- Input: Historical bookings, seasonality, treatment popularity
- Output: "Book 30% more Botox appointments in Q2 (wedding season)"
- Action: Clinic can staff accordingly
- Pricing: $150-300/mo for clinics with 3+ years data

**4. Price Optimization**
- Input: Treatment costs, patient willingness-to-pay, local competition
- Output: "Optimal price for Botox is $450 (up from $400)"
- Action: Clinic increases revenue per appointment by 10%+
- Pricing: $300-500/mo for serious clinics

**Execution Timeline:**
- Phase 4: Finalize churn prediction infrastructure (easiest, proven ROI) — model scaffolding complete, training deferred to Phase 5
- Phase 5+: Train churn model on real customer data once pilots are onboarded
- Post-Phase 5: Build LTV + demand forecasting once sufficient data accumulates
- Later phases: Build price optimization as data depth grows; launch new ML models based on marketplace demand

**Success Metric (Phase 5+ Targets — No Revenue During Build):**
- 50-100+ Connect customers (Phase 5+ target — data requirement for ML training)
- 20%+ of customers buy Intelligence (Rules) — projected for post-Phase 5 onboarding
- 10%+ of customers buy Intelligence (ML) — projected once ML models are trained on real data
- $2-5K MRR from Intelligence — projected for post-Phase 5, after customer onboarding generates real usage data

---

## THIRD VERTICAL + BEYOND

**When, Not Whether:**
- Phase 3: 2 verticals prove core is reusable
- Phase 4: Marketplace signals show which verticals developers want
- Add verticals based on **demand signals**, not top-down strategy

**Signals to Watch:**
- Marketplace module requests ("We need a tattoo studio booking portal")
- Scaffold downloads + GitHub stars (contractors repo getting stars? Build it)
- MCP usage (Claude agents asking for contractor portal? Build it)
- Customer requests ("Can we use Baseplate for our law firm client portal?")

**Candidates (from Phase 0 research):**
1. Home Services (Phase 3 already doing this)
2. Tattoo/Piercing Studios (Phase 0: LOW priority, but low competition)
3. Real Estate Brokerages (Phase 0: MEDIUM priority)
4. Accounting/Bookkeeping Firms (Phase 0: HIGH priority, long sales cycles)

**Process for Each New Vertical:**
- Scaffold the vertical (build-only, no customer contact)
- Build on existing `packages/core`
- Connect to existing Connect API
- Takes 2-3 months (much faster than Med Spas)
- Goal: prove reusability of core modules, vertical scaffold ready for Phase 5 customer onboarding

---

## BUSINESS MODEL AT PHASE 4 MATURITY

> ⚠️ **Build-First Model Note:** The revenue projections below assume paying customers exist. In the current model, Phases 1-4 are PURE BUILD — no customers, no revenue. These figures represent **projected revenue for post-Phase 5**, after customer onboarding begins and real usage data accumulates. Phase 4 delivers the platform readiness that makes these projections achievable.

**Projected MRR at Phase 5+ Maturity (Post-Customer-Onboarding):**

| Revenue Stream | Estimated MRR | Margin | Notes |
|---|---|---|---|
| **Connect APIs** (3-4 verticals × 10+ customers each) | $2-4K | >80% | Recurring, main business — projected for Phase 5+ |
| **Intelligence (Rules)** (30% Connect adoption) | $1-2K | >95% | Add-on, proven ROI — projected for Phase 5+ |
| **Intelligence (ML)** (5-10% Connect adoption) | $500-1.5K | >95% | High-ticket, requires trained models (Phase 5+ data) |
| **Marketplace Modules** (20-30 modules) | $3-8K | 20% take rate | 3rd-party revenue — projected for Phase 5+ |
| **Managed Hosting** (optional, deferred — see note below) | $0-1K | >70% | Only if demand from self-hosters justifies it |
| **Total Projected MRR** | **$7-16.5K** (or $6.5-15.5K without Managed Hosting) | **~75% blended** | All projected for post-Phase 5 customer onboarding |

> **Note on Managed Hosting:** The Business Plan (Section 4) explicitly defers Managed Hosting as a revenue stream — it should only be built after the Phase 4 open-source launch generates a queue of self-hosters who'd pay to skip deployment/maintenance. The numbers above include it as aspirational; exclude it from planning until there's validated demand (Phase 5+).

**What This Enables (Phase 5+, Once Revenue Flows):**
- Hire 2-4 developers (can't build everything yourself anymore)
- Marketing person to manage MCP/marketplace
- Customer success (help clinics get ROI)
- **Company runs itself** (not all hands-on-deck)

**What Happens Next:**
- Phase 5: Customer Onboarding
  - Deploy to production with real clinics
  - Recruit pilot clinics via cold outreach
  - Onboard 3+ pilots, collect feedback
  - Train ML models on real usage data
  - Convert pilots to paying customers
- Phase 6+: Expansion
  - Scale marketplace (hire marketplace manager)
  - Build premium consulting (help clinics implement)
  - Explore enterprise deals (multi-vertical large clinic chains)
  - Possible: Raise funding to accelerate

---

## RISK MITIGATIONS

**Risk: Marketplace modules are low-quality**
- Mitigation: Baseplate reviews all modules before listing; 20% cut gives leverage to enforce quality

**Risk: Developers don't adopt MCP server**
- Mitigation: Start with high-adoption use case (med spa portal); prove value with 100+ downloads

**Risk: ML models don't work**
- Mitigation: Start with churn prediction (easy, high-ROI); if it works, build others

**Risk: Third vertical doesn't validate**
- Mitigation: You've already proved core works on 2 verticals; try 3rd with low commitment

**Risk: Marketplace cannibalizes Baseplate features**
- Mitigation: Don't build features Baseplate does—marketplace builds add-ons only

---

## ALIGNMENT TO PHASE 0 RESEARCH

**How Phase 4 Solves Remaining Pain Points:**

| Phase 0 Pain Point | Phase 2 Solution | Phase 3 Solution | Phase 4 Solution |
|---|---|---|---|
| Inventory waste (HIGH) | [Waiting] | Auto-deduct when charted | Marketplace module "Advanced Inventory" |
| QB integration (HIGH) | [Waiting] | Home services version ships | Marketplace module "QB Sync" |
| Charting for injectables (HIGH) | [Waiting] | Marketplace module "Injectable Charting" | | 
| Multi-location reporting (MEDIUM) | Simple dashboard | Enhanced with Intelligence | Marketplace "Multi-Location Analytics" |
| Compliance automation (MEDIUM) | Rules-based flags | [Waiting] | Marketplace "HIPAA Compliance Pack" |

**By Phase 4 Exit (Platform Complete — Build-First Model):**
- All 12 Phase 0 pain points have solutions (Baseplate or marketplace)
- Multiple verticals scaffolded and tested
- Revenue stream designed and ready (diversified across products + marketplace) — activation projected for Phase 5+
- Ready to onboard customers in Phase 5

---

## LONG-TERM VISION (Phase 4+)

**Year 1 (Phase 1-4):** Build complete platform, 2 verticals scaffolded, open-source launch — no revenue (build-first model)

**Year 2 (Phase 5+):** Scale — after customer onboarding begins
- 4-5 verticals live
- 30-50+ marketplace modules
- Marketplace revenue equals product revenue
- $10-30K MRR

**Year 3+:** Ecosystem
- 10+ verticals (many community-driven)
- 100+ marketplace modules
- ML Intelligence mature + proven
- $50K+ MRR

**Endgame:** 
- "Every AI-powered B2B SaaS built on Baseplate"
- Baseplate handles integration plumbing (Connect)
- Developers handle domain expertise (marketplace modules)
- Baseplate stays boring, profitable, essential

---

## RESOURCES

**Related Documentation:**
- `Phase 0 - Vertical Validation.md` — Why these verticals + what to look for
- `Phase 1 - The Wedge & First Build.md` — Template you're distributing
- `Phase 2 - Platform Layer/Phase 2 - Platform Layer.md` — Connect architecture you're scaling
- `Phase 3 - Intel & Ecosystem/Phase 3 - Intel & Ecosystem.md` — Data layer feeding Phase 4 ML

