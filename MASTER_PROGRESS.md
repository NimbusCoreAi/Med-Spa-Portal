# MASTER PROGRESS — Baseplate OS / Med Spa

> **This is the single source of truth for project status.**
> Last updated: June 2026 | All phases code complete + security audited. Awaiting manual deployment.

---

## Phase Structure (Build-First, Onboard-Last)

> **Philosophy:** AI-accelerated development compresses weeks into hours. All build phases
> (1-4) complete first, delivering a polished product. Customer onboarding happens once in
> Phase 5 with a finished, tested, production-ready platform.

| Phase | Name | Status | Summary |
|-------|------|--------|---------|
| Phase 0 | Vertical Validation | ✅ Complete | 12 pain points validated; 3 pilot leads identified |
| Phase 1 | Complete Med Spa Portal | 🟡 ~95% done | All code complete: 1A-1D.6, audit, arch fixes, 10 modules extracted, HIPAA doc. Remaining: staging deploy + smoke test |
| Phase 2 | Platform Layer Build | ✅ Code complete + polished | Connect API (3 endpoints), rate limiting, OpenAPI docs, usage logging, cross-vertical validation. Quality polish: atomic deduction RPC, RLS fix, typed errors, expanded test coverage (225 tests), OpenAPI gap fix. Remaining: manual deploy (Railway, Upstash, Stripe products) |
| Phase 3 | Intelligence & Ecosystem Build | ✅ Code complete | Rules engine (6 rules), Connect API intelligence endpoint, risk panel in portal, home services portal (13 routes), configurable RBAC factory, marketplace framework, MCP server (5 tools), ML scaffolding. 250 tests, 16 packages. Remaining: manual deploy |
| Phase 4 | Open-Source Launch | ✅ Code complete + gap fixes applied | Repo prep (LICENSE, CONTRIBUTING, CHANGELOG, ARCHITECTURE, CI/CD), marketplace UI + dev docs, MCP server (11 tools, modularized), @baseplate/sdk (restructured), Python ML pipeline, churn-prediction endpoint, marketing materials. CI enhanced with Python validation + turbo cache. 17 packages, 250 tests. Remaining: GitHub launch (create public repo, push, marketing rollout) |
| Phase 5 | Customer Onboarding | ✅ Code complete | Code gaps built: pricing/billing (subscription checkout, portal, webhook), observability (monitoring module, health endpoint, error boundaries), self-service signup, feedback widget + API. Security audited + fixed (IDOR holes patched, session auth enforced, email verification required). 262 tests, 17 packages, 35 portal routes. Remaining: ALL manual work (deploy, HIPAA, recruit pilots, onboard, ML training, revenue). |

---

## Gate Criteria

| Gate | Criteria |
|------|----------|
| **Phase 0 → 1** | ✅ Met — pain points validated, pilot leads identified |
| **Phase 1 → 2** | All features built + tested + module gaps closed + RBAC complete on all routes + HIPAA resolved + staging smoke test passes |
| **Phase 2 → 3** | ✅ Code complete — Connect API built (3 endpoints, rate limiting, OpenAPI, usage logging), modules generalized (type aliases + RBAC keys), cross-vertical validated. Remaining: manual deploy (Railway, Upstash, Stripe products, load test) |
| **Phase 3 → 4** | Rules engine + marketplace framework + MCP server + ML scaffolding + home services portal all built and tested |
| **Phase 4 → 5** | ✅ Code + gap fixes complete — Repo prepped (LICENSE, CONTRIBUTING, CHANGELOG, ARCHITECTURE, CI/CD), docs complete, MCP server (11 tools, modularized), SDK restructured, ML pipeline built. Remaining: push to public GitHub repo + marketing rollout |
| **Phase 5 → Beyond** | 3+ pilots onboarded, 2+ using weekly, $500+ MRR, ML models trained on real data |

---

## Phase 1 Detail: What's Done

### ✅ 1A-1B — Foundation (commit `d269c55`)
- Monorepo scaffold (pnpm + Turborepo)
- Core modules: auth, RBAC, audit-logs, encryption, config, types
- Supabase setup + migrations 0001-0004

