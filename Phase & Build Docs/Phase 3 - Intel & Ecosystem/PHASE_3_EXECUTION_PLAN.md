# Phase 3 Execution Plan — Intelligence & Ecosystem Build

> **Status:** Builds on Phase 2 completion (Connect API built, modules generalized, quality polished)
> **Last updated:** June 2026
> **Prerequisite:** Phase 2 code complete + polish pass (commit `683df4d`)
> **Estimated effort:** ~60-80 hours of AI-assisted build work (5 sub-phases)

> **🔧 MAINTENANCE:** After completing any sub-phase, update `MASTER_PROGRESS.md`: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

---

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Intelligence approach | Rules-based (not ML) | No real customer data exists yet; ML needs 50+ clinics × 6 months. Rules are explainable and ship fast. |
| Second vertical | Home Services (HVAC/Plumbing/Cleaning) | Tier 1 vertical from Phase 0 research; different pain points test vertical-agnosticism |
| API framework | Next.js API routes (NOT Express) | Consistent with Phase 2's locked decision; one hosting provider; team familiarity |
| RBAC strategy | Backward-compatible `createRBAC()` factory | Keep default `owner/staff/patient` roles working; allow vertical override without breaking med spa portal |
| Intelligence rule set | Patient/customer-focused (6 rules from overview doc) | The Process.md sample rules are B2B-SaaS-focused (payment failures, login gaps). The overview doc's 6 rules are more relevant to med spa + home services. |
| MCP protocol | JSON-RPC over stdio + SSE | Standard MCP transport; supports both local (Claude Desktop) and remote (HTTP) usage |

---

## Sub-phase Overview

| Sub-phase | Name | Est. Hours | Dependencies |
|-----------|------|------------|--------------|
| **3A** | Intelligence Layer | 15-20 | None (builds on Phase 2 Connect API) |
| **3B** | Home Services Portal | 20-25 | 3A (optional — can run in parallel after RBAC refactor) |
| **3C** | Marketplace Framework | 10-15 | 3A + 3B (both verticals need to exist for marketplace) |
| **3D** | MCP Server | 8-10 | 3A (MCP tools wrap Connect API endpoints including intelligence) |
| **3E** | ML Scaffolding | 5-8 | 3A (ML interfaces wrap rules-engine as fallback) |

**Recommended order:** 3A → 3B → 3C → 3D → 3E

---

## Phase 3 → Phase 4 Gate Criteria

| Criteria | Satisfied By |
|----------|-------------|
| Home services portal fully built + tested | 3B |
| `packages/core` proved reusable (<5% modification) | 3B step 6 verification |
| Intelligence layer built + tested with synthetic data | 3A |
| Connect endpoints scaffolded for second vertical | 3B step 5 |
| Marketplace framework built | 3C |
| MCP server built | 3D |
| ML scaffolding built | 3E |

---

## Architecture After Phase 3

```
Med Spa App/
  apps/
    portal-medspa/            # Phase 1-2 (mature, proven)
    portal-homeservices/      # Phase 3 (NEW — validates core reusability)
    connect-api/              # Phase 2 + Phase 3A (NEW: intelligence endpoint)
    mcp-server/               # Phase 3D (NEW — exposes Baseplate to AI agents)
  packages/
    core/                     # Phase 1-2 (shared, vertical-agnostic)
    ui/                       # Phase 1 (shared components)
    patterns/                 # Phase 1 (shared patterns)
    integrations/             # Phase 1 (stripe, postmark, twilio)
    intelligence/             # Phase 3A (NEW — rules-engine + predictions)
    marketplace/              # Phase 3C (NEW — registry, listing, install)
```

---

## Sub-phase 3A: Intelligence Layer

**Goal:** Build a rules-based risk-scoring engine that flags at-risk patients/customers with explainable factors and recommended actions.

### Step 1: Create Intelligence Package Scaffold

Create `packages/intelligence/` as a new workspace package.

| Task | Deliverable |
|------|------------|
| Create `packages/intelligence/package.json` (workspace package) | Package config with exports map |
| Create `packages/intelligence/tsconfig.json` | TypeScript config |
| Create `packages/intelligence/src/rules-engine/index.ts` | Module entry point |
| Create `packages/intelligence/src/index.ts` | Package barrel export |
| Run `pnpm install` to register workspace | Lockfile updated |

> **Skill:** `add-feature` (mode=fast) — scaffolding a new package is a greenfield addition
> **Subagent:** `backend-developer` — package structure design

