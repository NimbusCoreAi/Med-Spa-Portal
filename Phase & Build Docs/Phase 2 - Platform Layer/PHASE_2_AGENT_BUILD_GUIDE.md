# Phase 2 — Agent Build Guide

> **Purpose:** Step-by-step build guide for an AI agent to complete Phase 2 (Platform Layer).
> All decisions are locked. Every file change is specified with full code.
> Work top to bottom. Run the Verify block after each step. Commit after each step.
>
> **Source:** `Phase & Build Docs/Phase 2 - Platform Layer/PHASE_2_EXECUTION_PLAN.md`
> **Track progress in:** `MASTER_PROGRESS.md` + `MASTER_MANUAL_CONFIG.md`
>
> **Base directory:** `Med Spa App/` (all relative paths below are from this directory unless noted)
>
> **Corrections from source plan:** Zod version fixed (^4.4.3 not ^3.22.0), RBAC grep scope
> narrowed to 3 files (middleware/sidebar use hardcoded role checks, not permission keys),
> Connect API tsconfig provided, migration 0010 SQL provided, portal wiring made explicit.

---

## Prerequisites

- [x] Phase 1 code complete (203 tests, 10/10 packages typecheck, 24 routes build)
- [ ] Phase 1 staging smoke test passed ← **verify before starting**
- [ ] Working `.env.local` in `apps/portal-medspa/`
- [ ] All 8 migrations run on staging Supabase

---

## Skill Routing

> **Read this section before starting any step.** It tells you which skills and subagents to use, where to find them, and what additional instructions to pass.

### How the Skill System Works

| Type | What It Is | How to Invoke |
|------|-----------|---------------|
| **Skill** | A structured workflow with phases, gates, and verification | Load via the `skill` tool with the skill name (e.g., `add-feature`) |
| **Subagent** | A domain expert that runs in a fresh context window | Load via the `task` tool with `subagent_type: "explore"` or `"general"`, and reference the agent file in the prompt |

**Before any work session:** Run the Token Optimization Protocol from `CLAUDE.md` — audit context files, estimate token costs of files you'll read, delegate research to subagents. Skills live at:

```
Skills/
├── Agent Core Systems/plugins/agentsystem-core/skills/<name>/SKILL.md
├── Token Optimization/plugins/token-guard/skills/<name>/SKILL.md
├── General Skills/<name>/SKILL.md
├── Impeccable (Front End Design)/
└── Claude Code Subagents/categories/<category>/<name>.md
```

For brevity, this guide uses short names (e.g., `/add-feature`, `postgres-pro`). Full paths are in the table below.

### Session Management

Phase 2 is a long build (~15-20 hrs). Between sub-phases (2A→2B, 2B→2C, 2C→2D), consider running `session-handoff` (`Skills/Token Optimization/plugins/token-guard/skills/session-handoff/SKILL.md`) to generate a structured handoff summary, then `/clear` to reset context. This prevents context bloat from accumulating across all 18 steps.

### Master Routing Table

| Step | Primary Skill | Mode | Subagents (delegate for research/review) | Post-Step Skill |
|------|--------------|------|------------------------------------------|-----------------|
| **1** — Type Aliases | None (trivial edit — no skill needed) | — | — | — |
| **2** — RBAC Keys | Direct edit (3 files only) | — | `refactoring-specialist` (`06-developer-experience/refactoring-specialist.md`) — review the rename | `harden-types` (`Skills/Agent Core Systems/.../harden-types/SKILL.md`) — verify no `as` casts broke |
| **3** — Code Cleanup | `simplify` (`Skills/Agent Core Systems/.../simplify/SKILL.md`) | — | `code-reviewer` (`04-quality-security/code-reviewer.md`) — delegate the grep + review | — |
| **4** — README | None (direct writing) | — | `readme-generator` (`06-developer-experience/readme-generator.md`) — delegate to draft, then review | — |
| **5** — .env.example | None (trivial) | — | — | — |
| **6** — Scaffold Connect API | `add-feature` (`Skills/Agent Core Systems/.../add-feature/SKILL.md`) | `fast` | `nextjs-developer` (`02-language-specialists/nextjs-developer.md`) — review scaffold config; `api-designer` (`01-core-development/api-designer.md`) — review route structure | `simplify` |
| **7** — API-Key Auth | `add-feature` | `balanced` | `security-engineer` (`03-infrastructure/security-engineer.md`) — review auth implementation | `audit-authz` (`Skills/Agent Core Systems/.../audit-authz/SKILL.md`) — classify endpoints as "Service/internal", health as "Public" |
| **8** — SMS Endpoint | `add-feature` | `balanced` | `backend-developer` (`01-core-development/backend-developer.md`) — review endpoint logic | `add-observability` (`Skills/Agent Core Systems/.../add-observability/SKILL.md`) — log the Twilio boundary; `write-tests` (`Skills/Agent Core Systems/.../write-tests/SKILL.md`) |
| **9** — Package Deduct | `add-migration` + `add-feature` | `balanced` | `postgres-pro` (`05-data-ai/postgres-pro.md`) — review SQL migration + RLS policies | `audit-authz` — verify service-role client usage; `write-tests` — test deduct logic including edge cases |
| **10** — Metrics Endpoint | `add-feature` | `balanced` | `backend-developer` (`01-core-development/backend-developer.md`) — review aggregation logic | `audit-perf` (`Skills/Agent Core Systems/.../audit-perf/SKILL.md`) — check in-memory grouping loop for N+1 at scale; `add-observability` |
| **11** — Wire Portal | `modify-feature` (`Skills/Agent Core Systems/.../modify-feature/SKILL.md`) | `balanced` | `backend-developer` — review the refactored confirm route | `simplify` — review the diff for dead imports |
| **12** — Deploy | None (manual human task) | — | `devops-engineer` (`03-infrastructure/devops-engineer.md`) — delegate deployment guide review | `testing-plan` (`Skills/Agent Core Systems/.../testing-plan/SKILL.md`) — generate smoke test plan |
| **13** — Rate Limiting | `modify-feature` | `balanced` | `backend-developer` — review rate-limit middleware | `audit-authz` — verify rate-limit doesn't leak API key in error responses |
| **14** — OpenAPI Docs | None (direct writing) | — | `api-documenter` (`07-specialized-domains/api-documenter.md`) — delegate to draft spec, review accuracy | `sync-docs` (`Skills/Agent Core Systems/.../sync-docs/SKILL.md`) |
| **15** — Pricing + Usage | `add-migration` + `add-observability` | — | `payment-integration` (`07-specialized-domains/payment-integration.md`) — review Stripe product setup | — |
| **16** — Load Test | `audit-perf` | — | `performance-engineer` (`04-quality-security/performance-engineer.md`) — delegate the load test analysis | — |
| **17** — Cross-Vertical App | `add-feature` | `fast` | `nextjs-developer` (`02-language-specialists/nextjs-developer.md`); `typescript-pro` (`02-language-specialists/typescript-pro.md`) — verify type aliases compile | `write-tests` |
| **18** — Config Guide | None (direct writing) | — | `documentation-engineer` (`06-developer-experience/documentation-engineer.md`) — delegate to draft, review | `sync-docs` |
| **Every commit** | `commit` (`Skills/Agent Core Systems/.../commit/SKILL.md`) | — | — | — |
| **Every gate check** | `check-pr-readiness` (`Skills/Agent Core Systems/.../check-pr-readiness/SKILL.md`) | — | — | — |

### Key Notes for Specific Skills

**`add-feature` with `mode=fast`** (Steps 6, 17): Skips clarify, plan-gate, and reviews. Safe for scaffolding and test apps that don't touch auth/payments/schema. The skill's frontmatter is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-feature/SKILL.md`.

**`add-feature` with `mode=balanced`** (Steps 7, 8, 10): Runs clarify + implement + verify + tests but skips the plan-approval gate. Good for endpoint builds where the design is already specified in this guide.

**`add-migration`** (Steps 9, 15): Classifies the change first (ADDITIVE/MUTATING/DESTRUCTIVE). All Phase 2 migrations are ADDITIVE (new tables only — no existing columns touched). The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-migration/SKILL.md`.

**`audit-authz`** (Steps 7, 9, 13): This skill scans every server-side handler for missing auth. For Connect API endpoints, classify them as **"Service/internal"** (authenticated via `X-API-Key` header, not user session). The `/api/health` endpoint is intentionally **"Public"**. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/audit-authz/SKILL.md`.

**`audit-perf`** (Step 10, 16): For the treatment-metrics endpoint, tell the skill to check the **in-memory grouping loop** — it iterates all appointments which could be slow with large datasets. Also check for missing indexes on `clinic_id + scheduled_time` compound queries. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/audit-perf/SKILL.md`.

**`modify-feature`** (Steps 11, 13): Lighter than `add-feature`. Maps which contracts shift before editing. For Step 11, the contract shift is: portal's confirm route changes from calling `@baseplate/twilio` directly to calling the Connect API. For Step 13, the contract shift is: all 3 endpoints gain rate-limit checks before their logic. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/modify-feature/SKILL.md`.

**`add-observability`** (Steps 8, 10, 15): Instruments integration boundaries (HTTP calls to Twilio, Supabase queries) with structured logging. Tell the skill the boundaries are: Twilio API calls in the SMS endpoint, Supabase queries in the metrics endpoint, and the `api_usage` table insert in the usage logger. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-observability/SKILL.md`.

**`commit`** (every step): Groups changes into logically-ordered commits and runs a pre-flight quality gate. Use instead of raw `git commit` — it catches secrets, residue (`console.log`), and typecheck failures before committing. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/commit/SKILL.md`.