### ✅ 1C — Portal UI + Auth (commit `b19847f`)
- Next.js 14 App Router portal (23 routes/layouts)
- UI component library: Button, Input, Form, Table, Modal, Layout
- Auth pages (login, signup, callback, middleware)

### ✅ 1D.1-1D.5 — Features (commit `25e31bd`)
- Intake forms (dynamic renderer + submission API)
- Scheduling (providers, rooms, time slots, booking flow)
- Payments (Stripe checkout + webhook handling)
- Notifications (Postmark email, Twilio SMS integrations)
- Reporting dashboard (providers, rooms, patients, audit logs, RBAC)
- Core modules: clinics, intake, patients, scheduling, reporting

### ✅ 1D.6 — Deployment Config (commit `4be176e`)
- Railway deployment config
- CI/CD pipeline
- Deploy guide

### ✅ Phase 1 Audit (commit `8defad0`)
- 7 READMEs added to packages
- 3 new pattern modules (admin-setup, invite-user, media-upload)
- `treatment_type` → `service_type` (vertical-agnostic)
- zod input validation on all API routes
- Postmark HTML escaping (XSS prevention)
- RLS policies tightened (migration 0007)
- UI package coverage threshold at 80%

### ✅ Phase 1 Audit Follow-up
- Service-role Supabase client (server-only, bypasses RLS)
- Patient-facing API routes (booking + intake)
- Coverage gaps closed (packages/ui 100%, packages/patterns 92.7%)

### ✅ Pre-Deploy Fix: signUp Staff Creation (commit `83fae51`)
- Fixed critical bug: `signUp()` now creates a `staff` record with `id = auth user id` + `role = 'owner'`
- Without this, newly signed-up owners could not access role-gated pages (audit logs)
- Added migration `0008_staff_insert_policy.sql` (RLS INSERT policy on `staff` table)

---

## Phase 1 Detail: What's Left

### ✅ Module Library Gaps — CLOSED (commit `9e006d6`)
All 10 gap modules extracted:
- [x] `packages/core/errors` — structured error handling (AppError hierarchy + errorToResponse/errorToStatus)
- [x] `packages/core/bookings` — booking orchestration (find-or-create + appointment in one call)
- [x] `packages/core/availability` — pure slot calculation engine (generateTimeSlots, isSlotAvailable, filterAvailableSlots)
- [x] `@baseplate/hooks` — useApiQuery / useApiMutation
- [x] `@baseplate/next-api` — route handler + middleware factories (createRouteHandler, createGetHandler, jsonResponse, errorResponse)
- [x] `packages/core/notifications` — notification orchestration (injected EmailService/SmsService)
- [x] `packages/core/utils` — shared utilities (snakeToCamel, camelToSnake, formatDate/Time, formatCurrency, cn, getDateRange)
- [x] `@baseplate/dates` — date utilities (startOfWeek, endOfWeek, addDays, addMinutes, DATE_RANGE_PRESETS, getDateRange)
- [x] `packages/patterns/form-builder` — extracted from app (generic FormBuilder component)
- [x] `packages/patterns/consent-form` — extracted from app (generic ConsentForm with signature)

### ✅ Architecture Fixes — CLOSED (commits `eca87d2`, `99ca739`)
All 9 architecture gaps resolved:
- [x] Clinic ID from session (not env var)
- [x] Session-aware client (@supabase/ssr)
- [x] RBAC: IDOR protection on API routes, role-based sidebar visibility, dashboard layout auth gate
- [x] Stripe redirect URLs + success/cancel pages created
- [x] Scheduling module split (providers, rooms, appointments, availability)
- [x] Duplicate Role type unified
- [x] FormField type aligned (FormFieldType shared)
- [x] Reporting moved server-side via API route
- [x] Staff.role uses Exclude<Role, 'patient'>

### ✅ Security & Compliance — DOCUMENTED
- [x] HIPAA compliance posture documented (`Med Spa App/docs/HIPAA_COMPLIANCE.md`)
- [x] Free-tier, non-PHI approach with BAA upgrade path documented
- [x] PHI_ENABLED feature flag added (defaults to false)
- [x] RBAC enforced on all routes and API endpoints
- [x] IDOR protection (clinic-scoping) on all staff-facing API routes