### Step 2: Define Types & Interfaces

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/types.ts` — RiskFlag, RiskScore, RuleEvaluator, RuleContext | Full type definitions |
| `RiskLevel = 'low' \| 'medium' \| 'high'` | Severity enum |
| `RiskFlag { type: string; severity: RiskLevel; reason: string; action: string; data?: Record<string, unknown> }` | Flag shape |
| `RuleEvaluator { id: string; evaluate(ctx: RuleContext): Promise<RiskFlag[]> }` | Rule interface |
| `RuleContext { tenantId: string; customerId?: string; appointments?; payments?; packages?; auditLogs? }` | Data context for rules |

> **Skill:** `harden-types` — ensure strict typing at the boundary
> **Subagent:** `typescript-pro` — type design

### Step 3: Implement 6 Rules

Each rule is a composable evaluator that takes a `RuleContext` and returns `RiskFlag[]`.

| # | Rule | Trigger | Severity | Action |
|---|------|---------|----------|--------|
| 1 | `NoShowRiskRule` | 2+ no-shows in 90 days | HIGH | Send SMS reminder 72h before next appointment |
| 2 | `ChurnRiskRule` | No appointment in 60 days (when historical avg is ≤28d) | MEDIUM | Send win-back email with special offer |
| 3 | `RevenueDropRule` | Monthly revenue down >15% vs 3-month average | LOW | Recommend promotion or package offer |
| 4 | `PackageAbandonmentRule` | Package has remaining sessions but no usage in 90+ days | MEDIUM | Send "complete your package" reminder |
| 5 | `InventoryExpiryRule` | Products expiring within 30 days | MEDIUM | Alert staff to use or discount before expiry |
| 6 | `FollowUpGapRule` | No follow-up appointment within 2 weeks of service (when historical norm is ≤7d) | LOW | Auto-send care instructions + booking link |

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/rules-engine/rules/no-show-risk.ts` | Rule 1 |
| `packages/intelligence/src/rules-engine/rules/churn-risk.ts` | Rule 2 |
| `packages/intelligence/src/rules-engine/rules/revenue-drop.ts` | Rule 3 |
| `packages/intelligence/src/rules-engine/rules/package-abandonment.ts` | Rule 4 |
| `packages/intelligence/src/rules-engine/rules/inventory-expiry.ts` | Rule 5 |
| `packages/intelligence/src/rules-engine/rules/follow-up-gap.ts` | Rule 6 |
| `packages/intelligence/src/rules-engine/rules/index.ts` | Barrel export + `defaultRules` array |

> **Skill:** `add-feature` (mode=production) — these are the core intelligence logic
> **Subagents:** `data-engineer` (data model design), `ai-engineer` (rule design for explainable AI)

### Step 4: Build Rules Engine Orchestrator

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/rules-engine/evaluate.ts` — `evaluateRisk(ctx, rules?)` function | Runs all (or custom subset of) rules, aggregates flags, computes overall risk level |
| `packages/intelligence/src/rules-engine/data-fetchers.ts` — Functions to build `RuleContext` from Supabase queries | Fetches appointment history, payment data, package data, audit logs |
| Overall risk level = max severity across all triggered flags | Aggregation logic |

```typescript
// Example usage
const score = await evaluateRisk({
  tenantId: 'clinic-uuid',
  customerId: 'patient-uuid',
});
// Returns: { customerId, overallRisk: 'high', flags: [...], evaluatedAt }
```

> **Skill:** `add-feature` (mode=balanced) — orchestration logic
> **Subagent:** `backend-developer` — query design

### Step 5: Synthetic Test Data Migration

Create migration to seed synthetic data that triggers each rule.

| Task | Deliverable |
|------|------------|
| `supabase/migrations/0012_intelligence_seed.sql` | Seeds: 3 test clinics, 10 patients each, appointments with no-shows, payments with revenue drops, packages with abandonment, expired inventory |
| Mark all seeded records with `is_synthetic = true` column for easy cleanup | Synthetic flag |

> **Skill:** `add-migration` (additive) — new migration with seed data
> **Subagent:** `data-engineer` — synthetic data design that exercises all 6 rules

### Step 6: Connect API Endpoint

| Task | Deliverable |
|------|------------|
| `apps/connect-api/src/app/api/v1/intelligence/risk-score/route.ts` | `POST` endpoint with Zod validation, API-key auth, rate limiting |
| Input: `{ tenant_id: UUID, customer_id?: UUID }` — clinic-level or patient-level risk | Request schema |
| Output: `{ overall_risk, flags[], recommendation, evaluated_at }` | Response schema |
| Uses `evaluateRisk()` from `@baseplate/intelligence` | Core logic |
| Add to OpenAPI spec (`apps/connect-api/docs/openapi.yaml`) | API docs |

> **Skill:** `add-feature` (mode=production) — new API endpoint with auth, validation, rate limiting
> **Subagent:** `api-designer` — endpoint design, `security-auditor` — auth review

### Step 7: Portal Integration (Med Spa)

| Task | Deliverable |
|------|------------|
| `apps/portal-medspa/src/app/api/intelligence/risk-score/route.ts` | Proxy route calling Connect API (uses `callConnectApi`) |
| `apps/portal-medspa/src/app/dashboard/patients/[id]/risk-panel.tsx` | Risk panel component showing color-coded flags, severity badges, recommended actions |
| Wire into patient detail page | UI integration |
| Add empty state ("No risk factors detected") + loading state | UX completeness |

> **Skill:** `add-feature` (mode=production) — UI + API integration
> **Skills:** `add-empty-error-states` — empty/error/loading states, `polish-ui` — UX checklist
> **Subagents:** `nextjs-developer` — Next.js route, `react-specialist` — risk panel component

### Step 8: Tests

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/rules-engine/__tests__/no-show-risk.test.ts` | Test rule 1 with synthetic data |
| `packages/intelligence/src/rules-engine/__tests__/churn-risk.test.ts` | Test rule 2 |
| `packages/intelligence/src/rules-engine/__tests__/revenue-drop.test.ts` | Test rule 3 |
| `packages/intelligence/src/rules-engine/__tests__/package-abandonment.test.ts` | Test rule 4 |
| `packages/intelligence/src/rules-engine/__tests__/inventory-expiry.test.ts` | Test rule 5 |
| `packages/intelligence/src/rules-engine/__tests__/follow-up-gap.test.ts` | Test rule 6 |
| `packages/intelligence/src/rules-engine/__tests__/evaluate.test.ts` | Test orchestrator (aggregation, custom rule sets) |
| `apps/connect-api/src/app/api/v1/intelligence/__tests__/risk-score.test.ts` | Endpoint test |