**`check-pr-readiness`** (every gate check): Runs typecheck, lint, test, and a residue sweep. Use at each sub-phase gate (2A, 2B, 2C, 2D) and the final gate. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/check-pr-readiness/SKILL.md`.

**`write-tests`** (Steps 8, 9, 17): Detects existing test harness (Jest) and writes tests that inherit naming/mocking conventions. For the packages module (Step 9), note the **read-modify-write race condition** in `deductPackageSession` — the test should cover concurrent deduction edge cases. The skill is at `Skills/Agent Core Systems/plugins/agentsystem-core/skills/write-tests/SKILL.md`.

### Subagent Delegation Tips

- **Always request cheaper models for subagents** when the task is simple (e.g., "Use Haiku for this sub-agent" for README drafting).
- **Research and code review should always be delegated** — the result comes back without polluting your main session.
- **Implementation that changes files should be done in the main session**, not delegated.
- Subagent files are at `Skills/Claude Code Subagents/categories/<category>/<name>.md`. Include the full file path in the Task tool prompt so the agent can read the subagent's system prompt.

---

## Phase 2 Overview

| Sub-phase | Steps | Est. Time | What Happens |
|-----------|-------|-----------|--------------|
| 2A — Generalization | 1-5 | ~3 hrs | Type aliases, RBAC key rename, cleanup, README, .env.example |
| 2B — Connect API | 6-12 | ~8 hrs | Scaffold app, auth, 3 endpoints, portal wiring, deploy |
| 2C — Hardening | 13-16 | ~5 hrs | Rate limiting, OpenAPI docs, pricing prep, load test |
| 2D — Cross-Vertical | 17-18 | ~3 hrs | Home services test app, config guide |

---

## Phase 2A: Light Generalization + Repo Prep

---

### Step 1: Add Multi-Vertical Type Aliases

> **Purpose:** Let other verticals use generic terms without renaming existing types. Zero runtime cost — TypeScript erases them at compile time.
>
> **Skills:** None needed — this is a trivial type-only addition (4 lines). Just edit, typecheck, commit.

**File:** `packages/core/src/types/index.ts`

Add these aliases at the **bottom** of the file, after all existing interfaces:

```typescript
// ─── Multi-Vertical Type Aliases ───────────────────────────────
export type Tenant = Clinic;
export type Customer = Patient;
export type Resource = Provider;
export type Space = Room;
```

**File:** `packages/core/src/index.ts`

Add to the re-exports from `./types` (add to the existing `export type { ... } from './types'` line or add a new line):

```typescript
export type { Tenant, Customer, Resource, Space } from './types';
```

#### Verify
- [ ] `pnpm typecheck` (run from `Med Spa App/`) — all packages pass

#### Commit

> **Tip:** Instead of raw `git commit`, you can run the `commit` skill (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/commit/SKILL.md`) which runs a pre-flight quality gate (secrets scan, residue sweep, typecheck) before committing. Use it for every step in this guide.

```bash
git add -A && git commit -m "feat: add multi-vertical type aliases (Tenant/Customer/Resource/Space)"
```

---

### Step 2: Generalize RBAC Permission Keys

> **Purpose:** Remove med-spa-specific naming from permission keys.
>
> **Skills:** Direct edit (3 files only — scope is tightly bounded, no skill workflow needed). After editing, optionally run `harden-types` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/harden-types/SKILL.md`) to verify no `as` casts or type gaps were introduced by the key rename.
>
> **Subagent:** Delegate the renamed-key audit to `refactoring-specialist` (`Skills/Claude Code Subagents/categories/06-developer-experience/refactoring-specialist.md`) — have it grep the entire codebase for any lingering references to `canViewAllPatients`, `canCreateStaff`, `canDeleteStaff` that were missed.
>
> **IMPORTANT — Scope Correction:** The old keys (`canViewAllPatients`, `canCreateStaff`, `canDeleteStaff`) only exist in **3 files**. The middleware (`middleware.ts`) and sidebar (`DashboardSidebar.tsx`) use hardcoded `role === 'owner'` checks — they do NOT reference permission keys and do NOT need changes.

> **Known Gap (flagged, not fixed):** The middleware and sidebar bypass the centralized RBAC system, using string comparison instead of `canPerform()`. This is a pre-existing issue from Phase 1. Do NOT fix it during Phase 2 — note it for a future refactor.

**Changes:** Rename 3 keys, merge 2 into 1:

| Old Key | New Key | Notes |
|---------|---------|-------|
| `canViewAllPatients` | `canViewAllRecords` | Generic term |
| `canCreateStaff` | `canManageStaff` | Merges create+delete into one |
| `canDeleteStaff` | _(removed)_ | Merged into `canManageStaff` |

**File:** `packages/core/src/rbac/types.ts` — replace entire contents:

```typescript
export type Role = 'owner' | 'staff' | 'patient';

export interface Permission {
  canViewAllRecords: boolean;
  canViewAllAppointments: boolean;
  canViewAllPayments: boolean;
  canViewAuditLogs: boolean;
  canManageStaff: boolean;
  canCreateAppointment: boolean;
  canViewOwnData: boolean;
}
```

**File:** `packages/core/src/rbac/index.ts` — replace entire contents:

```typescript
import { Role, Permission } from './types';

const PERMISSIONS: Record<Role, Permission> = {
  owner: {
    canViewAllRecords: true,
    canViewAllAppointments: true,
    canViewAllPayments: true,
    canViewAuditLogs: true,
    canManageStaff: true,
    canCreateAppointment: true,
    canViewOwnData: true,
  },
  staff: {
    canViewAllRecords: true,
    canViewAllAppointments: true,
    canViewAllPayments: true,
    canViewAuditLogs: false,
    canManageStaff: false,
    canCreateAppointment: true,
    canViewOwnData: true,
  },
  patient: {
    canViewAllRecords: false,
    canViewAllAppointments: false,
    canViewAllPayments: false,
    canViewAuditLogs: false,
    canManageStaff: false,
    canCreateAppointment: false,
    canViewOwnData: true,
  },
};

export function getPermissions(role: Role): Permission {
  return PERMISSIONS[role];
}

export function canPerform(role: Role, action: keyof Permission): boolean {
  return PERMISSIONS[role][action];
}

export type { Role, Permission };
```

**File:** `packages/core/src/rbac/__tests__/rbac.test.ts` — replace entire contents:

```typescript
import { getPermissions, canPerform } from '../index';

describe('RBAC', () => {
  describe('getPermissions', () => {
    it('returns all permissions for owner', () => {
      const perms = getPermissions('owner');
      expect(perms.canViewAllRecords).toBe(true);
      expect(perms.canViewAllAppointments).toBe(true);
      expect(perms.canViewAllPayments).toBe(true);
      expect(perms.canViewAuditLogs).toBe(true);
      expect(perms.canManageStaff).toBe(true);
      expect(perms.canCreateAppointment).toBe(true);
      expect(perms.canViewOwnData).toBe(true);
    });

    it('returns limited permissions for staff', () => {
      const perms = getPermissions('staff');
      expect(perms.canViewAllRecords).toBe(true);
      expect(perms.canViewAllAppointments).toBe(true);
      expect(perms.canViewAllPayments).toBe(true);
      expect(perms.canViewAuditLogs).toBe(false);
      expect(perms.canManageStaff).toBe(false);
      expect(perms.canCreateAppointment).toBe(true);
      expect(perms.canViewOwnData).toBe(true);
    });

    it('returns minimal permissions for patient', () => {
      const perms = getPermissions('patient');
      expect(perms.canViewAllRecords).toBe(false);
      expect(perms.canViewAllAppointments).toBe(false);
      expect(perms.canViewAllPayments).toBe(false);
      expect(perms.canViewAuditLogs).toBe(false);
      expect(perms.canManageStaff).toBe(false);
      expect(perms.canCreateAppointment).toBe(false);
      expect(perms.canViewOwnData).toBe(true);
    });
  });

  describe('canPerform', () => {
    it('returns true when permission is granted', () => {
      expect(canPerform('owner', 'canViewAuditLogs')).toBe(true);
    });

    it('returns false when permission is denied', () => {
      expect(canPerform('staff', 'canViewAuditLogs')).toBe(false);
    });
  });
});
```

#### Verify
- [ ] `pnpm typecheck` — all packages pass
- [ ] `pnpm test` — all tests pass (RBAC tests should show new key names)

#### Commit
```bash
git add -A && git commit -m "refactor: generalize RBAC permission keys (canViewAllRecords, canManageStaff)"
```

---

### Step 3: Code Cleanup

> **Purpose:** Remove pilot references, debug code, and stale comments before the repo goes open-source.
>
> **Skills:** Run `simplify` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/simplify/SKILL.md`) to review the diff for code smells, dead code, and naming issues after cleanup. This is exactly the kind of task it's designed for.
>
> **Subagent:** Delegate the grep + review pass to `code-reviewer` (`Skills/Claude Code Subagents/categories/04-quality-security/code-reviewer.md`) — give it the 4 grep commands below and have it report every finding for triage. Use a cheaper model (Haiku) since this is pattern-matching, not deep analysis.

Run these searches across `Med Spa App/` and review/fix each finding:

```bash
# Search for pilot-specific references, TODOs, and debug code
grep -rn "pilot\|test_\|TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" packages/ apps/ | grep -v node_modules | grep -v __tests__ | grep -v ".test."
```

```bash
# Check for hardcoded UUIDs in non-test files
grep -rn "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" --include="*.ts" --include="*.tsx" packages/ apps/ | grep -v node_modules | grep -v __tests__ | grep -v ".test." | grep -v ".env"
```

```bash
# Check for console.log/debug in production source
grep -rn "console\.\(log\|debug\)" --include="*.ts" --include="*.tsx" packages/ apps/ | grep -v node_modules | grep -v __tests__ | grep -v ".test."
```

```bash
# Check for potential secrets in source files
grep -rn "sk_live_\|sk_test_\|AC[0-9a-f]\|password\s*=\|secret\s*=" --include="*.ts" --include="*.tsx" packages/ apps/ | grep -v node_modules | grep -v __tests__ | grep -v ".test." | grep -v ".env"
```

For each finding:
- **TODO/FIXME/HACK/XXX** → resolve or remove
- **Hardcoded UUIDs** → replace with dynamic values or constants
- **console.log/debug** → remove (keep console.error/console.warn if they serve as error logging)
- **Secrets** → remove immediately, move to env vars

#### Verify
- [ ] `pnpm typecheck` — all packages pass
- [ ] `pnpm test` — all tests pass

#### Commit
```bash
git add -A && git commit -m "chore: code cleanup — remove debug statements, TODOs, pilot references"
```

---

### Step 4: Root README