### ⬜ Staging Deploy & Smoke Test
- [ ] Set up Supabase, Stripe, Postmark, Twilio accounts
- [ ] Run all 8 migrations on staging Supabase
- [ ] Configure all env vars in staging
- [ ] Deploy to Railway staging
- [ ] Pass post-deploy smoke test (full happy path)

### Phase 1 → Phase 2 Gate
- [x] All features built and tested (203 tests, 0 failures)
- [x] Module library gaps closed (16+ modules in packages/)
- [x] Architecture fixes applied (all 9 gaps resolved)
- [x] HIPAA resolved (documented, free-tier non-PHI, BAA-ready)
- [ ] Staging smoke test passes ← **the only remaining gate item**

---

## Architecture Gaps — All Resolved ✅

| Gap | Severity | Status |
|-----|----------|--------|
| Clinic ID hardcoding | Medium | ✅ Fixed (eca87d2) — clinicId from session |
| No session-aware client | Medium | ✅ Fixed (eca87d2) — @supabase/ssr |
| RBAC incomplete | Medium | ✅ Fixed (eca87d2, 99ca739) — all routes + sidebar |
| Stripe redirect URLs | Low | ✅ Fixed (99ca739) — success/cancel pages created |
| 3 Supabase client patterns | Medium | ✅ Fixed (eca87d2) — unified client pattern |
| Scheduling module overloaded | Low | ✅ Fixed (e32e86b) — split into 4 submodules |
| Duplicate Role type | Low | ✅ Fixed (eca87d2) — unified via re-export |
| FormField.type divergence | Low | ✅ Fixed (99ca739) — FormFieldType shared |
| Reporting client-side aggregation | Medium | ✅ Fixed (99ca739) — server-side API route |

---

## Verification Snapshot (post-Phase 4)

| Gate | Result |
|------|--------|
| `pnpm typecheck` | ✅ 17/17 packages pass |
| `pnpm test` | ✅ All tests pass (250 tests across all suites) |
| `npx next build` (portal-medspa) | ✅ 27 routes generated (added marketplace) |
| `npx next build` (portal-homeservices) | ✅ 13 routes generated |
| `npx next build` (connect-api) | ✅ 8 routes (added churn-prediction) |
| Coverage (packages/ui) | ✅ 100% statements (≥80% threshold) |
| Coverage (packages/patterns) | ✅ 92.7% statements (≥80% threshold) |

---

## Built Module Inventory

> Regenerated from source on every `pnpm sync-modules` (`scripts/sync-module-inventory.mjs`). Do not edit by hand — add modules in code, then re-run.

<!-- BEGIN:MODULE_INVENTORY -->
<!-- Generated by scripts/sync-module-inventory.mjs — do not edit by hand. Run `pnpm sync-modules`. -->

### @baseplate/core (18 modules)
audit-logs (2 exports), auth (5 exports), availability (4 exports), billing (7 exports), bookings (1 exports), clinics (1 exports), config (5 exports), encryption (3 exports), errors (9 exports), intake (11 exports), monitoring (4 exports), notifications (1 exports), packages (2 exports), patients (2 exports), rbac (11 exports), reporting (1 exports), scheduling (15 exports), utils (8 exports)

### @baseplate/dates (standalone)

### @baseplate/hooks (standalone)

### @baseplate/intelligence (2 modules)
predictions (19 exports), rules-engine (11 exports)

### @baseplate/marketplace (standalone)

### @baseplate/next-api (standalone)

### @baseplate/patterns (6 modules)
admin-setup (1 exports), consent-form (1 exports), digital-signature (1 exports), form-builder (1 exports), invite-user (1 exports), media-upload (1 exports)

### @baseplate/sdk (standalone)
_Typed Connect API client for Baseplate OS_

### @baseplate/ui (6 modules)
button, form, input, layout, modal, table

### packages/integrations (3 integrations)
postmark, stripe, twilio

### supabase/migrations (27 migrations)
0001_init_clinics–0027_performance_indexes — see Phase & Build Docs/MODULES_LIBRARY.md for the full table.

> **10 packages** · **32 sub-modules** · **27 migrations** — regenerated from source on every `pnpm sync-modules`.
<!-- END:MODULE_INVENTORY -->