> **Skill:** `write-tests` — test coverage for all rules + endpoint
> **Subagent:** `test-automator` — test design

### Step 9: Documentation

| Task | Deliverable |
|------|------------|
| `packages/intelligence/README.md` | Quick start, API, rule reference table, pricing ($99-199/mo add-on, activated Phase 5) |
| `apps/connect-api/docs/openapi.yaml` — update | Add `/api/v1/intelligence/risk-score` with request/response schemas, error codes |
| `docs/INTELLIGENCE_GUIDE.md` | Developer guide: how rules work, how to add custom rules, how data flows |

> **Skill:** `sync-docs` — update existing docs + create new ones
> **Subagent:** `documentation-engineer` — API docs

### 3A Gate Checklist
- [ ] `packages/intelligence` package created and registered
- [ ] All 6 rules implemented and individually tested
- [ ] `evaluateRisk()` orchestrator tested
- [ ] Migration 0012 creates synthetic test data
- [ ] Connect API endpoint live + documented in OpenAPI
- [ ] Med spa portal shows risk panel on patient detail page
- [ ] All tests pass (`pnpm test`)
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)

---

## Sub-phase 3B: Home Services Portal

**Goal:** Build a full home services portal (HVAC/Plumbing/Cleaning) using existing `packages/core` modules to prove vertical-agnosticism.

### Step 1: Audit Core for Vertical-Agnosticism

| Task | Deliverable |
|------|------------|
| Grep `packages/core` for med-spa-specific strings (`patient`, `treatment`, `injectable`, `medspa`) | Audit report |
| Verify `packages/ui` components accept generic props (no hardcoded labels) | Audit report |
| Verify `packages/patterns` components are configurable | Audit report |
| Document any findings that block home services usage | Blocker list |

> **Skill:** `audit` — codebase audit for vertical-specific coupling
> **Subagent:** `code-reviewer` — independent review of abstraction quality

### Step 2: Make RBAC Configurable (Backward-Compatible)

The current RBAC uses hardcoded `Role = 'owner' | 'staff' | 'patient'`. Home services needs different roles (`owner`, `technician`, `dispatch`, `customer`). This refactor must NOT break the med spa portal.

| Task | Deliverable |
|------|------------|
| `packages/core/src/rbac/factory.ts` — `createRBAC<TRoles extends string>(config: RBACConfig<TRoles>)` | Factory function |
| `packages/core/src/rbac/index.ts` — keep existing `getPermissions`/`canPerform` as defaults using the `owner/staff/patient` config | Backward compatibility |
| Export `createRBAC` for verticals that need custom roles | New export |
| Med spa portal: unchanged (uses default RBAC) | No breaking changes |
| Home services portal: uses `createRBAC({ roles: ['owner', 'technician', 'dispatch', 'customer'], permissions: {...} })` | Custom config |

> **Skill:** `modify-feature` (mode=production) — modifying existing RBAC without breaking consumers
> **Skill:** `realign` — the role vocabulary is changing for a new vertical (not a rename of existing — additive)
> **Subagent:** `refactoring-specialist` — backward-compatible refactor

### Step 3: Create Home Services App Scaffold

| Task | Deliverable |
|------|------------|
| `apps/portal-homeservices/` — Next.js 14 app | App scaffold |
| `package.json` — depends on `@baseplate/core`, `@baseplate/ui`, `@baseplate/patterns`, `@baseplate/hooks` | Dependencies |
| `tsconfig.json`, `next.config.js`, `tailwind.config.ts` | Config files |
| `.env.local.example` | Env template |
| Run `pnpm install` | Register workspace |