> **Purpose:** Comprehensive README for when the repo goes open-source in Phase 4.
>
> **Skills:** None needed — this is direct writing. After writing, run `sync-docs` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/sync-docs/SKILL.md`) to verify the README's module count and tech stack match the actual codebase.
>
> **Subagent:** Delegate the initial draft to `readme-generator` (`Skills/Claude Code Subagents/categories/06-developer-experience/readme-generator.md`) — give it the file structure and let it draft. Then review and finalize in the main session. Use a cheaper model.

**File:** `Med Spa App/README.md`

```markdown
# Baseplate — AI-Built B2B SaaS Platform

> Open-source monorepo for building vertical-specific SaaS applications.
> Med Spa portal is the first vertical. Built to generalize.

## Quick Start

```bash
git clone <repo-url>
cd baseplate
pnpm install
cp apps/portal-medspa/.env.local.example apps/portal-medspa/.env.local
# Fill in .env.local with Supabase, Stripe, Postmark, Twilio keys
pnpm dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, React 18, Tailwind CSS |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| API | Connect API (separate Next.js app, API-key auth) |
| Payments | Stripe |
| Email | Postmark |
| SMS | Twilio |
| Auth | Supabase Auth + @supabase/ssr |
| Hosting | Railway |

## Architecture

```
apps/
  portal-medspa/          # Next.js 14 — Med Spa portal
  connect-api/            # Next.js 14 — Connect API (API-key auth)
packages/
  core/                   # @baseplate/core — 17 modules
  ui/                     # @baseplate/ui — 6 components
  patterns/               # @baseplate/patterns — 6 patterns
  hooks/                  # @baseplate/hooks — useApiQuery, useApiMutation
  next-api/               # @baseplate/next-api — route handler factories
  dates/                  # @baseplate/dates — date utilities
  integrations/
    stripe/               # @baseplate/stripe
    postmark/             # @baseplate/postmark
    twilio/               # @baseplate/twilio
supabase/
  migrations/             # SQL migrations (0001-0010)
docs/
  HIPAA_COMPLIANCE.md
```

## Module Library

| Package | Modules | Purpose |
|---------|---------|---------|
| @baseplate/core | 17 | Auth, RBAC, audit, encryption, scheduling, intake, payments, reporting, errors, bookings, availability, notifications, utils, config, types, clinics, packages |
| @baseplate/ui | 6 | Button, Input, Form, Table, Modal, Layout |
| @baseplate/patterns | 6 | Digital signature, admin setup, invite user, media upload, form builder, consent form |
| @baseplate/hooks | 2 | useApiQuery, useApiMutation |
| @baseplate/next-api | 4 | createRouteHandler, createGetHandler, jsonResponse, errorResponse |
| @baseplate/dates | 8+ | Date utilities, range presets |
| @baseplate/stripe | 2 | createPaymentLink, constructWebhookEvent |
| @baseplate/postmark | 2 | sendEmail, sendAppointmentConfirmationEmail |
| @baseplate/twilio | 2 | sendSMS, sendAppointmentReminderSMS |

## Commands

```bash
pnpm dev           # Start dev server (portal on :3000, connect-api on :3001)
pnpm build         # Build all packages + apps
pnpm test          # Run all tests
pnpm typecheck     # TypeScript check all packages
```

## Project Structure

```
apps/
  portal-medspa/      # Med Spa portal (24 routes, 9 API routes)
  connect-api/        # Connect API (3 endpoints, API-key auth)
packages/
  core/               # Shared business logic (17 modules)
  ui/                 # Reusable UI components
  patterns/           # Complex UI patterns
  integrations/       # Third-party service wrappers
```

## License

MIT
```

#### Commit
```bash
git add -A && git commit -m "docs: add comprehensive root README with architecture diagram"
```

---

### Step 5: Root .env.example Template

> **Purpose:** Single env var reference for developers cloning the repo.
>
> **Skills:** None needed — trivial file creation.

**File:** `Med Spa App/.env.example`

```bash
# ─── App ───
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ─── Postmark ───
POSTMARK_API_TOKEN=xxx
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# ─── Twilio ───
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+15125551234

# ─── Connect API ───
CONNECT_API_URL=http://localhost:3001
CONNECT_API_KEY=your-api-key

# ─── Optional ───
PHI_ENABLED=false

# ─── Upstash Redis (Phase 2C — Rate Limiting) ───
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

#### Commit
```bash
git add -A && git commit -m "docs: add root .env.example template"
```

---

### Phase 2A Gate Check

> **Run `check-pr-readiness`** (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/check-pr-readiness/SKILL.md`) — it runs typecheck + lint + test + residue sweep against the 2A diff. Pass all gates before proceeding to 2B.

- [ ] `pnpm typecheck` — all packages pass
- [ ] `pnpm test` — all tests pass
- [ ] `npx next build` (from `apps/portal-medspa/`) — 24 routes build
- [ ] All 2A commits made

---

## Phase 2B: Connect API

---

### Step 6: Scaffold Connect API as Next.js App

> **Purpose:** Create the standalone Connect API app that replaces the current stub.
> **Current state:** `apps/connect-api/package.json` is a 7-line stub with no source files.
>
> **Skills:** Run `add-feature` with `mode=fast` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-feature/SKILL.md`) — this is scaffolding (new app, no auth/payments/schema touched), so fast mode is safe. It skips clarify/plan/reviews but still implements + verifies. After scaffolding, run `simplify` to check for any redundant config.
>
> **Subagents:**
> - `nextjs-developer` (`Skills/Claude Code Subagents/categories/02-language-specialists/nextjs-developer.md`) — review the tsconfig, next.config.js, and transpilePackages setup
> - `api-designer` (`Skills/Claude Code Subagents/categories/01-core-development/api-designer.md`) — review the route structure for REST conventions

**File:** `apps/connect-api/package.json` — replace entire contents:

```json
{
  "name": "connect-api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "test": "jest --passWithNoTests",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@baseplate/core": "workspace:*",
    "@baseplate/twilio": "workspace:*",
    "@supabase/supabase-js": "^2.39.0",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

> **Correction:** Zod version is `^4.4.3` (matching portal-medspa), NOT `^3.22.0` as stated in the source execution plan.

**File:** `apps/connect-api/tsconfig.json` — create new:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["dom", "dom.iterable", "ES2021"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**File:** `apps/connect-api/next.config.js` — create new:

```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@baseplate/core', '@baseplate/twilio'],
};
```

**File:** `apps/connect-api/next-env.d.ts` — create new:

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

**File:** `apps/connect-api/.env.local.example` — create new:

```bash
# ─── Connect API ───
CONNECT_API_KEY=generate-a-strong-random-string

# ─── Supabase ───
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── Twilio ───
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+15125551234

# ─── Upstash Redis (Phase 2C) ───
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**File:** `apps/connect-api/src/app/layout.tsx` — create new:

```tsx
export const metadata = {
  title: 'Baseplate Connect API',
  description: 'Unified API for B2B integrations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

**File:** `apps/connect-api/src/app/page.tsx` — create new:

```tsx
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Baseplate Connect API</h1>
      <p>Health check: <a href="/api/health">/api/health</a></p>
      <p>Endpoints:</p>
      <ul>
        <li>POST /api/v1/communications/sms-reminder</li>
        <li>POST /api/v1/billing/package-deduct</li>
        <li>POST /api/v1/reporting/treatment-metrics</li>
      </ul>
    </main>
  );
}
```

**File:** `apps/connect-api/src/app/api/health/route.ts` — create new:

```typescript
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'connect-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
```

#### Verify
- [ ] Run `pnpm install` from monorepo root (`Med Spa App/`)
- [ ] Run `pnpm dev` from `apps/connect-api/` — server starts on port 3001
- [ ] `curl http://localhost:3001/api/health` returns JSON with `status: "ok"`

#### Commit
```bash
git add -A && git commit -m "feat: scaffold Connect API as standalone Next.js app"
```

---

### Step 7: Build API-Key Auth Middleware

> **Purpose:** Every Connect API endpoint (except `/api/health`) requires a valid API key via the `X-API-Key` header.
>
> **Skills:** Run `add-feature` with `mode=balanced` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-feature/SKILL.md`) — this touches auth (API key validation), so `fast` mode would trigger the safety override. Balanced runs clarify + implement + verify + tests but skips the plan-approval gate (the design is specified here). After implementing, run `audit-authz` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/audit-authz/SKILL.md`) — classify all Connect API endpoints as **"Service/internal"** (API-key auth, not user session), and `/api/health` as intentionally **"Public"**.
>
> **Subagent:** Delegate security review to `security-engineer` (`Skills/Claude Code Subagents/categories/03-infrastructure/security-engineer.md`) — have it review the `validateApiKey` function for timing attacks (constant-time comparison) and header injection.

**File:** `apps/connect-api/src/lib/auth.ts` — create new:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CONNECT_API_KEY;

export function validateApiKey(req: NextRequest): NextResponse | null {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured on server' },
      { status: 500 }
    );
  }

  const providedKey = req.headers.get('x-api-key');
  if (!providedKey || providedKey !== API_KEY) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    );
  }

  return null;
}
```

**File:** `apps/connect-api/src/lib/__tests__/auth.test.ts` — create new:

```typescript
import { validateApiKey } from '../auth';
import { NextRequest } from 'next/server';