---

## Phase 2 Detail: What's Done

### ✅ 2A — Generalization & Repo Prep
- Multi-vertical type aliases (Tenant, Customer, Resource, Space)
- RBAC permission keys generalized (canViewAllRecords, canManageStaff)
- Codebase cleaned (no TODOs, console.logs, or secrets)
- Root README.md with architecture diagram
- Root .env.example template

### ✅ 2B — Connect API Build
- Connect API scaffolded as standalone Next.js app (`apps/connect-api/`)
- API-key authentication middleware (`validateApiKey`)
- 3 endpoints built:
  - `POST /api/v1/communications/sms-reminder` (Twilio SMS)
  - `POST /api/v1/billing/package-deduct` (credit package deduction)
  - `POST /api/v1/reporting/treatment-metrics` (revenue/appointment metrics)
- New `@baseplate/core/packages` module (deductPackageSession, getPatientPackages)
- Migration 0009 (credit_packages + package_transactions tables)
- Portal wired to call Connect API for SMS (connect-client.ts)
- Auth tests (4 tests), packages module tests (3 tests)

### ✅ 2C — Hardening
- Rate limiting via Upstash Redis (graceful degradation when env vars missing)
- Usage logging (`api_usage` table via migration 0010)
- OpenAPI 3.0 spec (`apps/connect-api/docs/openapi.yaml`)
- Developer integration guide (`apps/connect-api/docs/README.md`)

### ✅ 2D — Cross-Vertical Validation
- Home services test app (`apps/test-home-services/`) — validates type aliases + RBAC in non-med-spa context
- Cross-vertical config guide (`docs/CROSS_VERTICAL_GUIDE.md`)

### Phase 2 Remaining (manual only — no code changes needed)
- [ ] Deploy Connect API to Railway (see `MASTER_MANUAL_CONFIG.md` Section 3B)
- [ ] Create Upstash Redis database (see `MASTER_MANUAL_CONFIG.md` Section 3C)
- [ ] Create Stripe pricing products (see `MASTER_MANUAL_CONFIG.md` Section 3C)
- [ ] Load test all 3 endpoints
- [ ] Run migrations 0009 + 0010 on staging Supabase

---

## Phase 3 Detail: What's Done

### ✅ 3A — Intelligence Layer
- New `@baseplate/intelligence` package with rules-engine + predictions modules
- 6 composable risk rules: no-show, churn, revenue-drop, package-abandonment, inventory-expiry, follow-up-gap
- `evaluateRisk()` orchestrator with Supabase data fetchers
- `evaluateRiskSync()` for testing with pre-built context
- Connect API endpoint: `POST /api/v1/intelligence/risk-score`
- Portal risk panel on patient detail page (`/dashboard/patients/[id]`)
- Migration 0012: synthetic test data for all 6 rules (3 clinics, 5 patients)
- 25 tests covering all rules + orchestrator

### ✅ 3B — Home Services Portal
- New `apps/portal-homeservices/` app (13 routes: dashboard, customers, dispatch, invoices, job-costing, reporting, audit-logs)
- Configurable RBAC: `createRBAC<TRoles>()` factory in `packages/core/src/rbac/factory.ts`
- Backward-compatible — existing `owner/staff/patient` defaults unchanged
- Core modification: <5% (only rbac/types.ts + rbac/index.ts changed)
- Proves `packages/core` is vertical-agnostic

### ✅ 3C — Marketplace Framework
- New `@baseplate/marketplace` package (registry, installer, types)
- Migration 0013: `marketplace_modules`, `marketplace_subscriptions` tables with RLS + install count RPC
- Connect API endpoints: `GET /api/v1/marketplace/modules`, `POST /api/v1/marketplace/install`, `DELETE /api/v1/marketplace/install`
- 20% take-rate Stripe Connect skeleton (not activated until Phase 5)

### ✅ 3D — MCP Server
- New `apps/mcp-server/` standalone app (JSON-RPC over stdio)
- 5 MCP tools wrapping Connect API: send_sms_reminder, deduct_package, get_treatment_metrics, get_risk_score, browse_marketplace
- API-key auth via `CONNECT_API_KEY` env var
- Claude Desktop config example included

