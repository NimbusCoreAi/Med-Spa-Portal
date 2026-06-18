# Med Spa App — Baseplate OS

Monorepo for the Med Spa portal (Next.js) + reusable Baseplate modules (packages).

## Commands

```bash
pnpm install          # Install deps
pnpm dev              # Start dev server (portal on :3000, connect-api on :3001, home-services on :3002)
pnpm build            # Build all packages + apps
pnpm test             # Run all tests
pnpm typecheck        # TypeScript check (no emit)
```

## Structure

```
apps/
  portal-medspa/        # Next.js 14 App Router frontend (27 routes, 12 API routes)
  portal-homeservices/  # Next.js 14 — Home Services portal (Phase 3B, 13 routes)
  connect-api/          # Next.js 14 — Connect API (8 routes, API-key auth)
  mcp-server/           # Standalone MCP server (11 tools, JSON-RPC over stdio)
  test-home-services/   # Cross-vertical validation test app
packages/
  core/                 # @baseplate/core — 18 modules (auth, rbac + createRBAC factory, audit, encryption,
                        #   config, types, clinics, intake, patients, scheduling, reporting, errors,
                        #   bookings, availability, notifications, utils, packages, monitoring, billing)
                        #   Module inventory: run `pnpm sync-modules` to regenerate from source.
  intelligence/         # @baseplate/intelligence — rules-engine (6 rules), predictions, features (Phase 3A+3E)
  marketplace/          # @baseplate/marketplace — registry, installer (Phase 3C)
  sdk/                  # @baseplate/sdk — typed Connect API client (Phase 4C)
  ui/                   # @baseplate/ui — Button, Input, Form, Table, Modal, Layout
  patterns/             # @baseplate/patterns — digital-signature, admin-setup, invite-user,
                        #   media-upload, form-builder, consent-form
  hooks/                # @baseplate/hooks — useApiQuery, useApiMutation
  next-api/             # @baseplate/next-api — createRouteHandler, createGetHandler, jsonResponse
  dates/                # @baseplate/dates — startOfWeek, addDays, DATE_RANGE_PRESETS, etc.
  integrations/
    stripe/             # @baseplate/stripe — checkout sessions + webhooks
    postmark/           # @baseplate/postmark — transactional email (HTML-escaped)
    twilio/             # @baseplate/twilio — SMS
ml-models/              # Python ML training pipeline (Phase 4D — features, train, serve, evaluate)
supabase/
  migrations/           # SQL migrations (0001–0027)
docs/
  HIPAA_COMPLIANCE.md   # HIPAA posture: free-tier non-PHI with BAA upgrade path
  INTELLIGENCE_GUIDE.md # Intelligence layer developer guide (Phase 3A)
  CROSS_VERTICAL_GUIDE.md # How to configure Baseplate for a new vertical
  MARKETPLACE_SPEC.md   # Module manifest format, security, pricing (Phase 4B)
  MARKETPLACE_GUIDE.md  # Step-by-step module authoring guide (Phase 4B)
  marketing/            # Launch materials — HN, Reddit, Twitter, landing page (Phase 4E)
examples/
  example-module/       # Reference marketplace module implementation
```

## Module Library Mandate

Reusable code goes in `packages/`. Med-spa-specific code goes in `apps/portal-medspa/`.
Ask: "Would another vertical use this?" If yes → extract to `packages/`.

## Environment

Copy `.env.example` to `.env.local` and fill in all values.
13+ env vars required for full functionality (see `.env.example`).
No `NEXT_PUBLIC_CLINIC_ID` needed — clinicId is extracted from the session automatically.

## Phase Status (Build-First Structure)

> Customer onboarding moved to Phase 5. Phases 1-4 are pure build.

- **Phase 1 (1A–1D + Audit + Module Extraction + Arch Fixes):** ✅ Code complete
- **Phase 2 (2A–2D + Polish):** ✅ Code complete + polished
- **Phase 3 (3A–3E):** ✅ Code complete — intelligence, home services, marketplace, MCP server, ML scaffolding
- **Phase 4 (4A–4E):** ✅ Code complete — repo prep, marketplace UI, MCP enhancement (11 tools), SDK, ML pipeline, marketing
- **Phase 5 (Customer Onboarding):** ✅ Code complete — pricing/billing, observability, self-service signup, feedback, security audited and remediated (41 findings across 11 phases)

### Phase 1 Remaining (manual only)
- Staging deploy + smoke test (follow `../PHASE_1_COMPLETION_GUIDE.md`)

### Phase 2 Remaining (manual only)
- Deploy Connect API to Railway, set up Upstash Redis, create Stripe products, load test

### Phase 3 Remaining (manual only)
- Deploy home services portal + MCP server to Railway
- Run migrations 0012 + 0013 on staging Supabase

### Phase 4 Remaining (manual only)
- Push to GitHub (public), launch marketing campaign
- Run migrations on staging Supabase

## Verification

All gates pass as of Phase 4 completion:
- `pnpm typecheck` — 17/17 packages pass
- `pnpm test` — 270+ tests across all suites, 0 failures
- `pnpm build` — portal-medspa (27 routes), portal-homeservices (13 routes), connect-api (8 routes)
- Coverage: packages/ui 100%, packages/patterns 92.7% (both ≥80% threshold)

## Key Architecture Decisions

- **ClinicId from session**: All dashboard pages and API routes extract `clinicId` via `getUserContext()`. No env var needed.
- **@supabase/ssr**: Cookie-based session management. Middleware refreshes sessions on every `/dashboard/*` request.
- **RBAC**: Full enforcement + configurable via `createRBAC()` factory. Default `owner/staff/patient` roles preserved.
- **Intelligence**: Rules-based risk scoring (6 rules) + ML pipeline (Python scikit-learn). Churn-prediction endpoint uses heuristic fallback until Phase 5 training.
- **Marketplace**: Registry + installer + Connect API endpoints + portal UI. Module spec + guide for developers. 80/20 revenue split.
- **MCP Server**: JSON-RPC over stdio, 11 tools wrapping Connect API. Scaffold + deploy tools for AI-native distribution.
- **SDK**: `@baseplate/sdk` typed Connect API client for external developers.
- **Reporting**: Server-side aggregation via `/api/reporting/metrics` API route.
- **PHI_ENABLED flag**: Feature flag in config (defaults `false`). Gates PHI field types. See `docs/HIPAA_COMPLIANCE.md`.

---

## MASTER_PROGRESS.md Maintenance

**After completing any work session here, update [`../MASTER_PROGRESS.md`](../MASTER_PROGRESS.md):**
1. Update the "At a Glance" table if a milestone status changed
2. Check off completed items in the relevant "What's Left" section
3. Add the commit hash + description to the "Build Log" table

This is the single source of truth for project status — keep it current. Do NOT update status in the Phase & Build Docs planning files.
