# Baseplate — AI-Built B2B SaaS Platform

> Open-source monorepo for building vertical-specific SaaS applications.
> Med Spa portal is the first vertical. Home Services is the second. Built to generalize.

## Quick Start

```bash
git clone <PUBLIC_REPO_URL>
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
| API | Connect API (separate Next.js app, API-key auth, 8 endpoints) |
| Intelligence | Rules-based risk engine (6 rules) + Python ML pipeline |
| Payments | Stripe |
| Email | Postmark |
| SMS | Twilio |
| Auth | Supabase Auth + @supabase/ssr |
| AI Agent Integration | MCP Server (11 tools, JSON-RPC over stdio) |
| Hosting | Railway |

## Architecture

```
apps/
  portal-medspa/          # Next.js 14 — Med Spa portal (27 routes)
  portal-homeservices/    # Next.js 14 — Home Services portal (13 routes)
  connect-api/            # Next.js 14 — Connect API (8 endpoints, API-key auth)
  mcp-server/             # Standalone MCP server (11 tools, Claude Desktop ready)
  test-home-services/     # Cross-vertical validation test app
packages/
  core/                   # @baseplate/core — 18 modules + createRBAC() factory
  intelligence/           # @baseplate/intelligence — rules-engine (6 rules) + ML predictions
  marketplace/            # @baseplate/marketplace — module registry + installer
  sdk/                    # @baseplate/sdk — typed Connect API client
  ui/                     # @baseplate/ui — 6 components
  patterns/               # @baseplate/patterns — 6 patterns
  hooks/                  # @baseplate/hooks — useApiQuery, useApiMutation
  next-api/               # @baseplate/next-api — route handler factories
  dates/                  # @baseplate/dates — date utilities
  integrations/
    stripe/               # @baseplate/stripe
    postmark/             # @baseplate/postmark
    twilio/               # @baseplate/twilio
ml-models/                # Python ML training pipeline (scikit-learn, FastAPI)
supabase/
  migrations/             # SQL migrations (0001-0027)
docs/
  HIPAA_COMPLIANCE.md
  INTELLIGENCE_GUIDE.md
  CROSS_VERTICAL_GUIDE.md
  MARKETPLACE_SPEC.md
  MARKETPLACE_GUIDE.md
  marketing/              # Launch materials (HN, Reddit, Twitter, landing page)
examples/
  example-module/         # Reference marketplace module
```

## Module Library

| Package | Modules | Purpose |
|---------|---------|---------|
| @baseplate/core | 17 | Auth, RBAC (+ factory), audit, encryption, scheduling, intake, payments, reporting, errors, bookings, availability, notifications, utils, config, types, clinics, packages |
| @baseplate/intelligence | 12 | 6 risk rules, evaluateRisk orchestrator, 3 ML predictor stubs, feature extractors, training pipeline |
| @baseplate/marketplace | 5 | searchModules, getModule, installModule, uninstallModule, getInstalledModules |
| @baseplate/sdk | 8 | Typed Connect API client (all 8 endpoints) |
| @baseplate/ui | 6 | Button, Input, Form, Table, Modal, Layout |
| @baseplate/patterns | 6 | Digital signature, admin setup, invite user, media upload, form builder, consent form |
| @baseplate/hooks | 2 | useApiQuery, useApiMutation |
| @baseplate/next-api | 4 | createRouteHandler, createGetHandler, jsonResponse, errorResponse |
| @baseplate/dates | 8+ | Date utilities, range presets |
| @baseplate/stripe | 2 | createPaymentLink, constructWebhookEvent |
| @baseplate/postmark | 2 | sendEmail, sendAppointmentConfirmationEmail |
| @baseplate/twilio | 2 | sendSMS, sendAppointmentReminderSMS |

## Connect API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/communications/sms-reminder` | POST | Send SMS appointment reminder |
| `/api/v1/billing/package-deduct` | POST | Deduct session from credit package |
| `/api/v1/reporting/treatment-metrics` | POST | Get revenue/appointment metrics |
| `/api/v1/intelligence/risk-score` | POST | Get customer/tenant risk score |
| `/api/v1/intelligence/churn-prediction` | POST | ML churn prediction with heuristic fallback |
| `/api/v1/marketplace/modules` | GET | Browse/search marketplace modules |
| `/api/v1/marketplace/install` | POST/DELETE | Subscribe/unsubscribe from module |

## MCP Server Tools

| Tool | Description |
|------|-------------|
| `send_sms_reminder` | Send SMS via Connect API |
| `deduct_package` | Deduct credit package session |
| `get_treatment_metrics` | Retrieve metrics |
| `get_risk_score` | Get risk flags for customer |
| `get_churn_prediction` | ML churn prediction |
| `browse_marketplace` | Browse marketplace modules |
| `install_module` | Install marketplace module |
| `uninstall_module` | Remove marketplace module |
| `list_installed_modules` | List installed modules |
| `scaffold_vertical` | Scaffold a new Baseplate vertical app |
| `deploy_app` | Get deployment instructions |

## Commands

```bash
pnpm dev           # Start dev (portal :3000, connect-api :3001, home-services :3002)
pnpm build         # Build all packages + apps
pnpm test          # Run all tests (270+ tests)
pnpm typecheck     # TypeScript check all packages (17 packages)
```

## License

MIT