> **Skill:** `add-feature` (mode=fast) — app scaffolding
> **Subagent:** `nextjs-developer` — Next.js setup

### Step 4: Build Home Services Portal Features

Mirror the med spa portal structure but with home services domain language and features.

| Feature | Med Spa Equivalent | Home Services Version |
|---------|-------------------|----------------------|
| Auth (login/signup) | Same | Same (uses `@baseplate/core/auth`) |
| Dashboard | Revenue, appointments, intake rate | Job revenue, dispatch status, completion rate |
| Customers | Patients | Customers (home owners) |
| Service Requests | Intake Forms | Service request forms (issue type, urgency, photos) |
| Scheduling/Dispatch | Provider + Room scheduling | Technician + Job site scheduling |
| Invoices | Payment links | Invoice management (line items, materials, labor) |
| Job Costing | — (N/A) | Material costs + labor hours + margin calculator |
| Notifications | Email/SMS reminders | Same (uses Connect API) |
| Reporting | Treatment metrics | Job metrics (revenue per technician, avg job time, completion rate) |
| Audit Logs | Same | Same (uses `@baseplate/core/audit-logs`) |
| RBAC | owner/staff/patient | owner/technician/dispatch/customer (uses `createRBAC()`) |

| Task | Deliverable |
|------|------------|
| Layout + sidebar + middleware | Navigation shell |
| Auth pages (login, signup, callback) | Auth flow |
| Dashboard page with KPIs | Metrics overview |
| Customers page (list, detail) | Customer management |
| Service requests (list, create, detail) | Request management |
| Dispatch calendar (technician + job site) | Scheduling |
| Invoices (create, list, detail) | Billing |
| Job costing page | Cost tracking |
| Reporting page | Analytics |
| Audit logs page | Compliance |

> **Skill:** `add-feature` (mode=production) — full portal build
> **Skills:** `polish-ui` (each page), `add-empty-error-states` (each data-driven page)
> **Subagents:** `nextjs-developer` (routes/pages), `react-specialist` (components), `ui-designer` (layout)

### Step 5: Home Services Connect Endpoints

| Task | Deliverable |
|------|------------|
| `POST /api/v1/jobs/cost-calc` — calculate job cost (materials + labor + margin) | New endpoint |
| `POST /api/v1/jobs/dispatch-schedule` — schedule technician dispatch | New endpoint |
| `POST /api/v1/reporting/job-metrics` — job revenue, completion rate, avg job time | New endpoint |
| Add all 3 to OpenAPI spec | API docs |

> **Skill:** `add-feature` (mode=production) — new API endpoints
> **Subagent:** `api-designer` — endpoint design

### Step 6: Verify Abstraction (<5% Core Modification)

| Task | Deliverable |
|------|------------|
| Run `git diff` on `packages/core` between 3B start and end | Modification report |
| Calculate % of `packages/core` files modified | Metric |
| If >5%: document what changed and why, assess whether refactor is needed | Assessment |
| If <5%: gate passed — core is truly vertical-agnostic | Gate pass |

> **Skill:** `audit` — verify abstraction integrity
> **Subagent:** `architect-reviewer` — architecture review

### Step 7: Tests + Build Verification

| Task | Deliverable |
|------|------------|
| Test suite for home services portal (auth, CRUD, scheduling) | Tests |
| `pnpm typecheck` — all packages including new portal | Typecheck |
| `pnpm test` — all tests pass | Test run |
| `pnpm build` — all apps build including new portal | Build |

> **Skill:** `write-tests` — test coverage
> **Skill:** `check-pr-readiness` — full gauntlet before declaring 3B done
> **Subagent:** `test-automator` — test design

### 3B Gate Checklist
- [ ] Core audit completed — no blockers found
- [ ] RBAC `createRBAC()` factory implemented (backward-compatible)
- [ ] Home services portal scaffolded and registered
- [ ] All 10 feature pages built and functional
- [ ] 3 new Connect API endpoints (job-cost, dispatch, job-metrics)
- [ ] Core modification <5% verified
- [ ] All tests pass
- [ ] Typecheck passes
- [ ] Build succeeds (portal-homeservices appears in build output)

---

## Sub-phase 3C: Marketplace Framework

**Goal:** Build the framework for a third-party module marketplace with 20% take-rate billing.

> **Note:** No detailed build instructions exist in Phase 3 planning docs. This sub-phase is designed from scratch based on the marketplace mandate.

### Step 1: Module Manifest Format

| Task | Deliverable |
|------|------------|
| Define `ModuleManifest` type: `{ id, name, description, version, author, vertical, category, dependencies, pricing, entryPoint }` | Type definition |
| `.baseplate/module.json` — manifest file format that module authors create | Spec |
| JSON schema for validation | Schema |