describe('validateApiKey', () => {
  const originalEnv = process.env.CONNECT_API_KEY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CONNECT_API_KEY = originalEnv;
    } else {
      delete process.env.CONNECT_API_KEY;
    }
  });

  function createRequest(headers: Record<string, string> = {}): NextRequest {
    return new NextRequest('http://localhost:3001/api/v1/test', { headers });
  }

  it('returns null when API key is valid', () => {
    process.env.CONNECT_API_KEY = 'test-key';
    const req = createRequest({ 'x-api-key': 'test-key' });
    expect(validateApiKey(req)).toBeNull();
  });

  it('returns 401 when API key is missing', () => {
    process.env.CONNECT_API_KEY = 'test-key';
    const req = createRequest();
    const result = validateApiKey(req);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it('returns 401 when API key is wrong', () => {
    process.env.CONNECT_API_KEY = 'test-key';
    const req = createRequest({ 'x-api-key': 'wrong-key' });
    const result = validateApiKey(req);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it('returns 500 when API key is not configured on server', () => {
    delete process.env.CONNECT_API_KEY;
    const req = createRequest({ 'x-api-key': 'test-key' });
    const result = validateApiKey(req);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(500);
  });
});
```

**File:** `apps/connect-api/jest.config.js` — create new:

```javascript
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config;
```

**File:** `apps/connect-api/package.json` — add `jest`, `ts-jest`, `@types/jest` to devDependencies:

```json
"devDependencies": {
  "typescript": "^5.4.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.2.0",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.0",
  "@types/jest": "^29.5.0"
}
```

#### Verify
- [ ] Run `pnpm install` from monorepo root
- [ ] Run `pnpm test` from `apps/connect-api/` — auth tests pass

#### Commit
```bash
git add -A && git commit -m "feat: add API-key authentication middleware for Connect API"
```

---

### Step 8: Build Endpoint #1 — SMS Reminder

> **Purpose:** `POST /api/v1/communications/sms-reminder` — sends an SMS reminder using Twilio, with two templates.
>
> **Skills:** Run `add-feature` with `mode=balanced` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-feature/SKILL.md`) — new endpoint with external integration (Twilio). After implementing, run `add-observability` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-observability/SKILL.md`) — the boundary to instrument is the **Twilio API call** (log success/failure, message SID, response time). Then run `write-tests` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/write-tests/SKILL.md`) — it will detect the Jest harness and write tests following the existing `auth.test.ts` conventions.
>
> **Subagent:** Delegate endpoint logic review to `backend-developer` (`Skills/Claude Code Subagents/categories/01-core-development/backend-developer.md`) — have it review Zod validation, error handling, and the `logAction` catch-swallow pattern.

**File:** `apps/connect-api/src/lib/sms-templates.ts` — create new:

```typescript
interface TemplateParams {
  patientName: string;
  appointmentTime: string;
  clinicName: string;
  intakeUrl?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function buildSmsMessage(
  template: 'pre-appointment' | 'intake-reminder',
  params: TemplateParams
): string {
  const time = formatTime(params.appointmentTime);

  if (template === 'intake-reminder' && params.intakeUrl) {
    return `Hi ${params.patientName}, this is ${params.clinicName}. Please complete your intake form before your appointment on ${time}: ${params.intakeUrl}`;
  }

  return `Hi ${params.patientName}, this is ${params.clinicName}. Your appointment is scheduled for ${time}. Reply STOP to opt out.`;
}
```

**File:** `apps/connect-api/src/app/api/v1/communications/sms-reminder/route.ts` — create new:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { buildSmsMessage } from '@/lib/sms-templates';
import { sendSMS } from '@baseplate/twilio';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { logAction } from '@baseplate/core/audit-logs';

export const dynamic = 'force-dynamic';

const smsReminderSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  patient_phone: z.string().min(10),
  patient_name: z.string(),
  appointment_time: z.string().datetime(),
  clinic_name: z.string(),
  template: z.enum(['pre-appointment', 'intake-reminder']).default('pre-appointment'),
  intake_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  let body;
  try {
    body = smsReminderSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const message = buildSmsMessage(body.template, {
      patientName: body.patient_name,
      appointmentTime: body.appointment_time,
      clinicName: body.clinic_name,
      intakeUrl: body.intake_url,
    });

    const result = await sendSMS({ to: body.patient_phone, body: message });

    if (body.appointment_id) {
      const supabase = getServiceSupabaseClient();
      await logAction({
        clinicId: 'connect-api',
        userId: 'connect-api',
        action: 'sms.sent',
        resourceType: 'appointment',
        resourceId: body.appointment_id,
      }, supabase).catch(() => {});
    }

    return NextResponse.json({
      message_id: result.sid,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to send SMS', detail: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

#### Verify
- [ ] `pnpm typecheck` from `apps/connect-api/` — passes
- [ ] Start dev server, test with curl:
```bash
curl -X POST http://localhost:3001/api/v1/communications/sms-reminder \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"patient_phone":"+15125551234","patient_name":"Jane","appointment_time":"2025-06-20T14:00:00Z","clinic_name":"Glow Spa","template":"pre-appointment"}'
```
- [ ] Verify 401 without API key header

#### Commit
```bash
git add -A && git commit -m "feat: add POST /api/v1/communications/sms-reminder endpoint"
```

---

### Step 9: Build Endpoint #2 — Package Deduct

> **Purpose:** `POST /api/v1/billing/package-deduct` — auto-deducts a session from a credit package.
> **Requires:** New migration, new types, new core module, new endpoint.
>
> **Skills:** Run `add-migration` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-migration/SKILL.md`) first — classify this as **ADDITIVE** (two new tables, no existing columns touched). The skill will detect the raw SQL migration runner (`migrations/` with bare `.sql` files) and generate the migration safely. Then run `add-feature` with `mode=balanced` for the core module + endpoint. After implementing, run `audit-authz` — verify the service-role client (`getServiceSupabaseClient()`) is used correctly and doesn't leak cross-clinic data. Then run `write-tests` — **note the read-modify-write race condition** in `deductPackageSession()`: the fetch → update → insert sequence is not atomic. Tests should cover: not-found package, zero remaining, successful deduction, and ideally concurrent deduction.
>
> **Subagent:** Delegate SQL + RLS review to `postgres-pro` (`Skills/Claude Code Subagents/categories/05-data-ai/postgres-pro.md`) — have it review the migration for: index coverage, RLS policy correctness (does `staff.id = auth.uid()` work when called from the service-role client?), and whether the CHECK constraints are sufficient.

#### Step 9a: Database Migration

**File:** `supabase/migrations/0009_credit_packages.sql` — create new:

```sql
-- Migration: 0009_credit_packages.sql
-- Credit packages: patients buy bundles of sessions (e.g., "3 Botox treatments")
-- Enables the package-deduct Connect API endpoint.

CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  service_type VARCHAR(100),
  total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
  remaining_sessions INTEGER NOT NULL CHECK (remaining_sessions >= 0),
  amount_paid NUMERIC(10, 2),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_packages_clinic ON credit_packages(clinic_id);
CREATE INDEX idx_credit_packages_patient ON credit_packages(patient_id);
CREATE INDEX idx_credit_packages_remaining ON credit_packages(remaining_sessions);

CREATE TABLE package_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES credit_packages(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('purchase', 'deduct', 'refund', 'adjust')),
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_package_transactions_package ON package_transactions(package_id);
CREATE INDEX idx_package_transactions_clinic ON package_transactions(clinic_id);

ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_clinic_access" ON credit_packages
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE staff.id = auth.uid())
  );

CREATE POLICY "transactions_clinic_access" ON package_transactions
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE staff.id = auth.uid())
  );
```

#### Step 9b: Add Types to Core

**File:** `packages/core/src/types/index.ts` — add these interfaces (after the existing `Appointment` interface):

```typescript
export interface CreditPackage {
  id: string;
  clinic_id: string;
  patient_id: string;
  name: string;
  service_type?: string;
  total_sessions: number;
  remaining_sessions: number;
  amount_paid?: number;
  purchased_at: Date;
  expires_at?: Date;
  created_at: Date;
}

export interface PackageTransaction {
  id: string;
  package_id: string;
  clinic_id: string;
  appointment_id?: string;
  action: 'purchase' | 'deduct' | 'refund' | 'adjust';
  previous_balance: number;
  new_balance: number;
  performed_by?: string;
  created_at: Date;
}
```

**File:** `packages/core/src/index.ts` — add to the type re-exports from `./types`:

```typescript
export type { CreditPackage, PackageTransaction } from './types';
```

#### Step 9c: Create Packages Module

**File:** `packages/core/src/packages/index.ts` — create new:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import type { CreditPackage, PackageTransaction } from '../types';

export interface DeductPackageParams {
  packageId: string;
  patientId: string;
  clinicId: string;
  appointmentId?: string;
  performedBy?: string;
}

export async function deductPackageSession(
  params: DeductPackageParams,
  client?: SupabaseClient
): Promise<{ remaining: number; transaction: PackageTransaction }> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data: pkg, error: fetchError } = await supabase
    .from('credit_packages')
    .select('remaining_sessions, total_sessions, patient_id, clinic_id')
    .eq('id', params.packageId)
    .eq('patient_id', params.patientId)
    .eq('clinic_id', params.clinicId)
    .single();

  if (fetchError || !pkg) throw new Error('Package not found');
  if (pkg.remaining_sessions <= 0) throw new Error('No sessions remaining in package');

  const previousBalance = pkg.remaining_sessions;
  const newBalance = previousBalance - 1;

  const { error: updateError } = await supabase
    .from('credit_packages')
    .update({ remaining_sessions: newBalance })
    .eq('id', params.packageId);

  if (updateError) throw new Error(`Package update failed: ${updateError.message}`);

  const { data: txn, error: txnError } = await supabase
    .from('package_transactions')
    .insert({
      package_id: params.packageId,
      clinic_id: params.clinicId,
      appointment_id: params.appointmentId,
      action: 'deduct',
      previous_balance: previousBalance,
      new_balance: newBalance,
      performed_by: params.performedBy,
    })
    .select()
    .single();

  if (txnError) throw new Error(`Transaction log failed: ${txnError.message}`);

  return { remaining: newBalance, transaction: txn as PackageTransaction };
}

export async function getPatientPackages(
  patientId: string,
  clinicId: string,
  client?: SupabaseClient
): Promise<CreditPackage[]> {
  const supabase = client ?? getAnonSupabaseClient();
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch packages failed: ${error.message}`);
  return (data ?? []) as CreditPackage[];
}
```

**File:** `packages/core/src/index.ts` — add exports (follow the existing pattern in the file):

```typescript
export { deductPackageSession, getPatientPackages } from './packages';
export type { DeductPackageParams } from './packages';
```

**File:** `packages/core/package.json` — add a `"./packages"` entry to the exports map, following the exact same format as the existing entries (e.g., `"./errors"`). Read the file first, then add:

```json
"./packages": {
  "import": "./src/packages/index.ts"
}
```

#### Step 9d: Write Tests for Packages Module

**File:** `packages/core/src/packages/__tests__/packages.test.ts` — create new:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import { deductPackageSession } from '../index';

function createMockClient(opts: {
  fetchData?: unknown;
  fetchError?: unknown;
  updateError?: unknown;
  insertData?: unknown;
  insertError?: unknown;
}) {
  const selectSingle = jest.fn().mockResolvedValue({
    data: opts.fetchData,
    error: opts.fetchError ?? null,
  });
  const updateEq = jest.fn().mockResolvedValue({
    error: opts.updateError ?? null,
  });
  const insertSingle = jest.fn().mockResolvedValue({
    data: opts.insertData ?? { id: 'txn-1', new_balance: 2 },
    error: opts.insertError ?? null,
  });

  return {
    from: jest.fn((table: string) => {
      if (table === 'credit_packages') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: selectSingle,
                })),
              })),
            })),
          })),
          update: jest.fn(() => ({
            eq: updateEq,
          })),
        };
      }
      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: insertSingle,
          })),
        })),
      };
    }),
  } as unknown as SupabaseClient;
}

describe('packages module', () => {
  const baseParams = {
    packageId: 'pkg-1',
    patientId: 'patient-1',
    clinicId: 'clinic-1',
  };

  describe('deductPackageSession', () => {
    it('deducts a session and returns the new balance', async () => {
      const client = createMockClient({
        fetchData: { remaining_sessions: 3, total_sessions: 5, patient_id: 'patient-1', clinic_id: 'clinic-1' },
      });

      const result = await deductPackageSession(baseParams, client);

      expect(result.remaining).toBe(2);
    });

    it('throws when package not found', async () => {
      const client = createMockClient({
        fetchData: null,
        fetchError: { message: 'Not found' },
      });

      await expect(deductPackageSession(baseParams, client)).rejects.toThrow('Package not found');
    });

    it('throws when no sessions remaining', async () => {
      const client = createMockClient({
        fetchData: { remaining_sessions: 0, total_sessions: 5, patient_id: 'patient-1', clinic_id: 'clinic-1' },
      });

      await expect(deductPackageSession(baseParams, client)).rejects.toThrow('No sessions remaining');
    });
  });
});
```