### ✅ 3E — ML Scaffolding
- `PredictionModel` interface + model registry in `@baseplate/intelligence/predictions`
- 3 predictor stubs with heuristic fallbacks: NoShowPredictor, ChurnPredictor, RevenuePredictor
- Feature extractors: appointment, payment, engagement
- Training pipeline interface: `trainModel()`, `evaluateModel()`
- Models trained in Phase 5 when real pilot data exists

### Phase 3 Gate Criteria — All Met
- [x] Home services portal built + tested (13 routes)
- [x] `packages/core` proved reusable (<5% modification)
- [x] Intelligence layer + synthetic data tested (6 rules, 25 tests)
- [x] Connect endpoints scaffolded (intelligence + marketplace)
- [x] Marketplace framework built
- [x] MCP server built (5 tools)
- [x] ML scaffolding built

---

## Build Log (commit history)

| Commit | Description |
|--------|-------------|
| `pending` | Module library inventory sync: `scripts/sync-module-inventory.mjs` generator (zero-dep) + `pnpm sync-modules` script. Regenerates Built Module Inventory (MASTER_PROGRESS.md) + Live Inventory table (MODULES_LIBRARY.md) from package.json exports + migration files. Fixed stale counts (core 17→18 modules, migrations 13→27). Added prose entries for monitoring, billing, sdk, clinics. |
| `pending` | Phase 5 plan: execution plan + code gaps build guide written (PHASE_5_EXECUTION_PLAN.md, PHASE_5_CODE_GAPS.md) |
| `pending` | Phase 4 launch: modularize MCP tools, restructure SDK, enhance CI (Python+cache), enrich package metadata, .gitignore Python patterns |
| `14e8832` | Phase 4C+4D+4E: MCP enhancement (11 tools) + SDK + ML pipeline + marketing |
| `308e6a7` | Phase 4A+4B: repo prep (LICENSE, CI/CD, templates) + marketplace UI + dev docs |
| `eb3ca56` | Phase 3C+3D: marketplace framework + MCP server (5 tools) |
| `98c4ccc` | Phase 3B: home services portal (13 routes) + configurable RBAC factory |
| `b13f270` | Phase 3A+3E: intelligence layer (6 rules, 25 tests) + ML scaffolding |
| `8d63391` | Phase 2 polish: atomic deduction RPC (migration 0011), RLS fix, typed errors, expanded tests (225), OpenAPI gap fix, RBAC freeze, connect-client timeout + env validation, dep cleanup |
| `530e153` | Phase 2D: fix jest devDeps for test-home-services |
| `5066ca3` | Phase 2D: cross-vertical validation app + config guide |
| `2d522c1` | Phase 2C: rate limiting, usage logging, OpenAPI spec, migration 0010 |
| `b1a84a0` | Phase 2B: portal calls Connect API for SMS instead of direct Twilio |
| `860cc06` | Phase 2B: Connect API endpoints (SMS, package-deduct, treatment-metrics) + migration 0009 + packages module |
| `f3620b9` | Phase 2B: scaffold Connect API as standalone Next.js app with API-key auth |
| `5641c06` | Phase 2A: root .env.example template |
| `a33f69e` | Phase 2A: root README with architecture diagram |
| `f0640d8` | Phase 2A: generalize RBAC permission keys (canViewAllRecords, canManageStaff) |
| `a2f8a16` | Phase 2A: multi-vertical type aliases (Tenant/Customer/Resource/Space) |
| `1be8f44` | Phase 1: HIPAA compliance doc + PHI_ENABLED flag + MASTER_PROGRESS update |
| `9e006d6` | Phase 1 module extraction: 10 new packages/modules (errors, bookings, availability, notifications, utils, hooks, next-api, dates, form-builder, consent-form) |
| `99ca739` | Phase 1 arch fixes: RBAC IDOR protection, reporting server-side, Stripe redirect pages, type alignment |
| `e32e86b` | Phase 1: Split scheduling module into providers, rooms, appointments, availability submodules |
| `eca87d2` | Phase 1 arch fixes: unified types, @supabase/ssr, session-based auth, RBAC, clinicId from session |
| `83fae51` | Phase 1: signUp staff creation fix, patient-facing API routes, service-role client |
| `8defad0` | Phase 1 audit fixes (READMEs, patterns, security, refactor) |
| `4be176e` | Phase 1D.6: Deployment config |
| `0b6544c` | Fix monorepo typecheck config + audit log RBAC |
| `25e31bd` | Phase 1D.1-1D.5: Intake, scheduling, payments, notifications, reporting |
| `b19847f` | Phase 1C: Portal + UI library + auth pages |
| `d269c55` | Phase 1A & 1B: Monorepo + core modules |