> **Skill:** `add-feature` (mode=balanced) — designing a new format
> **Subagent:** `api-designer` — manifest schema design

### Step 2: Create Marketplace Package

| Task | Deliverable |
|------|------------|
| `packages/marketplace/` — workspace package | Package scaffold |
| `packages/marketplace/src/registry.ts` — module registry (list, search, filter by vertical/category) | Registry logic |
| `packages/marketplace/src/installer.ts` — module installation interface (validate manifest, check deps, register) | Installer logic |
| `packages/marketplace/src/types.ts` — marketplace types | Type definitions |

> **Skill:** `add-feature` (mode=production) — new package with real logic
> **Subagent:** `backend-developer` — registry + installer design

### Step 3: Database Migration

| Task | Deliverable |
|------|------------|
| `supabase/migrations/0013_marketplace.sql` | Schema for `marketplace_modules`, `marketplace_module_versions`, `marketplace_subscriptions` |
| `marketplace_modules`: id, slug, name, description, author_id, vertical, category, pricing_model, price_cents, status, created_at | Modules table |
| `marketplace_subscriptions`: id, clinic_id, module_id, stripe_subscription_id, status, activated_at | Subscriptions table |
| RLS policies (clinics can see published modules, manage own subscriptions) | Security |

> **Skill:** `add-migration` (additive) — new tables
> **Subagent:** `postgres-pro` — schema design, `security-auditor` — RLS policies

### Step 4: Connect API Endpoints

| Task | Deliverable |
|------|------------|
| `GET /api/v1/marketplace/modules` — list/search modules (filter by vertical, category, price) | List endpoint |
| `GET /api/v1/marketplace/modules/[id]` — get module details | Detail endpoint |
| `POST /api/v1/marketplace/install` — subscribe a clinic to a module | Install endpoint |
| `DELETE /api/v1/marketplace/install/[id]` — unsubscribe | Remove endpoint |
| Add all endpoints to OpenAPI spec | API docs |

> **Skill:** `add-feature` (mode=production) — CRUD endpoints with auth
> **Skill:** `audit-authz` — verify ownership/clinic scoping on all endpoints
> **Subagent:** `api-designer` — endpoint design

### Step 5: Stripe Connect Skeleton (20% Take-Rate)

| Task | Deliverable |
|------|------------|
| Stripe Connect Express account creation flow (for module authors) | Onboarding skeleton |
| Payment split logic: 80% to module author, 20% to platform | Split calculation |
| Webhook handler for marketplace payments | Webhook skeleton |
| **NOT activated** — skeleton only, no real payments until Phase 5 | Deferred state |

> **Skill:** `modify-feature` (mode=balanced) — extending existing Stripe integration
> **Subagent:** `payment-integration` — Stripe Connect expertise

### Step 6: Portal Admin UI (Module Browser)

| Task | Deliverable |
|------|------------|
| `apps/portal-medspa/src/app/dashboard/marketplace/page.tsx` | Module browser page |
| Module card component (name, description, author, price, install button) | Card component |
| Installed modules list | Management UI |
| Empty state ("No modules available yet") | Empty state |

> **Skill:** `add-feature` (mode=balanced) — UI page
> **Skills:** `polish-ui`, `add-empty-error-states`
> **Subagent:** `react-specialist` — component design

### Step 7: Tests + Docs

| Task | Deliverable |
|------|------------|
| `packages/marketplace/src/__tests__/` — registry, installer tests | Module tests |
| Connect API marketplace endpoint tests | Endpoint tests |
| `packages/marketplace/README.md` | Package docs |
| `docs/MARKETPLACE_GUIDE.md` — how to author, publish, and install modules | Developer guide |

> **Skill:** `write-tests` + `sync-docs`
> **Subagent:** `documentation-engineer` — marketplace guide

### 3C Gate Checklist
- [ ] Module manifest format defined
- [ ] `packages/marketplace` package created
- [ ] Migration 0013 creates marketplace tables with RLS
- [ ] 4 Connect API endpoints (list, detail, install, uninstall)
- [ ] Stripe Connect skeleton (not activated)
- [ ] Portal marketplace browser page
- [ ] All tests pass
- [ ] Docs complete

---

## Sub-phase 3D: MCP Server

**Goal:** Build an MCP (Model Context Protocol) server that exposes Baseplate operations to AI agents (Claude Desktop, other MCP clients).

> **Note:** No detailed build instructions exist in Phase 3 planning docs. This sub-phase is designed from scratch using the `mcp-builder` skill.

### Step 1: Create MCP Server App

| Task | Deliverable |
|------|------------|
| `apps/mcp-server/` — standalone Node.js/TypeScript app | App scaffold |
| `package.json` — depends on `@modelcontextprotocol/sdk`, `@baseplate/core`, `@baseplate/intelligence` | Dependencies |
| `tsconfig.json` | TypeScript config |
| `src/index.ts` — MCP server entry point (stdio transport) | Entry point |