#### Step 9e: Create Package Deduct Endpoint

**File:** `apps/connect-api/src/app/api/v1/billing/package-deduct/route.ts` — create new:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { deductPackageSession } from '@baseplate/core/packages';
import { logAction } from '@baseplate/core/audit-logs';

export const dynamic = 'force-dynamic';

const packageDeductSchema = z.object({
  package_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  performed_by: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  let body;
  try {
    body = packageDeductSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();

  try {
    const result = await deductPackageSession({
      packageId: body.package_id,
      patientId: body.patient_id,
      clinicId: body.clinic_id,
      appointmentId: body.appointment_id,
      performedBy: body.performed_by,
    }, supabase);

    await logAction({
      clinicId: body.clinic_id,
      userId: body.performed_by ?? 'connect-api',
      action: 'package.deducted',
      resourceType: 'credit_package',
      resourceId: body.package_id,
    }, supabase).catch(() => {});

    return NextResponse.json({
      package_id: body.package_id,
      remaining_sessions: result.remaining,
      deducted_at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('not found') ? 404 : message.includes('No sessions') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
```

#### Verify
- [ ] `pnpm test` from `packages/core/` — packages module tests pass
- [ ] `pnpm typecheck` from monorepo root — all packages pass
- [ ] **Manual DB task:** Run `0009_credit_packages.sql` on staging Supabase (see `MASTER_MANUAL_CONFIG.md` Section 3B)

#### Commit
```bash
git add -A && git commit -m "feat: add POST /api/v1/billing/package-deduct endpoint + migration 0009"
```

---

### Step 10: Build Endpoint #3 — Treatment Metrics

> **Purpose:** `POST /api/v1/reporting/treatment-metrics` — returns revenue and appointment metrics grouped by provider, service type, or month.
>
> **Skills:** Run `add-feature` with `mode=balanced` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-feature/SKILL.md`). After implementing, run `audit-perf` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/audit-perf/SKILL.md`) — **tell it to specifically check the in-memory grouping loop**: the endpoint fetches ALL appointments for a clinic then groups them in JavaScript. At scale (thousands of appointments), this will be slow. The skill should flag this as a potential N+1/batch-fetch issue and recommend either a Supabase RPC (stored procedure) or pagination. Also run `add-observability` to instrument the Supabase query boundary.
>
> **Subagent:** Delegate aggregation logic review to `backend-developer` (`Skills/Claude Code Subagents/categories/01-core-development/backend-developer.md`) — have it review the grouping math (no-show rate calculation, revenue rounding, edge cases with null amounts).

**File:** `apps/connect-api/src/app/api/v1/reporting/treatment-metrics/route.ts` — create new:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { logAction } from '@baseplate/core/audit-logs';

export const dynamic = 'force-dynamic';

const treatmentMetricsSchema = z.object({
  clinic_id: z.string().uuid(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  group_by: z.enum(['provider', 'service_type', 'month']).default('service_type'),
});

interface GroupData {
  total_appointments: number;
  completed: number;
  cancelled: number;
  revenue: number;
  revenue_collected: number;
}

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  let body;
  try {
    body = treatmentMetricsSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();

  let query = supabase
    .from('appointments')
    .select('service_type, provider_id, scheduled_time, status, amount, payment_status')
    .eq('clinic_id', body.clinic_id);

  if (body.from) query = query.gte('scheduled_time', body.from);
  if (body.to) query = query.lte('scheduled_time', body.to);

  const { data: appointments, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }

  const groups: Record<string, GroupData> = {};

  for (const appt of appointments ?? []) {
    let groupKey: string;

    if (body.group_by === 'provider') {
      groupKey = appt.provider_id ?? 'Unassigned';
    } else if (body.group_by === 'month') {
      const date = new Date(appt.scheduled_time);
      groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      groupKey = appt.service_type ?? 'Unknown';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = {
        total_appointments: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        revenue_collected: 0,
      };
    }

    const g = groups[groupKey];
    g.total_appointments++;
    if (appt.status === 'completed') g.completed++;
    if (appt.status === 'cancelled') g.cancelled++;
    g.revenue += Number(appt.amount) || 0;
    if (appt.payment_status === 'completed') {
      g.revenue_collected += Number(appt.amount) || 0;
    }
  }

  const metrics = Object.entries(groups).map(([groupKey, d]) => ({
    group_key: groupKey,
    total_appointments: d.total_appointments,
    completed: d.completed,
    cancelled: d.cancelled,
    no_show_rate: d.total_appointments > 0
      ? Math.round((1 - (d.completed + d.cancelled) / d.total_appointments) * 1000) / 1000
      : 0,
    revenue: Math.round(d.revenue * 100) / 100,
    revenue_collected: Math.round(d.revenue_collected * 100) / 100,
    outstanding: Math.round((d.revenue - d.revenue_collected) * 100) / 100,
  }));

  const totals = {
    total_appointments: metrics.reduce((sum, m) => sum + m.total_appointments, 0),
    total_revenue: Math.round(metrics.reduce((sum, m) => sum + m.revenue, 0) * 100) / 100,
    total_collected: Math.round(metrics.reduce((sum, m) => sum + m.revenue_collected, 0) * 100) / 100,
    total_outstanding: Math.round(metrics.reduce((sum, m) => sum + m.outstanding, 0) * 100) / 100,
  };

  await logAction({
    clinicId: body.clinic_id,
    userId: 'connect-api',
    action: 'reporting.metrics',
    resourceType: 'reporting',
    resourceId: body.group_by,
  }, supabase).catch(() => {});

  return NextResponse.json({
    clinic_id: body.clinic_id,
    period: { from: body.from ?? null, to: body.to ?? null },
    group_by: body.group_by,
    metrics,
    totals,
  });
}
```

#### Verify
- [ ] `pnpm typecheck` from `apps/connect-api/` — passes
- [ ] Start dev server, test with curl:
```bash
curl -X POST http://localhost:3001/api/v1/reporting/treatment-metrics \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clinic_id":"00000000-0000-0000-0000-000000000000","group_by":"service_type"}'
```
- [ ] Verify response has `metrics` array and `totals` object (may be empty if no data)

#### Commit
```bash
git add -A && git commit -m "feat: add POST /api/v1/reporting/treatment-metrics endpoint"
```

---

### Step 11: Wire Portal to Call Connect API

> **Purpose:** Prove the Connect API works by having the portal route SMS through it instead of calling Twilio directly.
>
> **Skills:** Run `modify-feature` with `mode=balanced` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/modify-feature/SKILL.md`) — this modifies an existing route (`confirm/route.ts`). The contract shift is: the SMS path changes from calling `@baseplate/twilio` directly to calling the Connect API via `callConnectApi()`. The skill will map this shift before editing. After implementing, run `simplify` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/simplify/SKILL.md`) — review the diff for dead imports (the `@baseplate/twilio` import may now be unused in that file).
>
> **Subagent:** Delegate the refactored route review to `backend-developer` (`Skills/Claude Code Subagents/categories/01-core-development/backend-developer.md`) — verify the `callConnectApi` error handling doesn't silently swallow failures that should surface to the user.

**File:** `apps/portal-medspa/src/lib/connect-client.ts` — create new:

```typescript
/**
 * Typed helper for calling the Connect API from the portal.
 * All calls include the X-API-Key header automatically.
 */
export async function callConnectApi(
  path: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const url = `${process.env.CONNECT_API_URL}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CONNECT_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Connect API error (${response.status}): ${JSON.stringify(error)}`);
  }

  return response.json();
}
```

**File:** `apps/portal-medspa/src/app/api/appointments/confirm/route.ts` — modify the SMS section.

Read the current file first, then find the block that calls `sendAppointmentReminderSMS` from `@baseplate/twilio`. Replace the **SMS sending** portion (keep the email/Postmark call unchanged) with a Connect API call:

Before (current code — approximate):
```typescript
import { sendAppointmentReminderSMS } from '@baseplate/twilio';
// ...
if (phone) {
  await sendAppointmentReminderSMS({
    to: phone,
    patientName: patientName,
    scheduledTime: scheduledTime,
    clinicName: clinicName,
  });
  results.push({ type: 'sms', sent: true });
}
```

After (replace the SMS block):
```typescript
import { callConnectApi } from '@/lib/connect-client';
// Remove the @baseplate/twilio import IF it's no longer used elsewhere in the file.
// If Postmark email is still sent directly, keep the Postmark import.
// ...
if (phone) {
  try {
    const result = await callConnectApi('/api/v1/communications/sms-reminder', {
      appointment_id: appointmentId,
      patient_phone: phone,
      patient_name: patientName,
      appointment_time: scheduledTime,
      clinic_name: clinicName,
      template: 'pre-appointment',
    });
    results.push({ type: 'sms', sent: true, message_id: (result as { message_id?: string }).message_id });
  } catch {
    results.push({ type: 'sms', sent: false, error: 'Connect API call failed' });
  }
}
```

> **IMPORTANT:** Read the actual current file before editing. The exact variable names (`appointmentId`, `patientName`, `scheduledTime`, `clinicName`, `phone`) must match what the existing code uses. Adapt the code above to match the current file's variable names exactly. Only replace the SMS block — leave the Postmark email block, Zod validation, auth check, and response structure unchanged.

**File:** `apps/portal-medspa/.env.local` — add:
```bash
CONNECT_API_URL=http://localhost:3001
CONNECT_API_KEY=your-shared-api-key
```

> Use the same `CONNECT_API_KEY` value that's in `apps/connect-api/.env.local`.

#### Verify
- [ ] `pnpm typecheck` from monorepo root — all packages pass
- [ ] Start both servers: portal (`pnpm dev` from `apps/portal-medspa/`) on :3000, Connect API (`pnpm dev` from `apps/connect-api/`) on :3001
- [ ] Test: trigger an appointment confirmation from the portal → verify SMS goes through Connect API (check Connect API server logs)
- [ ] `pnpm test` — all tests pass

#### Commit
```bash
git add -A && git commit -m "feat: portal calls Connect API for SMS instead of direct Twilio"
```

---

### Step 12: Deploy Connect API to Railway

> 🔧 **MANUAL TASK** — See `MASTER_MANUAL_CONFIG.md` Section 3B (Step 3B Connect API Deployment)
>
> **Skills:** No code skills needed — this is a human deployment task. After deploy, run `testing-plan` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/testing-plan/SKILL.md`) to generate a post-deploy smoke test plan for the human to execute against the deployed Connect API.
>
> **Subagent:** Delegate the deployment guide review to `devops-engineer` (`Skills/Claude Code Subagents/categories/03-infrastructure/devops-engineer.md`) — have it verify the Railway config (root directory, env vars, build command) matches the monorepo structure.
>
> Steps for the human:
> 1. Push code to GitHub
> 2. Railway → New Project → Deploy from GitHub repo
> 3. Set Root Directory to `Med Spa App/apps/connect-api`
> 4. Add env vars: `CONNECT_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
> 5. Deploy
> 6. Test health: `curl https://connect-api-xxx.up.railway.app/api/health`
> 7. Test with API key: `curl -X POST https://connect-api-xxx.up.railway.app/api/v1/reporting/treatment-metrics -H "x-api-key: YOUR_KEY" -H "Content-Type: application/json" -d '{"clinic_id":"uuid"}'`
> 8. Update portal's `CONNECT_API_URL` in Railway service variables to production Connect API URL

---

### Phase 2B Gate Check

> **Run `check-pr-readiness`** (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/check-pr-readiness/SKILL.md`) before proceeding to 2C.

- [ ] Connect API scaffolded with health endpoint
- [ ] API-key auth working (returns 401 without key, 200 with key)
- [ ] SMS reminder endpoint works
- [ ] Package deduct endpoint works (migration 0009 run)
- [ ] Treatment metrics endpoint works
- [ ] Portal routes SMS through Connect API (end-to-end)
- [ ] Connect API deployed to Railway
- [ ] All tests pass

---

## Phase 2C: Hardening + Documentation

---

### Step 13: Rate Limiting via Upstash Redis

> 🔧 **MANUAL TASK (Part 1):** Create Upstash Redis database
> - See `MASTER_MANUAL_CONFIG.md` Section 3C (Upstash Redis Setup)
> - Create account at console.upstash.com → Create Redis DB (free tier)
> - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
> - Add to `apps/connect-api/.env.local`
>
> **Skills:** Run `modify-feature` with `mode=balanced` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/modify-feature/SKILL.md`) — this modifies all 3 existing endpoints by adding rate-limit checks. The contract shift is: each endpoint gains a rate-limit check after the auth check but before the business logic. After implementing, run `audit-authz` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/audit-authz/SKILL.md`) — verify the rate-limit error response (429) doesn't leak the API key in headers or body.
>
> **Subagent:** Delegate rate-limit middleware review to `backend-developer` (`Skills/Claude Code Subagents/categories/01-core-development/backend-developer.md`) — verify the graceful degradation logic (null ratelimiter when env vars missing) doesn't accidentally bypass auth.

**Code changes:**

Add dependencies to `apps/connect-api/package.json` devDependencies or dependencies:

```bash
cd apps/connect-api && pnpm add @upstash/redis @upstash/ratelimit
```

**File:** `apps/connect-api/src/lib/rate-limit.ts` — create new:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  });
}

const ratelimit = createRateLimiter();

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (!ratelimit) {
    return { success: true, limit: 100, remaining: 100 };
  }
  return ratelimit.limit(identifier);
}
```

> The rate limiter gracefully degrades to "no limit" if Upstash env vars are missing (for local dev without Redis).

**Apply to all 3 endpoints** — add this block after the `validateApiKey` check in each route handler:

```typescript
import { checkRateLimit } from '@/lib/rate-limit';
// ... inside POST handler, after auth check:
  const apiKey = req.headers.get('x-api-key')!;
  const rateLimit = await checkRateLimit(apiKey);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  }
```

Add this to each of these 3 files:
- `apps/connect-api/src/app/api/v1/communications/sms-reminder/route.ts`
- `apps/connect-api/src/app/api/v1/billing/package-deduct/route.ts`
- `apps/connect-api/src/app/api/v1/reporting/treatment-metrics/route.ts`

#### Verify
- [ ] `pnpm typecheck` from `apps/connect-api/` — passes
- [ ] Start Connect API with Upstash env vars set
- [ ] Send 101 rapid requests to an endpoint → verify 429 on the 101st

#### Commit
```bash
git add -A && git commit -m "feat: add rate limiting via Upstash Redis"
```

---

### Step 14: OpenAPI Documentation

> **Purpose:** Write complete OpenAPI spec + developer integration guide.
>
> **Skills:** None needed for the actual writing — this is direct documentation. After writing, run `sync-docs` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/sync-docs/SKILL.md`) to verify the OpenAPI schemas match the actual Zod schemas in the route handlers (field names, types, required vs optional).
>
> **Subagent:** Delegate the OpenAPI spec draft to `api-documenter` (`Skills/Claude Code Subagents/categories/07-specialized-domains/api-documenter.md`) — give it the 3 endpoint route files and have it generate the spec. Then review for accuracy in the main session. Use a cheaper model.

**File:** `apps/connect-api/docs/openapi.yaml`

```yaml
openapi: 3.0.3
info:
  title: Baseplate Connect API
  version: 0.1.0
  description: Unified API for B2B integrations (SMS, billing, reporting).

servers:
  - url: https://connect-api-xxx.up.railway.app
    description: Production
  - url: http://localhost:3001
    description: Local dev

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
        detail:
          type: string

security:
  - ApiKeyAuth: []

paths:
  /api/health:
    get:
      summary: Health check
      security: []
      responses:
        '200':
          description: Service healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string }
                  service: { type: string }
                  version: { type: string }
                  timestamp: { type: string, format: date-time }

  /api/v1/communications/sms-reminder:
    post:
      summary: Send SMS reminder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [patient_phone, patient_name, appointment_time, clinic_name]
              properties:
                appointment_id: { type: string, format: uuid }
                patient_phone: { type: string }
                patient_name: { type: string }
                appointment_time: { type: string, format: date-time }
                clinic_name: { type: string }
                template:
                  type: string
                  enum: [pre-appointment, intake-reminder]
                  default: pre-appointment
                intake_url: { type: string, format: uri }
      responses:
        '200':
          description: SMS sent
          content:
            application/json:
              schema:
                type: object
                properties:
                  message_id: { type: string }
                  status: { type: string }
                  sent_at: { type: string, format: date-time }
        '400': { description: Invalid body }
        '401': { description: Invalid API key }
        '429': { description: Rate limited }
        '500': { description: SMS send failed }

  /api/v1/billing/package-deduct:
    post:
      summary: Deduct a session from a credit package
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [package_id, patient_id, clinic_id]
              properties:
                package_id: { type: string, format: uuid }
                patient_id: { type: string, format: uuid }
                clinic_id: { type: string, format: uuid }
                appointment_id: { type: string, format: uuid }
                performed_by: { type: string, format: uuid }
      responses:
        '200':
          description: Session deducted
          content:
            application/json:
              schema:
                type: object
                properties:
                  package_id: { type: string, format: uuid }
                  remaining_sessions: { type: integer }
                  deducted_at: { type: string, format: date-time }
        '404': { description: Package not found }
        '409': { description: No sessions remaining }

  /api/v1/reporting/treatment-metrics:
    post:
      summary: Get treatment metrics
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [clinic_id]
              properties:
                clinic_id: { type: string, format: uuid }
                from: { type: string, format: date-time }
                to: { type: string, format: date-time }
                group_by:
                  type: string
                  enum: [provider, service_type, month]
                  default: service_type
      responses:
        '200':
          description: Metrics retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  clinic_id: { type: string, format: uuid }
                  period:
                    type: object
                    properties:
                      from: { type: string, format: date-time, nullable: true }
                      to: { type: string, format: date-time, nullable: true }
                  group_by: { type: string }
                  metrics:
                    type: array
                    items:
                      type: object
                      properties:
                        group_key: { type: string }
                        total_appointments: { type: integer }
                        completed: { type: integer }
                        cancelled: { type: integer }
                        no_show_rate: { type: number }
                        revenue: { type: number }
                        revenue_collected: { type: number }
                        outstanding: { type: number }
                  totals:
                    type: object
                    properties:
                      total_appointments: { type: integer }
                      total_revenue: { type: number }
                      total_collected: { type: number }
                      total_outstanding: { type: number }
```

**File:** `apps/connect-api/docs/README.md` — create new:

```markdown
# Connect API — Developer Integration Guide

## Quick Start

1. Get your API key from your clinic dashboard (Settings → API)
2. Make your first call:

```bash
curl -X POST https://connect-api-xxx.up.railway.app/api/v1/reporting/treatment-metrics \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clinic_id":"your-clinic-uuid","group_by":"service_type"}'
```

## Authentication

All endpoints (except `/api/health`) require the `X-API-Key` header:

```
X-API-Key: your-api-key-here
```

Requests without a valid key receive `401 Unauthorized`.

## Rate Limits

100 requests per minute per API key. Responses include:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests per window |
| `X-RateLimit-Remaining` | Remaining requests in current window |

When exceeded: `429 Too Many Requests`.

## Endpoints

### POST /api/v1/communications/sms-reminder

Send an SMS appointment reminder.

```bash
curl -X POST .../api/v1/communications/sms-reminder \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_phone": "+15125551234",
    "patient_name": "Jane Doe",
    "appointment_time": "2025-06-20T14:00:00Z",
    "clinic_name": "Glow Spa",
    "template": "pre-appointment"
  }'
```

### POST /api/v1/billing/package-deduct

Deduct a session from a patient's credit package.

```bash
curl -X POST .../api/v1/billing/package-deduct \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid"
  }'
```

### POST /api/v1/reporting/treatment-metrics

Get revenue and appointment metrics.

```bash
curl -X POST .../api/v1/reporting/treatment-metrics \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": "uuid",
    "group_by": "service_type",
    "from": "2025-01-01T00:00:00Z",
    "to": "2025-06-15T23:59:59Z"
  }'
```

## Error Handling

| Status | Meaning |
|--------|---------|
| 400 | Invalid request body |
| 401 | Missing or invalid API key |
| 404 | Resource not found |
| 409 | Conflict (e.g., no sessions remaining) |
| 429 | Rate limit exceeded |
| 500 | Server error |

## SDK Examples

### JavaScript

```javascript
const response = await fetch('https://connect-api-xxx.up.railway.app/api/v1/communications/sms-reminder', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.CONNECT_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    patient_phone: '+15125551234',
    patient_name: 'Jane Doe',
    appointment_time: '2025-06-20T14:00:00Z',
    clinic_name: 'Glow Spa',
  }),
});
const data = await response.json();
```

### Python

```python
import requests

response = requests.post(
    'https://connect-api-xxx.up.railway.app/api/v1/communications/sms-reminder',
    headers={
        'x-api-key': os.environ['CONNECT_API_KEY'],
        'Content-Type': 'application/json',
    },
    json={
        'patient_phone': '+15125551234',
        'patient_name': 'Jane Doe',
        'appointment_time': '2025-06-20T14:00:00Z',
        'clinic_name': 'Glow Spa',
    },
)
data = response.json()
```
```

#### Commit
```bash
git add -A && git commit -m "docs: add OpenAPI spec + integration guide for Connect API"
```

---

### Step 15: Pricing Structure Prep + Usage Logging

> 🔧 **MANUAL TASK (Part 1):** Create Stripe pricing products
> - See `MASTER_MANUAL_CONFIG.md` Section 3C (Stripe Pricing Products)
> - Create in Stripe Dashboard → Products (do NOT activate):
>   - Connect API Starter — $49/mo recurring
>   - Connect API Pro — $99/mo recurring
>   - Connect API Enterprise — Custom ("contact sales")
> - Copy Price IDs (`price_xxx`) → store in a config file (NOT env vars)
>
> **Skills:** Run `add-migration` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-migration/SKILL.md`) for the `api_usage` table — classify as **ADDITIVE** (new table, no existing columns touched). Then run `add-observability` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-observability/SKILL.md`) — the boundary to instrument is the **usage logging insert** in each endpoint. Tell it the logging is best-effort (should never block the response).
>
> **Subagent:** Delegate Stripe product setup review to `payment-integration` (`Skills/Claude Code Subagents/categories/07-specialized-domains/payment-integration.md`) — have it verify the pricing tier structure ($0/$49/$99/custom) and confirm the products are created but NOT activated.

**Code changes:**

**File:** `supabase/migrations/0010_api_usage.sql` — create new:

```sql
-- Migration: 0010_api_usage.sql
-- API usage logging for metering infrastructure (Phase 5 billing enforcement).

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  endpoint VARCHAR(200) NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_usage_clinic_month ON api_usage(clinic_id, timestamp);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint, timestamp);

-- RLS: only service-role can access (Connect API uses service-role client)
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
```

**File:** `apps/connect-api/src/lib/usage.ts` — create new:

```typescript
import { getServiceSupabaseClient } from '@baseplate/core/config';

export async function logApiUsage(params: {
  clinicId?: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs?: number;
}): Promise<void> {
  try {
    const supabase = getServiceSupabaseClient();
    await supabase.from('api_usage').insert({
      clinic_id: params.clinicId ?? null,
      endpoint: params.endpoint,
      status_code: params.statusCode,
      response_time_ms: params.responseTimeMs ?? null,
    });
  } catch {
    // Usage logging is best-effort — never block on it
  }
}
```

**Apply usage logging to all 3 endpoints** — add timing + log call at the end of each route handler, just before `return NextResponse.json(...)`:

```typescript
import { logApiUsage } from '@/lib/usage';
// ... at the top of the POST handler:
  const startTime = Date.now();
// ... at the end, before each return statement that sends a success response:
  await logApiUsage({
    clinicId: body.clinic_id,
    endpoint: req.nextUrl.pathname,
    statusCode: 200,
    responseTimeMs: Date.now() - startTime,
  });
```

> Apply to all 3 endpoint files. For error responses (400, 401, etc.), you can skip usage logging or log with the error status code — keep it simple.

#### Verify
- [ ] `pnpm typecheck` from `apps/connect-api/` — passes
- [ ] **Manual DB task:** Run `0010_api_usage.sql` on staging Supabase
- [ ] Test an endpoint → verify a row appears in `api_usage` table

#### Commit
```bash
git add -A && git commit -m "feat: pricing structure prep — usage logging + migration 0010"
```

---

### Step 16: Load Test

> 🔧 **MANUAL TASK** — See `MASTER_MANUAL_CONFIG.md` Section 3C (Load Testing)
>
> **Skills:** Run `audit-perf` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/audit-perf/SKILL.md`) — it will statically analyze the 3 endpoints for performance issues (N+1 queries, missing indexes, blocking awaits). Complement this with the actual load test below.
>
> **Subagent:** Delegate the load test execution and analysis to `performance-engineer` (`Skills/Claude Code Subagents/categories/04-quality-security/performance-engineer.md`) — give it the `ab` commands and have it run the tests, analyze p95/p99/error rate, and report findings.
>
> Test all 3 endpoints with 100 concurrent requests each:
> - Target: p95 < 2s, 0% error rate
> - Document results
> - Tools: Apache Bench (`ab`), `k6`, or a Node.js script
>
> ```bash
> ab -n 100 -c 10 -H "x-api-key: YOUR_KEY" \
>    -p body.json -T application/json \
>    https://connect-api-xxx.up.railway.app/api/v1/communications/sms-reminder
> ```

