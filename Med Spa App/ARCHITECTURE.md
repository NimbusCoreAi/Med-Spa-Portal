# Architecture

> This document describes the full architecture of the Baseplate platform.
> For build status, see [MASTER_PROGRESS.md](../MASTER_PROGRESS.md).

## Overview

Baseplate is an open-source monorepo for building vertical-specific B2B SaaS applications. The Med Spa portal is the first vertical; Home Services is the second. The architecture is designed to generalize across verticals with minimal core modifications.

```
┌─────────────────────────────────────────────────────────────┐
│                        Baseplate Monorepo                    │
│                                                              │
│  apps/                    packages/                          │
│  ┌──────────────┐        ┌──────────────────────┐           │
│  │ portal-medspa│───────▶│ @baseplate/core       │           │
│  │ portal-home  │───────▶│ @baseplate/ui         │           │
│  │ connect-api  │───────▶│ @baseplate/patterns   │           │
│  │ mcp-server   │───────▶│ @baseplate/intelligence│          │
│  └──────────────┘        │ @baseplate/marketplace│           │
│         │                 │ @baseplate/sdk        │           │
│         ▼                 │ @baseplate/hooks      │           │
│  ┌──────────────┐        │ @baseplate/dates      │           │
│  │  Supabase    │        │ @baseplate/next-api   │           │
│  │  (PostgreSQL)│        │ @baseplate/stripe     │           │
│  │  Auth + RLS  │        │ @baseplate/postmark   │           │
│  └──────────────┘        │ @baseplate/twilio     │           │
│         │                 └──────────────────────┘           │
│         ▼                                                    │
│  ┌──────────────┐        ┌──────────────────────┐           │
│  │ ml-models/   │◀──────▶│ Connect API           │           │
│  │ (Python ML)  │        │ (7+ endpoints)        │           │
│  └──────────────┘        └──────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
Med Spa App/
  apps/
    portal-medspa/        # Med Spa portal (26 routes)
    portal-homeservices/  # Home Services portal (13 routes)
    connect-api/          # Connect API (7 endpoints, API-key auth)
    mcp-server/           # MCP server (10+ tools, JSON-RPC over stdio)
    test-home-services/   # Cross-vertical validation app
  packages/
    core/                 # 18 modules (auth, rbac, audit, encryption, billing, monitoring, etc.)
    intelligence/         # Rules-engine (6 rules) + ML predictions
    marketplace/          # Module registry + installer
    sdk/                  # Typed Connect API client (Phase 4)
    ui/                   # 6 UI components (Button, Input, Form, Table, Modal, Layout)
    patterns/             # 6 patterns (admin-setup, invite-user, etc.)
    hooks/                # useApiQuery, useApiMutation
    next-api/             # Route handler factories
    dates/                # Date utilities
    integrations/
      stripe/             # Payment processing
      postmark/           # Email
      twilio/             # SMS
  supabase/
    migrations/           # 13 SQL migrations (0001-0013)
  ml-models/              # Python ML pipeline (Phase 4)
  docs/                   # Developer guides
  examples/               # Reference marketplace module
```

## Package Dependency Graph

```
                    @baseplate/core
                   /        |          \
     @baseplate/ui   @baseplate/patterns   @baseplate/intelligence
          |              |                        |
          v              v                        v
     apps/portal-*   apps/portal-*        apps/connect-api
                                              |
                                     @baseplate/marketplace
```

All apps depend on `@baseplate/core`. Intelligence and marketplace are optional add-ons.

## Multi-Vertical Design

The platform supports multiple business verticals through:

1. **Type aliases:** `Tenant = Clinic`, `Customer = Patient`, `Resource = Provider`, `Space = Room`
2. **Configurable RBAC:** `createRBAC<TRoles>()` factory lets each vertical define its own roles
3. **Shared core modules:** Auth, audit, encryption, scheduling, payments — all vertical-agnostic
4. **Vertical-specific apps:** Each vertical gets its own `apps/portal-[vertical]/` app

### Vertical-agnostic proof

Phase 3 built the home services portal using `@baseplate/core` with <5% modifications (only RBAC factory addition). This proves the core is truly reusable.

## Connect API

The Connect API is a standalone Next.js app with API-key authentication. It provides unified endpoints that any Baseplate portal can call.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/communications/sms-reminder` | POST | Send SMS reminder |
| `/api/v1/billing/package-deduct` | POST | Deduct credit package session |
| `/api/v1/reporting/treatment-metrics` | POST | Get revenue/appointment metrics |
| `/api/v1/intelligence/risk-score` | POST | Get risk flags for customer/tenant |
| `/api/v1/intelligence/churn-prediction` | POST | ML churn prediction (heuristic fallback until Phase 5) |
| `/api/v1/marketplace/modules` | GET | Browse marketplace modules |
| `/api/v1/marketplace/install` | POST/DELETE | Subscribe/unsubscribe module |
| `/api/v1/intelligence/churn-prediction` | POST | ML churn prediction (Phase 4) |

**Rate limiting:** Upstash Redis with graceful degradation (skips if env vars missing).
**Usage logging:** Every request logged to `api_usage` table.
**Auth:** `X-API-Key` header validated against `CONNECT_API_KEY` env var.

## Intelligence Layer

### Rules Engine (Phase 3)
6 composable risk rules that evaluate customer/tenant data:

| Rule | Severity | Trigger |
|------|----------|---------|
| No-Show Risk | HIGH | 2+ no-shows in 90 days |
| Churn Risk | MEDIUM | No appointment in 60+ days |
| Revenue Drop | LOW | Revenue down >15% vs prior period |
| Package Abandonment | MEDIUM | Remaining sessions, 90+ days inactive |
| Inventory Expiry | MEDIUM | Products expiring within 30 days |
| Follow-Up Gap | LOW | No follow-up 14+ days after service |

### ML Predictions (Phase 3E + 4D)
- TypeScript interfaces with heuristic fallbacks (rules-engine)
- Python training pipeline ready for Phase 5 model training
- Connect API endpoint with hybrid approach (ML model → heuristic fallback)

## MCP Server

The MCP server exposes Baseplate operations to AI agents (Claude, Cursor) via JSON-RPC over stdio.

Tools (11): `send_sms_reminder`, `deduct_package`, `get_treatment_metrics`, `get_risk_score`, `get_churn_prediction`, `browse_marketplace`, `install_module`, `uninstall_module`, `list_installed_modules`, `scaffold_vertical`, `deploy_app`.

## Data Flow

```
User → Portal (Next.js) → Connect API → Supabase (PostgreSQL)
                                      → Stripe / Twilio / Postmark
                                      → Intelligence (rules-engine)
                                      → ML Server (Python, when trained)
```

## Security Model

- **Row-Level Security (RLS):** Every table has RLS policies scoped by clinic ownership
- **Auth:** Supabase Auth with @supabase/ssr cookie-based sessions
- **API Auth:** Connect API uses X-API-Key header
- **RBAC:** Role-based access control enforced in middleware, API routes, and UI
- **PHI_ENABLED flag:** Feature flag gates protected health information fields
- **Audit logging:** Every significant action logged to `audit_logs` table

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, React 18, Tailwind CSS |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| API | Connect API (separate Next.js app) |
| Intelligence | Rules-engine (TypeScript) + ML pipeline (Python) |
| Payments | Stripe |
| Email | Postmark |
| SMS | Twilio |
| Auth | Supabase Auth + @supabase/ssr |
| AI Agent | MCP Server (JSON-RPC over stdio) |
| Hosting | Railway |
| Monorepo | pnpm + Turborepo |