> **Skill:** `mcp-builder` (General Skills) — 4-phase MCP server creation
> **Subagent:** `mcp-developer` — MCP expertise

### Step 2: Define MCP Tool Schemas

Map Baseplate Connect API operations to MCP tools that AI agents can call.

| MCP Tool | Wraps | Input | Output |
|----------|-------|-------|--------|
| `create_appointment` | Scheduling module | customerId, providerId, time, duration | appointmentId |
| `send_sms_reminder` | `POST /v1/communications/sms-reminder` | customerPhone, customerName, appointmentTime, clinicName | messageId |
| `deduct_package` | `POST /v1/billing/package-deduct` | packageId, customerId, tenantId | remainingSessions |
| `get_treatment_metrics` | `POST /v1/reporting/treatment-metrics` | tenantId, from?, to?, groupBy? | metrics[] |
| `get_risk_score` | `POST /v1/intelligence/risk-score` | tenantId, customerId? | riskLevel, flags[] |
| `list_patients` | Core patients module | tenantId, search? | patients[] |
| `get_patient` | Core patients module | tenantId, customerId | patient detail |
| `create_patient` | Core patients module | tenantId, name, phone, email | customerId |

| Task | Deliverable |
|------|------------|
| `src/tools/` — one file per tool with JSON schema + handler | Tool definitions |
| `src/tools/index.ts` — tool registry | Registration |

> **Skill:** `mcp-builder` — tool definition phase
> **Subagent:** `mcp-developer` — tool schema design

### Step 3: Implement Auth & Clinic Scoping

| Task | Deliverable |
|------|------------|
| API-key authentication (same `CONNECT_API_KEY` pattern) | Auth middleware |
| Clinic scoping — every tool call requires `tenantId`, validated against API key | Scope enforcement |
| Error responses follow MCP error format | Error handling |

> **Skill:** `audit-authz` — verify every tool has auth + scoping
> **Subagent:** `security-auditor` — auth review

### Step 4: SSE Transport (Remote Access)

| Task | Deliverable |
|------|------------|
| `src/sse-server.ts` — HTTP SSE transport for remote access | SSE endpoint |
| Same tool registry, different transport | Dual transport |

> **Skill:** `add-feature` (mode=balanced) — transport layer
> **Subagent:** `backend-developer` — SSE implementation

### Step 5: Tests + Docs

| Task | Deliverable |
|------|------------|
| `src/__tests__/` — tool tests (mock Connect API) | Tests |
| `apps/mcp-server/README.md` — setup, Claude Desktop config, tool reference | Docs |
| `apps/mcp-server/claude-desktop-config.json` — example config | Config example |

> **Skill:** `write-tests` + `sync-docs`
> **Subagent:** `documentation-engineer` — MCP server docs

### 3D Gate Checklist
- [ ] MCP server app created and registered
- [ ] 8 MCP tools defined with JSON schemas
- [ ] API-key auth + clinic scoping on every tool
- [ ] stdio transport working (Claude Desktop)
- [ ] SSE transport working (remote access)
- [ ] All tests pass
- [ ] README + Claude Desktop config example

---

## Sub-phase 3E: ML Scaffolding

**Goal:** Define ML model interfaces and stub implementations so that once real pilot data exists (Phase 5), models can be trained and dropped in without architectural changes.

### Step 1: Define Model Interfaces

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/predictions/types.ts` — `PredictionModel<TInput, TOutput>` interface | Interface |
| `PredictionModel { train(data: TrainingData): Promise<void>; predict(input: TInput): Promise<TOutput>; evaluate(testData): Promise<Metrics>; isTrained: boolean }` | Model contract |
| `TrainingData`, `Metrics` (accuracy, precision, recall, F1) | Supporting types |

> **Skill:** `add-feature` (mode=balanced) — interface design
> **Subagent:** `ml-engineer` — ML interface design

### Step 2: Define Specific Predictor Interfaces

| Predictor | Input | Output |
|-----------|-------|--------|
| `NoShowPredictor` | Customer appointment history | `{ probability: number; confidence: number; factors: string[] }` |
| `ChurnPredictor` | Customer engagement + payment history | `{ probability: number; confidence: number; timeline: string }` |
| `RevenuePredictor` | Tenant historical revenue + seasonality | `{ projected: number; confidence: number; trend: 'up' \| 'down' \| 'flat' }` |

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/predictions/no-show-predictor.ts` | Interface + stub |
| `packages/intelligence/src/predictions/churn-predictor.ts` | Interface + stub |
| `packages/intelligence/src/predictions/revenue-predictor.ts` | Interface + stub |

> **Skill:** `add-feature` (mode=balanced) — stub implementations
> **Subagent:** `ml-engineer` — predictor design