---

### Phase 2C Gate Check

> **Run `check-pr-readiness`** (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/check-pr-readiness/SKILL.md`) before proceeding to 2D.

- [ ] Rate limiting active and tested (429 on 101st request)
- [ ] OpenAPI spec written
- [ ] Integration guide written
- [ ] Stripe pricing products created (not activated)
- [ ] Usage logging working (rows in `api_usage` table)
- [ ] Load test passed (p95 < 2s, 0% errors)

---

## Phase 2D: Cross-Vertical Validation

---

### Step 17: Create Minimal Home Services Test App

> **Purpose:** Prove the module library works for a non-med-spa domain. This is a tiny proof-of-concept, NOT a full portal.
>
> **Skills:** Run `add-feature` with `mode=fast` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/add-feature/SKILL.md`) — this is scaffolding a test app with no auth/payments/schema, so fast mode is safe. After implementing, run `write-tests` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/write-tests/SKILL.md`) — write a test that imports each module (`@baseplate/core`, `@baseplate/ui`, `@baseplate/patterns`) and verifies it loads without errors in a non-med-spa context.
>
> **Subagents:**
> - `nextjs-developer` (`Skills/Claude Code Subagents/categories/02-language-specialists/nextjs-developer.md`) — review the test app's config (transpilePackages, tsconfig)
> - `typescript-pro` (`Skills/Claude Code Subagents/categories/02-language-specialists/typescript-pro.md`) — verify the `Tenant`, `Customer`, `Resource`, `Space` type aliases compile and are usable in the home-services context

```bash
cd Med\ Spa\ App
mkdir -p apps/test-home-services
cd apps/test-home-services
```

**File:** `apps/test-home-services/package.json` — create new:

```json
{
  "name": "test-home-services",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "test": "jest --passWithNoTests",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@baseplate/core": "workspace:*",
    "@baseplate/ui": "workspace:*",
    "@baseplate/patterns": "workspace:*",
    "@supabase/supabase-js": "^2.39.0",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

**File:** `apps/test-home-services/tsconfig.json` — copy from `apps/connect-api/tsconfig.json` (same config).

**File:** `apps/test-home-services/next.config.js` — create new:

```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@baseplate/core', '@baseplate/ui', '@baseplate/patterns'],
};
```

**File:** `apps/test-home-services/next-env.d.ts` — create new:

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

**File:** `apps/test-home-services/src/app/layout.tsx` — create new:

```tsx
export const metadata = {
  title: 'Home Services Test (Cross-Vertical Validation)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

**File:** `apps/test-home-services/src/app/page.tsx` — create new:

```tsx
import { getPermissions, canPerform } from '@baseplate/core';
import type { Tenant, Customer, Resource, Space } from '@baseplate/core';

export const dynamic = 'force-dynamic';

export default function Home() {
  const ownerPerms = getPermissions('owner');
  const technicianPerms = getPermissions('staff');
  const customerPerms = getPermissions('patient');

  const canBook = canPerform('owner', 'canCreateAppointment');
  const canViewAll = canPerform('owner', 'canViewAllRecords');
  const canManageStaff = canPerform('owner', 'canManageStaff');

  const tests = [
    { name: 'Type aliases compile (Tenant, Customer, Resource, Space)', pass: true },
    { name: 'getPermissions(owner) returns all true', pass: ownerPerms.canViewAllRecords && ownerPerms.canManageStaff },
    { name: 'getPermissions(staff) — no staff management', pass: !technicianPerms.canManageStaff },
    { name: 'getPermissions(patient) — own data only', pass: customerPerms.canViewOwnData && !customerPerms.canViewAllRecords },
    { name: 'canPerform(owner, canCreateAppointment)', pass: canBook },
    { name: 'canPerform(owner, canViewAllRecords)', pass: canViewAll },
    { name: 'canPerform(owner, canManageStaff)', pass: canManageStaff },
  ];

  const allPass = tests.every(t => t.pass);

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '800px' }}>
      <h1>Cross-Vertical Validation: Home Services</h1>
      <p>Testing @baseplate/core in a non-med-spa context.</p>
      <h2>Results: {allPass ? 'ALL PASS' : 'FAILURES DETECTED'}</h2>
      <ul>
        {tests.map((t, i) => (
          <li key={i} style={{ color: t.pass ? 'green' : 'red' }}>
            {t.pass ? 'PASS' : 'FAIL'} — {t.name}
          </li>
        ))}
      </ul>
      <h2>Type Alias Check</h2>
      <p>Tenant, Customer, Resource, Space types imported successfully (compile-time check).</p>
    </main>
  );
}
```

**File:** `apps/test-home-services/src/app/forms/page.tsx` — create new (tests FormBuilder pattern):

```tsx
import { FormBuilder } from '@baseplate/patterns';