---

## Pointer: Where to Find Detailed Docs

| Need | Read this |
|------|-----------|
| **Phase 2 execution plan (detailed build guide)** | **`Phase & Build Docs/Phase 2 - Platform Layer/PHASE_2_EXECUTION_PLAN.md`** |
| **Phase 1 completion (staging deploy + smoke test)** | **`PHASE_1_COMPLETION_GUIDE.md`** |
| **Phase 1 staging deploy (legacy reference)** | **`PHASE_1_STAGING_DEPLOY.md`** |
| **Phase 5 customer onboarding** | **`PHASE_5_ONBOARDING_GUIDE.md`** |
| **Phase 5 outreach templates & leads** | **`COLD_OUTREACH_PLAYBOOK.md`** + **`PILOT_LEADS_AND_TEMPLATES.md`** |
| Business strategy & vision | `Phase & Build Docs/Business Plan & Roadmap.md` |
| How pain points flow through all phases | `Phase & Build Docs/PHASES_INTEGRATED.md` |
| Phase specs & schemas | `Phase & Build Docs/Phase 1 - The Wedge & First Build/` |
| AI-ready build instructions | `Phase & Build Docs/Phase 1 - The Wedge & First Build/PHASE_1_BUILD_GUIDE.md` (+ Part 2) |
| Module library inventory | `Phase & Build Docs/MODULES_LIBRARY.md` (regenerate via `pnpm sync-modules`) |
| Developer module checklist | `Phase & Build Docs/DEVELOPER_CHECKLIST.md` |
| App-level dev commands | `Med Spa App/CLAUDE.md` |
| Skill routing | `Skills/SKILL_ROUTING_GUIDE.md` |
| Token optimization | `Token Saving/Token Saving.md` |

---

## Navigation Guide

### "I want to understand the big picture"
1. `Phase & Build Docs/PHASES_INTEGRATED.md` — 12 pain points flow through all phases
2. `Phase & Build Docs/Business Plan & Roadmap.md` — Overall strategy + business model

### "I want to understand Phase 0 (Validation)"
1. `Phase & Build Docs/Phase 0 - Vertical Validation/README.md`
2. `Phase & Build Docs/Phase 0 - Vertical Validation/Comprehensive Med Spa Market Research.md`

### "I want to build Phase 2 (Platform Layer)"
1. **`Phase & Build Docs/Phase 2 - Platform Layer/PHASE_2_EXECUTION_PLAN.md`** — The definitive build guide: generalization, Connect API, hardening, cross-vertical validation

### "I want to complete Phase 1 (staging deploy)"
1. **`PHASE_1_COMPLETION_GUIDE.md`** — The definitive guide: service setup, local verification, Railway deploy, 19-step smoke test, troubleshooting
2. `PHASE_1_STAGING_DEPLOY.md` — Legacy reference (same content, older format)

### "I want to understand Phase 1 (Building the Portal)"
1. `Phase & Build Docs/Phase 1 - The Wedge & First Build/Phase 1 - The Wedge & First Build.md`
2. `Phase & Build Docs/Phase 1 - The Wedge & First Build/Phase 1 - Scaffold Specification.md`

### "I'm an AI agent building Phase 1"
1. `Phase & Build Docs/Phase 1 - The Wedge & First Build/PHASE_1_BUILD_GUIDE.md` (Phases 1A & 1B)
2. `Phase & Build Docs/Phase 1 - The Wedge & First Build/PHASE_1_BUILD_GUIDE_PART2.md` (Phases 1C & 1D)
3. `Phase & Build Docs/MODULES_LIBRARY.md` (which modules to extract)