### Step 3: Heuristic Fallbacks (Rules-Based)

Each predictor falls back to the rules-engine when no trained model exists.

| Task | Deliverable |
|------|------------|
| Each stub's `predict()` calls the corresponding rules-engine evaluator as fallback | Fallback logic |
| `isTrained` returns `false` until real model is loaded | Training flag |
| Log a warning when using heuristic fallback (so Phase 5 can measure when ML kicks in) | Observability |

> **Skill:** `add-observability` — log heuristic fallback usage
> **Subagent:** `data-engineer` — heuristic design

### Step 4: Feature Extraction Interfaces

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/predictions/features.ts` — `FeatureExtractor` interface | Interface |
| Extractors for: appointment features, payment features, engagement features, seasonal features | Feature functions |
| Returns normalized feature vectors ready for model training | Output format |

> **Skill:** `add-feature` (mode=balanced) — data pipeline interfaces
> **Subagent:** `data-engineer` — feature engineering

### Step 5: Training Pipeline Interface

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/predictions/training.ts` — `trainModel(type, data)` function | Training interface |
| Model registry (`registerModel`, `getActiveModel`) — so Phase 5 can register trained models | Registry |
| Evaluation hooks — `evaluateModel(type, testData)` returns metrics | Evaluation |

> **Skill:** `add-feature` (mode=fast) — interface-only, no real training yet
> **Subagent:** `ml-engineer` — pipeline design

### Step 6: Tests + Docs

| Task | Deliverable |
|------|------------|
| `packages/intelligence/src/predictions/__tests__/` — test heuristic fallbacks, model registry, feature extractors | Tests |
| Update `packages/intelligence/README.md` — add ML section (interfaces, training pipeline, Phase 5 activation plan) | Docs |

> **Skill:** `write-tests` + `sync-docs`
> **Subagent:** `test-automator` — test design

### 3E Gate Checklist
- [ ] `PredictionModel` interface defined
- [ ] 3 predictor interfaces + heuristic stubs (NoShow, Churn, Revenue)
- [ ] Heuristic fallbacks call rules-engine
- [ ] Feature extraction interfaces defined
- [ ] Training pipeline interface + model registry
- [ ] All tests pass
- [ ] Docs updated

---

## Migration Summary

| Migration | Purpose | Sub-phase |
|-----------|---------|-----------|
| `0012_intelligence_seed.sql` | Synthetic test data for intelligence rules | 3A |
| `0013_marketplace.sql` | Marketplace modules + subscriptions tables | 3C |

---

## New Packages Summary

| Package | Purpose | Sub-phase |
|---------|---------|-----------|
| `@baseplate/intelligence` | Rules engine + ML scaffolding | 3A + 3E |
| `@baseplate/marketplace` | Module registry + installer | 3C |

## New Apps Summary

| App | Purpose | Sub-phase |
|-----|---------|-----------|
| `apps/portal-homeservices` | Home services vertical portal | 3B |
| `apps/mcp-server` | MCP server for AI agent integration | 3D |

---

## New Connect API Endpoints Summary

| Endpoint | Method | Purpose | Sub-phase |
|----------|--------|---------|-----------|
| `/api/v1/intelligence/risk-score` | POST | Get risk flags for a customer/tenant | 3A |
| `/api/v1/jobs/cost-calc` | POST | Calculate job cost (materials + labor + margin) | 3B |
| `/api/v1/jobs/dispatch-schedule` | POST | Schedule technician dispatch | 3B |
| `/api/v1/reporting/job-metrics` | POST | Job revenue, completion rate, avg job time | 3B |
| `/api/v1/marketplace/modules` | GET | List/search marketplace modules | 3C |
| `/api/v1/marketplace/modules/[id]` | GET | Get module details | 3C |
| `/api/v1/marketplace/install` | POST | Subscribe clinic to module | 3C |
| `/api/v1/marketplace/install/[id]` | DELETE | Unsubscribe from module | 3C |

---

## Skill Mapping Summary (Complete Reference)

### Agent Core Skills (37)

| Skill | Used In | Purpose |
|-------|---------|---------|
| `add-feature` | 3A.1, 3A.3, 3A.4, 3A.6, 3A.7, 3B.3, 3B.4, 3B.5, 3C.1, 3C.2, 3C.4, 3C.6, 3D.1, 3D.4, 3E.1-3E.5 | New features, endpoints, packages |
| `modify-feature` | 3B.2, 3C.5 | Modify existing RBAC, extend Stripe |
| `add-migration` | 3A.5, 3C.3 | Database schema changes |
| `write-tests` | 3A.8, 3B.7, 3C.7, 3D.5, 3E.6 | Test coverage |
| `add-observability` | 3E.3 | Log heuristic fallback usage |
| `add-empty-error-states` | 3A.7, 3B.4, 3C.6 | Empty/error/loading states |
| `polish-ui` | 3A.7, 3B.4, 3C.6 | UX checklist on UI changes |
| `audit` | 3B.1, 3B.6 | Codebase audit, abstraction verification |
| `audit-authz` | 3A.6, 3C.4, 3D.3 | Authorization checks on endpoints |
| `harden-types` | 3A.2 | Strict typing at intelligence boundaries |
| `realign` | 3B.2 | RBAC role vocabulary addition |
| `sync-docs` | 3A.9, 3C.7, 3D.5, 3E.6 | Update docs after code changes |
| `check-pr-readiness` | 3B.7 | Full gauntlet before gate |
| `commit` | After each step | Commit work |

