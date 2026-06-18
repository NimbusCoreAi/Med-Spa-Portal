> **⚠️ STATUS NOTE:** This doc is stale. For current project status, see [`../MASTER_PROGRESS.md`](../MASTER_PROGRESS.md)
>
> **🔧 MAINTENANCE:** After completing any phase milestone, sub-phase, audit, or significant commit, update [`../MASTER_PROGRESS.md`](../MASTER_PROGRESS.md): (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is the single source of truth — do NOT update status in this file or other planning docs.

# Baseplate OS: Master Index & Navigation

**Project:** Baseplate OS — Infrastructure for AI-Built B2B Software  
**True Goal:** Build reusable **module library for AI agents** (not just a med spa app)  
**Vertical:** Med Spas / Wellness Clinics (first vertical to validate + build modules)  
**Status:** Phase 0 Complete ✅ → Phase 1 In Progress (1A-1C complete, 1D next) 🚀  
**Last Updated:** June 2026

---

## ⚠️ CRITICAL: Module Library Mandate

**Everything you build goes in ONE of two places:**
- **`apps/portal-medspa/`** — Med spa specific code
- **`packages/`** — Reusable modules (Auth, Payments, Emails, Logging, UI)

**By end of Phase 1:** You should have **30+ reusable modules** ready for:
- Phase 2: Connect API + generalization
- Phase 3: Reuse for 2nd vertical (no rewrites)
- Phase 4: Distribute as SDK for AI agents
- Phase 5: Customer onboarding with finished product

**See:** `MODULES_LIBRARY.md` for complete inventory + build schedule

---

## Quick Navigation

### "I want to understand the big picture"
1. Start: `PHASES_INTEGRATED.md` (this folder)
2. Then: `Business Plan & Roadmap.md` (this folder)
3. Summary: 12 pain points flow through all 4 phases

### "I want to understand Phase 0 (Validation)"
1. Start: `Phase 0 - Vertical Validation/README.md`
2. Deep dive: `Phase 0 - Vertical Validation/Phase 0 - Vertical Validation.md`
3. Research: `Phase 0 - Vertical Validation/Comprehensive Med Spa Market Research.md`

### "I want to understand Phase 1 (Building the Portal)"
1. Start: `Phase 1 - The Wedge & First Build/Phase 1 - The Wedge & First Build.md`
2. Quick reference: `Phase 1 - The Wedge & First Build/Phase 1 - Quick Start Guide.md`
3. Implementation details: `Phase 1 - The Wedge & First Build/Phase 1 - Scaffold Specification.md`

### "I'm an AI agent building Phase 1" ⭐
1. Read: `PHASE_1_BUILD_GUIDE.md` (Phases 1A & 1B, Weeks 1-3)
2. Then: `PHASE_1_BUILD_GUIDE_PART2.md` (Phases 1C & 1D, Weeks 4-8)
3. Reference: `MODULES_LIBRARY.md` (understand which modules to extract)
4. Check: `DEVELOPER_CHECKLIST.md` (verify module extraction before committing)

### "I want to understand Phase 2 (Open-Source & Revenue)"
1. Start: `Phase 2 - Platform Layer/Phase 2 - Open-Source & Middleware.md`

### "I want to understand Phase 3 (Intelligence & 2nd Vertical)"
1. Start: `Phase 3 - Intel & Ecosystem/Phase 3 - Intelligence & Expansion.md`

### "I want to understand Phase 4 (Marketplace & Scale)"
1. Start: `Phase 4 - Open-Source Launch/Phase 4 - The Ecosystem.md`

### "I want to understand ONE specific pain point"
1. Go to: `PHASES_INTEGRATED.md` → find your pain point
2. See: How it's addressed across Phases 1-4

### "I want to know what to do this week"
1. Phase 1 Week 1 checklist: `Phase 1 - The Wedge & First Build/Phase 1 - Quick Start Guide.md`
2. Database schema: `Phase 1 - The Wedge & First Build/Phase 1 - Scaffold Specification.md` (Section 2)

### "I want to understand the Module Library (AI agent SDK)"
1. Read: `MODULES_LIBRARY.md` (this folder)
2. Understand: How to extract reusable modules as you build
3. Know: What goes in `packages/` vs `apps/`
4. Track: Which modules are reusable across verticals

### "I'm an AI agent — which skills do I use?" ⭐
1. **Before any task:** Read `../CLAUDE.md` (root) — Token Optimization Protocol + task routing
2. **Full routing tables:** Read `../Skills/SKILL_ROUTING_GUIDE.md` — every task → skill mapping
3. **Token strategies:** Read `../Skills/Token Optimization/Token Saving.md` — 16 sections of strategies
4. **Token MCP tools:** `token_estimate`, `session_report`, `audit_context_files`, `compress_log_output`, `convert_to_markdown`
5. **Key rule:** Run `audit_context_files` before starting; `session-handoff` at ~120K tokens; never switch models mid-session

### "I'm lost and don't know where to start"
1. Read this document (you are here)
2. Read: `Phase 0 - Vertical Validation/README.md` (30 min)
3. Read: `Phase 1 - The Wedge & First Build/Phase 1 - The Wedge & First Build.md` (20 min)
4. Read: `MODULES_LIBRARY.md` (15 min) — understand what you're building
5. **Now you understand the whole plan**

---

## Document Map: All Files

### Root Folder (`Advance Plan & Build/`)
- **`MASTER_INDEX.md`** ← You are here
- **`MODULES_LIBRARY.md`** — Module library inventory + build schedule (AI agent SDK)
- **`DEVELOPER_CHECKLIST.md`** ⭐ FOR DEVELOPERS — Use during Phase 1 to ensure module extraction
- **`PHASES_INTEGRATED.md`** — How all phases connect (12 pain points + modules flow through phases)
- **`PHASE_0_COMPLETE.md`** — Phase 0 completion summary
- **`Business Plan & Roadmap.md`** — Overall strategy, 3-layer product, business model

### Phase 0: Vertical Validation
- **`Phase 0 - Vertical Validation/README.md`** ⭐ START HERE
  - Navigation guide for all Phase 0 docs
  - Key numbers (market size, growth, WTP)
  - Reading order
  
- **`Phase 0 - Vertical Validation/Phase 0 - Vertical Validation.md`**
  - Gate status (PASSED ✅)
  - 12 pain points + Scaffold module mapping
  - Vendor analysis (Mindbody, Vagaro, Zenoti)
  
- **`Phase 0 - Vertical Validation/Comprehensive Med Spa Market Research.md`**
  - All 12 pain points detailed (with sources)
  - Vendor-specific weaknesses
  - 43+ research sources linked
  
- **`Phase 0 - Vertical Validation/Process.md`**
  - How Phase 0 was executed
  - Validation results
  - Gates cleared

### Phase 1: Complete Med Spa Portal
- **`Phase 1 - The Wedge & First Build/Phase 1 - The Wedge & First Build.md`**
  - Complete build roadmap (pure build, no customer contact)
  - Core features + module gaps + architecture fixes + staging deploy
  
- **`Phase 1 - The Wedge & First Build/Phase 1 - Quick Start Guide.md`** ⭐ FOR DEVELOPERS
  - 5-minute reference
  - Stack summary
  - Database tables
  - Implementation patterns
  
- **`Phase 1 - The Wedge & First Build/Phase 1 - Scaffold Specification.md`** ⭐ FOR IMPLEMENTATION
  - Detailed feature specs (every page, every flow)
  - Database schema with SQL
  - Implementation checklist
  - Definition of done
  - Success metrics

### Phase 1: AI-Ready Build Guides
- **`PHASE_1_BUILD_GUIDE.md`** ⭐ FOR AI AGENTS (Part 1)
  - Phase 1A: Foundation setup, database, core modules
  - Phase 1B: Auth + RBAC + audit logs + encryption modules
  - Skill assignments for every task
  
- **`PHASE_1_BUILD_GUIDE_PART2.md`** ⭐ FOR AI AGENTS (Part 2)
  - Phase 1C: Next.js portal + UI components + auth pages
  - Phase 1D: Intake forms + scheduling + payments + notifications + dashboard + deployment
  - Module gaps + architecture fixes + HIPAA + staging deploy
  - Phase 1 → Phase 2 gate criteria (build-focused)

### Phase 2: Platform Layer Build
- **`Phase 2 - Platform Layer/Phase 2 - Open-Source & Middleware.md`**
  - Build Connect API endpoints (SMS, packages, reporting)
  - Generalize all modules (vertical-agnostic)
  - Prepare repo for open-source
  - Gate: Connect API functional + modules generalized

### Phase 3: Intelligence & Ecosystem Build
- **`Phase 3 - Intel & Ecosystem/Phase 3 - Intelligence & Expansion.md`**
  - Rules engine (risk flagging)
  - Marketplace framework
  - MCP server
  - ML model scaffolding
  - Second vertical portal (Home Services)
  - Gate: All features built and tested

### Phase 4: Open-Source Launch
- **`Phase 4 - Open-Source Launch/Phase 4 - The Ecosystem.md`**
  - Publish repo to GitHub
  - Marketing materials
  - Complete documentation
  - MCP server publishing
  - Gate: Repo published + docs complete

### Phase 5: Customer Onboarding
- **`Phase 5 - Customer Onboarding/`**
  - Pilot recruitment (cold outreach)
  - Production deploy
  - Onboard clinics with finished product
  - Feedback collection + iteration
  - ML model training on real data
  - Revenue generation
  - Gate: 3+ pilots, 2+ weekly, $500+ MRR

---

## AI Agent Skill Mapping by Phase

**Before starting any phase task:** Run the Token Optimization Protocol (see `../CLAUDE.md`).
Use `session-handoff` skill between phase transitions to keep context fresh.

| Phase | Primary Skills | Subagent Delegation | Token Tools |
|-------|---------------|---------------------|-------------|
| **Phase 0** (Validation) | — | `market-researcher`, `competitive-analyst`, `project-idea-validator` | `convert_to_markdown` for research PDFs |
| **Phase 1** (First Build) | `add-feature`, `add-migration`, `write-tests`, `add-e2e-test` | `nextjs-developer`, `react-specialist`, `postgres-pro`, `payment-integration` | `audit_context_files` at project start; `token_estimate` before large reads |
| **Phase 2** (Open-Source) | `modify-feature`, `add-observability`, `audit-authz`, `sync-docs` | `backend-developer`, `security-auditor`, `documentation-engineer` | `session_report` to track costs; `claude-md-audit` as project grows |
| **Phase 3** (Intelligence) | `add-feature`, `audit-perf` | `ai-engineer`, `llm-architect`, `data-engineer` | `session-handoff` between intelligence tasks |
| **Phase 4** (Ecosystem) | `audit` (full sweep), `release`, `audit-perf`, `sync-docs` | `devops-engineer`, `cloud-architect` | `compress_log_output` for deployment logs |

**Engineering pipeline:** Use `/ship` as the front door — it auto-classifies and routes.
**When stuck:** Use `handoff-codex` for a second opinion, or `fix-bug` with `mode=regression`.

---

| # | Pain Point | Severity | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|---|---|
| 1 | Tool Fragmentation | CRITICAL | Portal | Open-source | Intelligence | Marketplace |
| 2 | HIPAA Anxiety | CRITICAL | Encryption + Audit Logs | Compliance showcase | Risk flags | Compliance pack |
| 3 | Intake Follow-ups | HIGH | Forms | SMS API | Risk alerts | Auto-chase module |
| 4 | No-Shows | HIGH | SMS infra | SMS API | Prediction | Advanced automation |
| 5 | Double-Booking | HIGH | Real-time scheduling | Template | Alerts | Optimizer module |
| 6 | Payments Don't Match | HIGH | Unified view | Metrics API | Alerts | Recovery module |
| 7 | Reporting Gaps | MEDIUM | Dashboard | Metrics API | Intelligence | Analytics module |
| 8 | Package Friction | MEDIUM | Tracking | Deduction API | Alerts | Sales optimizer |
| 9 | Photo HIPAA Violations | CRITICAL | Encrypted storage | Template | Flags | Photo pack |
| 10 | Charting Gap | HIGH | Templates | Template | Insights | Advanced charting |
| 11 | Inventory Waste | HIGH | Manual tracking | Deduction API | Alerts | Inventory optimizer |
| 12 | Marketing Disconnect | MEDIUM-HIGH | Email/SMS infra | Template API | Learned patterns | Automation module |

---

## Key Metrics at Each Phase

> **Note:** Phases 1-4 are pure build (AI-accelerated, days/weeks). Phase 5 is customer-facing.

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| **Focus** | Complete portal | Platform layer | Intel & ecosystem | Open-source launch | Customer onboarding |
| **Customer Contact** | None | None | None | None | First contact |
| **Clinics Using** | 0 (staging) | 0 | 0 | 0 | 3+ (pilots) → 10+ → 20+ |
| **Revenue** | $0 | $0 | $0 | $0 | $500+ → $2.5K+ → $15K+ MRR |
| **Pain Points Solved** | All 12 in code | All 12 generalized | All 12 + intelligence | All 12 + marketplace | All 12 validated by real usage |
| **Success Criteria** | Staging smoke test | Connect API + modules generalized | All features built | Repo published + docs | 3+ pilots, $500+ MRR |

---

## Phase Transitions (Gates)

**Phase 0 → Phase 1 Gate:** ✅ PASSED
- Pain points validated
- 3 pilot leads identified
- 12 pain points identified
- Scaffold modules mapped

**Phase 1 → Phase 2 Gate:** (Build-focused)
- All features built + tested
- Module library gaps closed
- RBAC complete on all routes
- HIPAA resolved
- Staging smoke test passes

**Phase 2 → Phase 3 Gate:** (Build-focused)
- Connect API functional
- All modules generalized (vertical-agnostic)
- Repo open-source ready

**Phase 3 → Phase 4 Gate:** (Build-focused)
- Rules engine built
- Marketplace framework built
- MCP server built
- ML scaffolding ready
- Home services portal built

**Phase 4 → Phase 5 Gate:** (Build-focused)
- Repo published to GitHub
- Documentation complete
- MCP server published

**Phase 5 → Phase 6+ Gate:** (Customer-focused)
- 3+ pilots onboarded
- 2+ using weekly
- $500+ MRR
- ML models trained on real data

---

## Technology Stack

**Frontend:**
- Next.js + React
- Tailwind CSS

**Backend:**
- Next.js API routes (Phase 1-2)
- Standalone service (Phase 2+)

**Database:**
- Postgres via Supabase

**Integrations:**
- Stripe (payments)
- Postmark (email)
- Twilio (SMS)

**Hosting:**
- Railway (frontend)
- Supabase (database)
- Railway (APIs, Phase 2+)

---

## Development & Process Docs

**Phase 0:**
- `Phase 0 - Vertical Validation/Process.md` — How Phase 0 was executed

**Phase 1:**
- `Phase 1 - The Wedge & First Build/Phase 1 - Scaffold Specification.md` (Section 3) — Implementation checklist
- `Phase 1 - The Wedge & First Build/Phase 1 - Quick Start Guide.md` — Week-by-week order

**Phase 2+:**
- Each phase doc has "Success Metrics" section

---

## For Different Roles

### Project Manager / Product Owner
1. Read: `PHASES_INTEGRATED.md` (understand pain → revenue flow)
2. Read: `Phase 0 - Vertical Validation/README.md` (understand validation)
3. Track: Phase 1 gates (staging smoke test passes)
4. Monitor: Phase 5 gates (3+ pilots onboarded, $500+ MRR)

### Developer / Engineer
1. Read: `MODULES_LIBRARY.md` (understand what's reusable vs. vertical-specific)
2. Read: `Phase 1 - The Wedge & First Build/Phase 1 - Quick Start Guide.md` (30 min overview)
3. Read: `Phase 1 - The Wedge & First Build/Phase 1 - Scaffold Specification.md` (detailed spec)
4. Reference: Database schema (Section 2)
5. Reference: Implementation patterns (code examples)
6. Build: Modules in `packages/` (core, integrations, ui, patterns)
7. **Goal:** By end of Phase 1, have 30+ reusable modules ready for Phase 2

### Sales / Business Development
1. Read: `Phase 0 - Vertical Validation/README.md` (market size, WTP)
2. Read: `Phase 0 - Vertical Validation/Phase 0 - Vertical Validation.md` (pain points = talking points)
3. Reference: `Comprehensive Med Spa Market Research.md` (competitive analysis)

### Executive / Investor
1. Read: `Business Plan & Roadmap.md` (vision + business model)
2. Read: `PHASES_INTEGRATED.md` (how pain points = dollars)
3. Reference: Phase metrics table (above) for growth trajectory

---

## FAQs

**Q: Where do I start?**
A: Read `Phase 0 - Vertical Validation/README.md` (20 min), then this document.

**Q: What are we building in Phase 1?**
A: HIPAA-compliant med spa portal solving 5-6 pain points. See `Phase 1 - The Wedge & First Build.md`

**Q: When do we make money?**
A: Phase 5. First revenue from converting pilot clinics to paying Connect customers ($49-99/mo). $500+ MRR is the Phase 5 exit gate.

**Q: Why Med Spas and not contractors/real estate?**
A: Phase 0 validation. 3+ clinic owners confirmed pain points. See `Phase 0 - Vertical Validation.md`.

**Q: How long is this project?**
A: Phase 0: Complete ✅. Phase 1-4: Complete platform build (no revenue — build-first model). Phase 5+: Customer onboarding, first revenue, profitability.

**Q: What if Phase 1 fails?**
A: Unlikely (pilots already committed + pain points validated). But if it does: pivot to home services, repeat Phase 0 validation.

**Q: Can we skip to Phase 2?**
A: No. Phase 2 generalizes modules and builds the Connect API. Must complete Phase 1 build (all features built, module gaps closed, staging smoke test passes) first.

**Q: What's the long-term vision?**
A: Baseplate becomes "Stripe for B2B integrations" — every AI-built SaaS uses us for plumbing.

---

## Alignment Checklist

Use this to verify all documents are aligned:

- [x] All references to "Property Management" updated to "Med Spas"
- [x] All phases reference the 12 pain points from Phase 0
- [x] Each phase shows revenue numbers (reconciled across docs)
- [x] Each phase shows success criteria
- [x] Each phase explains how it feeds the next phase
- [x] This document can navigate you to any topic
- [x] No two documents contradict each other

---

## File Structure

```
Advance Plan & Build/
├── MASTER_INDEX.md ← You are here
├── PHASES_INTEGRATED.md ← Pain points flow through phases
├── PHASE_0_COMPLETE.md ← Phase 0 summary
├── Business Plan & Roadmap.md ← Overall vision + business model
│
├── Phase 0 - Vertical Validation/
│   ├── README.md ← NAVIGATION
│   ├── Phase 0 - Vertical Validation.md ← PAIN POINTS + GATES
│   ├── Comprehensive Med Spa Market Research.md ← DEEP RESEARCH
│   └── Process.md ← HOW IT WAS DONE
│
├── Phase 1 - The Wedge & First Build/
│   ├── Phase 1 - The Wedge & First Build.md ← TIMELINE
│   ├── Phase 1 - Quick Start Guide.md ← QUICK REFERENCE
│   ├── Phase 1 - Scaffold Specification.md ← DETAILED SPEC
│   └── Process.md
│
├── Phase 2 - Platform Layer/
│   ├── Phase 2 - Open-Source & Middleware.md ← ROADMAP
│   └── Process.md
│
├── Phase 3 - Intel & Ecosystem/
│   ├── Phase 3 - Intelligence & Expansion.md ← ROADMAP
│   └── Process.md
│
└── Phase 4 - Open-Source Launch/
    ├── Phase 4 - The Ecosystem.md ← ROADMAP
    └── Process.md
```

---

**Status:** All phases documented + aligned ✅

**Phase 1 in progress:** Phases 1A-1C complete (monorepo, core modules, portal UI, auth pages). Phase 1D next (intake forms, scheduling, payments, notifications, deployment). See `PHASE_1_BUILD_GUIDE.md` and `PHASE_1_BUILD_GUIDE_PART2.md` for build status and details. 🚀