### "I want to build Phase 3 (Intelligence & Ecosystem)"
1. **`Phase & Build Docs/Phase 3 - Intel & Ecosystem/PHASE_3_EXECUTION_PLAN.md`** — The definitive build guide: 5 sub-phases (intelligence, home services, marketplace, MCP server, ML scaffolding) with skill mappings

### "I want to build Phase 4 (Open-Source Launch)"
1. **`Phase & Build Docs/Phase 4 - Open-Source Launch/PHASE_4_EXECUTION_PLAN.md`** — The definitive build guide: 5 sub-phases (repo prep, marketplace UI, MCP+SDK, ML pipeline, marketing) with skill mappings

### "I want to understand Phases 2-5"
1. Phase 2: `Phase & Build Docs/Phase 2 - Platform Layer/Phase 2 - Platform Layer.md`
2. Phase 3: `Phase & Build Docs/Phase 3 - Intel & Ecosystem/Phase 3 - Intel & Ecosystem.md` (overview) + `PHASE_3_EXECUTION_PLAN.md` (build guide)
3. Phase 4: `Phase & Build Docs/Phase 4 - Open-Source Launch/Phase 4 - Open-Source Launch.md` (overview) + `PHASE_4_EXECUTION_PLAN.md` (build guide)
4. Phase 5: `Phase & Build Docs/Phase 5 - Customer Onboarding/Phase 5 - Customer Onboarding.md`

---

## AI Agent Skill Mapping by Phase

**Before starting any phase task:** Run the Token Optimization Protocol (see `CLAUDE.md`).

| Phase | Primary Skills | Subagent Delegation |
|-------|---------------|---------------------|
| **Phase 1** (Build) | `add-feature`, `add-migration`, `write-tests`, `add-e2e-test` | `nextjs-developer`, `react-specialist`, `postgres-pro`, `payment-integration` |
| **Phase 2** (Platform) | `modify-feature`, `add-observability`, `audit-authz`, `sync-docs` | `backend-developer`, `security-auditor`, `documentation-engineer` |
| **Phase 3** (Intelligence) | `add-feature`, `audit-perf` | `ai-engineer`, `llm-architect`, `data-engineer` |
| **Phase 4** (Open-Source) | `audit` (full sweep), `release`, `sync-docs` | `devops-engineer`, `cloud-architect` |
| **Phase 5** (Onboarding) | `fix-bug`, `add-observability`, `add-regression-test` | `customer-onboarding-specialist`, `qa-tester` |

**Engineering pipeline:** Use `/ship` as the front door — it auto-classifies and routes.

---

## 12 Pain Points Flow (Summary)

| # | Pain Point | Severity | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|---|---|
| 1 | Tool Fragmentation | CRITICAL | Portal | Open-source prep | Intelligence | Marketplace | Validated |
| 2 | HIPAA Anxiety | CRITICAL | Encryption + Audit Logs | Compliance showcase | Risk flags | Compliance pack | Validated |
| 3 | Intake Follow-ups | HIGH | Forms | SMS API | Risk alerts | Auto-chase module | Validated |
| 4 | No-Shows | HIGH | SMS infra | SMS API | Prediction | Advanced automation | Validated |
| 5 | Double-Booking | HIGH | Real-time scheduling | Template | Alerts | Optimizer module | Validated |
| 6 | Payments Don't Match | HIGH | Unified view | Metrics API | Alerts | Recovery module | Validated |
| 7 | Reporting Gaps | MEDIUM | Dashboard | Metrics API | Intelligence | Analytics module | Validated |
| 8 | Package Friction | MEDIUM | Tracking | Deduction API | Alerts | Sales optimizer | Validated |
| 9 | Photo HIPAA Violations | CRITICAL | Encrypted storage | Template | Flags | Photo pack | Validated |
| 10 | Charting Gap | HIGH | Templates | Template | Insights | Advanced charting | Validated |
| 11 | Inventory Waste | HIGH | Manual tracking | Deduction API | Alerts | Inventory optimizer | Validated |
| 12 | Marketing Disconnect | MEDIUM-HIGH | Email/SMS infra | Template API | Learned patterns | Automation module | Validated |

> **Full detail:** See `Phase & Build Docs/PHASES_INTEGRATED.md` for each pain point's revenue math + phase-by-phase breakdown.