### General Skills (28)

| Skill | Used In | Purpose |
|-------|---------|---------|
| `mcp-builder` | 3D.1, 3D.2 | 4-phase MCP server creation (tool definition) |
| `verification-before-completion` | After each sub-phase | Final checks before marking done |

### Claude Code Subagents (153)

| Subagent | Used In | Purpose |
|----------|---------|---------|
| `backend-developer` | 3A.1, 3A.4, 3C.2, 3D.4 | Package structure, query design, registry, SSE |
| `typescript-pro` | 3A.2 | Type design |
| `data-engineer` | 3A.3, 3A.5, 3E.3, 3E.4 | Data model, synthetic data, heuristics, features |
| `ai-engineer` | 3A.3 | Rule design for explainable AI |
| `api-designer` | 3A.6, 3B.5, 3C.1, 3C.4 | Endpoint design |
| `security-auditor` | 3A.6, 3C.3, 3D.3 | Auth review, RLS review |
| `nextjs-developer` | 3A.7, 3B.3, 3B.4 | Next.js routes and pages |
| `react-specialist` | 3A.7, 3B.4, 3C.6 | Component design |
| `test-automator` | 3A.8, 3B.7, 3E.6 | Test design |
| `documentation-engineer` | 3A.9, 3C.7, 3D.5 | API docs, guides |
| `code-reviewer` | 3B.1 | Independent review of abstraction |
| `refactoring-specialist` | 3B.2 | Backward-compatible RBAC refactor |
| `architect-reviewer` | 3B.6 | Architecture review |
| `postgres-pro` | 3C.3 | Schema design |
| `payment-integration` | 3C.5 | Stripe Connect expertise |
| `mcp-developer` | 3D.1, 3D.2 | MCP server + tool schemas |
| `ml-engineer` | 3E.1, 3E.2, 3E.5 | ML interface + pipeline design |
| `ui-designer` | 3B.4 | Layout design |

---

## Estimated Timeline (AI-Assisted)

| Sub-phase | Steps | Est. Hours | Cumulative |
|-----------|-------|------------|------------|
| 3A — Intelligence Layer | 9 | 15-20 | 15-20 |
| 3B — Home Services Portal | 7 | 20-25 | 35-45 |
| 3C — Marketplace Framework | 7 | 10-15 | 45-60 |
| 3D — MCP Server | 5 | 8-10 | 53-70 |
| 3E — ML Scaffolding | 6 | 5-8 | 58-78 |

> **Note:** AI-assisted timelines. Each sub-phase should end with `commit` + `MASTER_PROGRESS.md` update.

---

## Post-Phase 3 Artifacts

By the end of Phase 3, you will have:

- ✅ Rules-based intelligence API (6 rules, tested with synthetic data)
- ✅ Risk panel in med spa portal UI
- ✅ Home services portal fully built and tested (proves `packages/core` reusability)
- ✅ Configurable RBAC (`createRBAC()` factory)
- ✅ Marketplace framework (registry, installer, Connect API, Stripe Connect skeleton)
- ✅ MCP server (8 tools, stdio + SSE transport, Claude Desktop ready)
- ✅ ML scaffolding (predictor interfaces, heuristic fallbacks, training pipeline)
- ✅ 8 new Connect API endpoints
- ✅ 2 new migrations (synthetic data + marketplace tables)
- ✅ 2 new packages (`@baseplate/intelligence`, `@baseplate/marketplace`)
- ✅ 2 new apps (`portal-homeservices`, `mcp-server`)
- ✅ Complete documentation (READMEs, guides, OpenAPI updated)
- ✅ Validated moat: "Reusable core + Connect middleware + Intelligence" proven across 2 verticals

---

## What's Explicitly NOT in Phase 3

| Item | Deferred To | Why |
|------|------------|-----|
| ML model training | Phase 5 | Needs 50+ clinics × 6 months of real data |
| Marketplace go-live | Phase 5 | No customers exist yet |
| Home services customer onboarding | Phase 5 | Build-first model |
| Stripe Connect real payments | Phase 5 | No module authors or customers yet |
| Intelligence pricing activation | Phase 5 | No Connect customers to upsell to |
| Third vertical | Phase 6+ | Two verticals proves the model; third is scaling |