export const dynamic = 'force-dynamic';

export default function FormsPage() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>FormBuilder — Non-Medical Fields</h1>
      <p>Testing FormBuilder renders with home-services fields.</p>
      <FormBuilder
        fields={[
          { id: 'address', label: 'Service Address', type: 'text', required: true },
          { id: 'issue', label: 'Describe the Problem', type: 'textarea', required: true },
          { id: 'urgent', label: 'Is this an emergency?', type: 'checkbox' },
        ]}
        onSubmit={(data) => console.log(data)}
      />
    </main>
  );
}
```

> **Note:** The `FormBuilder` import name and props must match the actual `@baseplate/patterns` export. Read `packages/patterns/src/form-builder/index.tsx` first to verify the exact component name and prop interface. Adapt the code above to match.

#### Verify
- [ ] Run `pnpm install` from monorepo root
- [ ] Run `pnpm dev` from `apps/test-home-services/` — server starts on port 3002
- [ ] Open `http://localhost:3002` — all validation tests show PASS
- [ ] Open `http://localhost:3002/forms` — FormBuilder renders without errors
- [ ] `pnpm typecheck` from monorepo root — all packages pass

#### Commit
```bash
git add -A && git commit -m "test: cross-vertical validation — home services test app"
```

---

### Step 18: Document Cross-Vertical Config

