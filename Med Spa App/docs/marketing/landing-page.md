# Landing Page Copy

## Headline
**Baseplate: Open-source B2B SaaS platform with AI-native distribution**

## Sub-headline
17 reusable modules. 2 verticals. MCP server for Claude/Cursor. Stop rebuilding auth, RBAC, and payments from scratch.

## Quick Start
```bash
git clone baseplate
pnpm install
pnpm dev
```

## Features (6 cards)

### 1. 🏗️ Reusable Core
18 modules: auth, RBAC, audit logs, encryption, scheduling, payments, reporting, billing, monitoring. Works for any B2B vertical.

### 2. 🔌 Connect API
Unified API layer for payments, SMS, billing, reporting, and intelligence. API-key auth. Rate-limited. Usage-tracked.

### 3. 🧠 Intelligence Layer
6 risk rules (no-show, churn, revenue drop, package abandonment, inventory expiry, follow-up gap). ML pipeline ready for training.

### 4. 🤖 MCP Server
11 tools for Claude/Cursor. Tell AI "build me a clinic portal" and it scaffolds with Baseplate modules automatically.

### 5. 🏪 Marketplace
Third-party developers build and sell modules. 80/20 revenue split. One-click install. Stripe-billed.

### 6. 📦 SDK
Typed TypeScript client for the Connect API. Import and go.

## How It Works (3 steps)
1. **Scaffold** — Clone, install, configure env vars
2. **Connect** — Wire Connect API for payments, SMS, intelligence
3. **Launch** — Deploy to Vercel, onboard customers

## Pricing (Phase 5+)

| Tier | Price | Includes |
|------|-------|----------|
| Open Source | Free | All modules, full source, MIT license |
| Connect API | $99-299/mo | Hosted API endpoints, rate limiting, usage logging |
| Intelligence | $99-199/mo add-on | Risk scoring, churn prediction, ML models (Phase 5+) |
| Marketplace | 20% take rate | Developers keep 80% of module revenue |

## Social Proof (placeholder)
- 250 tests passing
- 16 packages
- 5 apps
- 2 verticals scaffolded
- MIT licensed

## FAQ

**Is this production-ready?**
The platform is code-complete and tested. Production deployment happens in Phase 5 with pilot customers.

**Can I use this for my own vertical?**
Yes. Clone the repo, use `createRBAC()` for your roles, and build your portal app. See CROSS_VERTICAL_GUIDE.md.

**Does it work with Claude/Cursor?**
Yes. The MCP server exposes 11 tools. See MCP_SERVER.md for setup.

**What's the catch?**
Build-first model — no revenue until Phase 5 customer onboarding. We built everything before talking to customers.

## CTA
[Star on GitHub] [Read the Docs] [Join Discord]
