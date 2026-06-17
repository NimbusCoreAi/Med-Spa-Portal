# Hacker News — Launch Post

## Title Options

1. **Show HN: Baseplate — Open-source B2B SaaS platform with AI-native distribution**
2. **Show HN: We built a vertical-agnostic SaaS platform using MCP for AI agents**
3. **Show HN: Baseplate — 17 reusable modules, 2 verticals, MCP server, zero rewrites**

## Post Body

Hi HN! We're open-sourcing Baseplate — a monorepo for building vertical-specific B2B SaaS applications.

**The problem:** Every B2B SaaS (med spa, HVAC, accounting, etc.) needs the same plumbing: auth, RBAC, audit logs, payments, scheduling, SMS, email. Developers rebuild this from scratch every time.

**What we built:**

- **17 reusable core modules** (`@baseplate/core`) — auth, RBAC, audit, encryption, scheduling, intake, payments, reporting, and more
- **Connect API** — unified API layer for payments, communications, reporting, and intelligence
- **Rules-based intelligence** — 6 composable risk rules (no-show, churn, revenue drop, package abandonment, inventory expiry, follow-up gap)
- **MCP server** — 11 tools that let Claude/Cursor build with Baseplate automatically
- **Marketplace framework** — third-party developers can build and sell modules (80/20 revenue split)
- **2 verticals scaffolded** — Med Spa portal (26 routes) and Home Services portal (13 routes) using the same core with <5% modification

**Tech stack:** Next.js 14, React 18, TypeScript, Supabase (PostgreSQL + Auth), Stripe, Postmark, Twilio, Turborepo, pnpm.

**Build-first model:** We built the entire platform (Phases 1-4) before talking to a single customer. No revenue during build — customer onboarding starts in Phase 5.

**What's interesting technically:**

- The RBAC system uses a `createRBAC()` factory so each vertical defines its own roles without modifying core
- The intelligence layer has a hybrid approach: rules-engine (TypeScript) with heuristic fallbacks + ML pipeline (Python scikit-learn) ready for Phase 5 training
- The MCP server wraps Connect API operations so AI agents can scaffold apps, send SMS, check risk scores, browse marketplace — all from a single tool

**Repo:** [link] | **Docs:** ARCHITECTURE.md | **License:** MIT

We'd love feedback on the architecture, the module library approach, and the MCP server design.