> **Purpose:** Document what a developer needs to change to build for a new vertical.
>
> **Skills:** None needed — direct writing. After writing, run `sync-docs` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/sync-docs/SKILL.md`) to verify the guide's module list matches the actual packages.
>
> **Subagent:** Delegate the initial draft to `documentation-engineer` (`Skills/Claude Code Subagents/categories/06-developer-experience/documentation-engineer.md`) — give it the cross-vertical test app results and the type alias list, and have it draft the guide. Use a cheaper model.

**File:** `Med Spa App/docs/CROSS_VERTICAL_GUIDE.md`

```markdown
# Building a New Vertical on Baseplate

## What You Get For Free

- Authentication (Supabase Auth)
- RBAC (role-based access control with generic permission keys)
- Audit logging
- Encryption module
- Scheduling (providers, rooms, appointments)
- Intake forms (dynamic, configurable)
- Payments (Stripe)
- Notifications (email + SMS via Connect API)
- Reporting (server-side aggregation via Connect API)
- Credit packages + deduction (via Connect API)
- All UI components (Button, Input, Form, Table, Modal, Layout)
- All patterns (FormBuilder, ConsentForm, SignatureCapture, etc.)

## What You Configure Per Vertical

| Concept | Med Spa Config | Home Services Config | Fitness Config |
|---------|---------------|---------------------|----------------|
| Tenant | "Clinic" | "Company" | "Studio" |
| Customer | "Patient" | "Customer" | "Member" |
| Resource | "Provider" | "Technician" | "Trainer" |
| Space | "Room" | "Service Area" | "Court/Lane" |
| Service | "Treatment" | "Repair" | "Class" |
| Intake | "Medical History" | "Problem Description" | "Health Goals" |

## Type Aliases

Use the generic aliases from `@baseplate/core`:

```typescript
import type { Tenant, Customer, Resource, Space } from '@baseplate/core';
```

These map to the existing types (`Clinic`, `Patient`, `Provider`, `Room`) but let your vertical use natural terminology.

## How to Build

1. Clone the repo
2. Create a new app in `apps/` (copy `portal-medspa` structure as starting point)
3. Configure labels/terminology in a constants file
4. Create vertical-specific intake form fields
5. Configure Stripe products for your pricing
6. Deploy

## What NOT to Change

- `packages/core/*` — these are vertical-agnostic
- `packages/ui/*` — these accept configurable props
- `packages/patterns/*` — these accept configurable props
- `packages/integrations/*` — these wrap external APIs
- `supabase/migrations/*` — the schema works for any vertical
```

#### Commit
```bash
git add -A && git commit -m "docs: cross-vertical configuration guide"
```

---

## Final Gate Check

### Phase 2 → Phase 3 Gate

> **Run `check-pr-readiness`** (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/check-pr-readiness/SKILL.md`) — the full gauntlet against all Phase 2 work before declaring the phase complete.

| Criteria | Status | How to Verify |
|----------|--------|---------------|
| All modules generalized (work for ANY vertical) | [ ] | Home services test app passes |
| 3 Connect endpoints live + documented | [ ] | SMS, billing, reporting all respond |
| Connect API auth + audit logging working | [ ] | API key validation + logAction on calls |
| API documentation complete | [ ] | OpenAPI spec + integration guide exist |
| Pricing structure designed (not activated) | [ ] | Stripe products created |
| Module library passes cross-vertical test | [ ] | Home services test app: all tests PASS |
| Portal successfully uses Connect APIs | [ ] | Portal SMS routes through Connect API |
| Load test passed | [ ] | 100 concurrent requests, p95 < 2s, 0% errors |

### Post-Gate Housekeeping

> **Skills for housekeeping:** Run `update-changelog` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/update-changelog/SKILL.md`) to record the Phase 2 completion in the project changelog. Run `sync-docs` (`Skills/Agent Core Systems/plugins/agentsystem-core/skills/sync-docs/SKILL.md`) to update CLAUDE.md, README, and any docs that reference the module count or app structure.

1. **Update `MASTER_PROGRESS.md`:**
   - Change Phase 2 status to `✅ Complete`
   - Add all Phase 2 commits to the Build Log table
   - Update module inventory (add `packages/core/src/packages` module — now 17 modules)
   - Update Built Module Inventory section

2. **Update `MASTER_MANUAL_CONFIG.md`:**
   - Check off all completed Phase 2 manual tasks (Sections 3A-3D)

3. **Update `Med Spa App/CLAUDE.md`:**
   - Update Phase Status section
   - Update structure to include connect-api, test-home-services
   - Update commands to mention port 3001 (Connect API)

4. **Verify final state:**
   - [ ] `pnpm typecheck` — all packages pass
   - [ ] `pnpm test` — all tests pass (including new packages module + auth tests)
   - [ ] `npx next build` from `apps/portal-medspa/` — builds successfully
   - [ ] `npx next build` from `apps/connect-api/` — builds successfully

---

## Appendix: Known Gaps Flagged (Not Fixed)

| Gap | Severity | Notes |
|-----|----------|-------|
| Middleware uses `role === 'owner'` instead of `canPerform()` | Medium | Pre-existing from Phase 1. Should migrate to centralized RBAC in a future refactor. |
| Sidebar uses `role === 'owner'` instead of `canPerform()` | Low | Same as above. |
| Audit log writing not wired in portal API routes | Medium | `logAction()` exists but isn't called from portal routes. Connect API calls it. |
| `@baseplate/hooks`, `@baseplate/next-api`, `@baseplate/dates` not adopted by portal | Low | Built/tested but unused. Refactor in future phase. |
| Settings page referenced in middleware but doesn't exist | Low | Route is guarded but page was never built. |
| `audit_logs` RLS policy for `connect-api` user ID | Low | `logAction` from Connect API uses `userId: 'connect-api'` which may not pass RLS. The service-role client bypasses RLS, so this works in practice. |

---

## Quick Reference: All Commits in Phase 2

| Step | Commit Message |
|------|---------------|
| 1 | `feat: add multi-vertical type aliases (Tenant/Customer/Resource/Space)` |
| 2 | `refactor: generalize RBAC permission keys (canViewAllRecords, canManageStaff)` |
| 3 | `chore: code cleanup — remove debug statements, TODOs, pilot references` |
| 4 | `docs: add comprehensive root README with architecture diagram` |
| 5 | `docs: add root .env.example template` |
| 6 | `feat: scaffold Connect API as standalone Next.js app` |
| 7 | `feat: add API-key authentication middleware for Connect API` |
| 8 | `feat: add POST /api/v1/communications/sms-reminder endpoint` |
| 9 | `feat: add POST /api/v1/billing/package-deduct endpoint + migration 0009` |
| 10 | `feat: add POST /api/v1/reporting/treatment-metrics endpoint` |
| 11 | `feat: portal calls Connect API for SMS instead of direct Twilio` |
| 13 | `feat: add rate limiting via Upstash Redis` |
| 14 | `docs: add OpenAPI spec + integration guide for Connect API` |
| 15 | `feat: pricing structure prep — usage logging + migration 0010` |
| 17 | `test: cross-vertical validation — home services test app` |
| 18 | `docs: cross-vertical configuration guide` |
