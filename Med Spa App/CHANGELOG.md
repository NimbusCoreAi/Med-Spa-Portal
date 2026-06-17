# Changelog

All notable changes to Baseplate are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — Phase 4 (Open-Source Launch)
- Open-source repo preparation (LICENSE, CONTRIBUTING, ARCHITECTURE, CHANGELOG)
- GitHub issue templates (bug report, feature request, module request)
- GitHub PR template + Code of Conduct
- Enhanced CI/CD pipeline (builds all apps, all packages)
- Marketplace UI in portal (browse, search, install, uninstall)
- Marketplace developer spec + guide + reference module
- MCP server enhanced with scaffold, deploy, marketplace tools
- `@baseplate/sdk` typed Connect API client package
- Python ML training pipeline (features, train, serve, evaluate, notebook)
- Connect API churn-prediction endpoint with heuristic fallback
- Marketing materials (HN, Reddit, Twitter, landing page, dev outreach)

### Fixed — Phase 4 Launch Gap Fixes
- Modularized MCP server tools: split monolithic `tools/index.ts` (226 lines) into
  8 domain files (communications, billing, reporting, intelligence, marketplace,
  scaffold, deploy, shared) + clean import aggregator
- Restructured `@baseplate/sdk`: extracted `ConnectClient` to `connect-client.ts`,
  added `types.ts` with request/response interfaces, barrel `index.ts` re-export
- Enhanced CI workflow: added Python 3.11 setup + `py_compile` validation for
  ml-models pipeline, added turbo build cache action
- Added Python patterns to `.gitignore` (`__pycache__/`, `*.pyc`, `*.pkl`, `.venv/`)
- Enriched package.json metadata (description, keywords, license, author) for
  `@baseplate/sdk` and `mcp-server` packages

### Added — Phase 5 Code Gaps
- **Pricing page** (`/pricing`) with 3-tier comparison cards (Pilot/Connect/Intelligence)
- **Stripe subscription billing**: `@baseplate/core/billing` module with checkout sessions,
  billing portal, webhook lifecycle handling, subscription CRUD + status tracking
- **Self-service signup**: enhanced signup API with plan selection (pilot vs paid),
  signup success page with plan-specific messaging
- **Feedback collection**: feedback table + API (POST/GET with auto-priority),
  dashboard feedback page with empty state, floating FeedbackWidget on all dashboard pages
- **Production observability**: `@baseplate/core/monitoring` module (logError, logInfo,
  logWarn, logMetric) with automatic secret redaction, health check endpoint,
  route-level + global error boundaries, 12 monitoring tests
- Migrations: `0014_subscriptions.sql`, `0015_feedback.sql` with RLS policies
- New env vars: `STRIPE_PRICE_CONNECT`, `STRIPE_PRICE_INTELLIGENCE`

### Fixed — Phase 5 Security Review
- Subscription create API: replaced fake header-based auth with `getUserContext()` session check
- Subscription portal API: removed IDOR vulnerability — now derives customer ID from session,
  no longer accepts client-supplied `customerId`
- Feedback API: replaced broken `getServiceSupabaseClient().auth.getUser()` with
  `getUserContext()` for proper cookie-aware session authentication
- Signup-enhanced API: changed `email_confirm` from `true` to `false` to require email verification
- Billing settings page: removed hidden form field that leaked Stripe customer ID to client HTML

## [0.3.0] — Phase 3 (Intelligence & Ecosystem)

### Added
- `@baseplate/intelligence` package with rules-engine (6 risk rules) and ML predictions
- `@baseplate/marketplace` package with module registry + installer
- Connect API endpoints: intelligence risk-score, marketplace modules + install
- `apps/portal-homeservices/` — full home services portal (13 routes)
- `apps/mcp-server/` — MCP server with 5 tools (JSON-RPC over stdio)
- Configurable RBAC: `createRBAC()` factory for custom roles per vertical
- Migration 0012: synthetic intelligence test data (3 clinics, 5 patients)
- Migration 0013: marketplace tables with RLS policies
- ML scaffolding: PredictionModel interface, 3 predictor stubs, feature extractors
- `docs/INTELLIGENCE_GUIDE.md` developer guide
- `PHASE_3_EXECUTION_PLAN.md` build guide with skill mappings
- 25 intelligence tests (250 total tests, 16 packages)

## [0.2.0] — Phase 2 (Platform Layer)

### Added
- Connect API as standalone Next.js app with API-key authentication
- 3 Connect API endpoints: SMS reminder, package-deduct, treatment-metrics
- Rate limiting via Upstash Redis
- Usage logging (`api_usage` table)
- OpenAPI 3.0 spec
- Cross-vertical validation app (`apps/test-home-services/`)
- Multi-vertical type aliases (Tenant, Customer, Resource, Space)
- `@baseplate/core/packages` module (credit package deduction)
- Migration 0009: credit packages + package transactions
- Migration 0010: API usage logging
- `docs/CROSS_VERTICAL_GUIDE.md`

### Fixed
- Atomic package deduction via Postgres RPC (race condition eliminated)
- RLS policies on credit_packages (clinic owners were locked out)
- Typed errors in packages module (NotFoundError, ConflictError, AppError)
- Connect-client env validation + 10s timeout
- RBAC PERMISSIONS map frozen, `import type` applied

## [0.1.0] — Phase 1 (Med Spa Portal)

### Added
- Monorepo scaffold (pnpm + Turborepo)
- `@baseplate/core` with 17 modules: auth, rbac, audit-logs, encryption, config,
  types, clinics, intake, patients, scheduling, reporting, errors, bookings,
  availability, notifications, utils, packages
- `@baseplate/ui` with 6 components: Button, Input, Form, Table, Modal, Layout
- `@baseplate/patterns` with 6 patterns: admin-setup, invite-user,
  digital-signature, media-upload, form-builder, consent-form
- `@baseplate/hooks`, `@baseplate/next-api`, `@baseplate/dates`
- `@baseplate/stripe`, `@baseplate/postmark`, `@baseplate/twilio`
- Next.js 14 portal with 26 routes (dashboard, patients, calendar, providers, etc.)
- Supabase Auth with @supabase/ssr cookie-based sessions
- RBAC enforcement (middleware, API routes, sidebar)
- HIPAA compliance doc with PHI_ENABLED flag
- 8 SQL migrations (schema, RLS, seed data)
- CI/CD pipeline (GitHub Actions)
- 203 tests across 30 suites

### Architecture Fixes
- Unified types module (no scattered type definitions)
- @supabase/ssr for cookie-based session management
- Session-based clinicId (no env var needed)
- RBAC IDOR protection on all API routes
- Server-side reporting aggregation
- Stripe redirect pages for payment flow
