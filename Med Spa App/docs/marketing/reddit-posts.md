# Reddit Posts

## r/webdev — "I open-sourced 17 reusable SaaS modules + MCP server for AI agents"

**Body:**

I've been building Baseplate — an open-source monorepo for B2B SaaS apps. Instead of rebuilding auth, RBAC, payments, scheduling, and audit logs for every project, I extracted them into reusable packages.

**What's included:**
- `@baseplate/core` — 18 modules (auth, RBAC, audit, encryption, scheduling, billing, monitoring, etc.)
- `@baseplate/ui` — 6 UI components
- `@baseplate/patterns` — 6 complex patterns (digital signature, media upload, admin setup)
- `@baseplate/intelligence` — rules-based risk engine (6 rules)
- `@baseplate/marketplace` — module registry for third-party extensions
- `@baseplate/sdk` — typed Connect API client
- MCP server with 11 tools for Claude/Cursor integration

**Two verticals already built:** Med Spa (26 routes) and Home Services (13 routes) using the same core packages with <5% modification.

**Why I'm sharing:** The MCP server angle is interesting — you can literally tell Claude "build me a med spa portal" and it uses Baseplate modules automatically.

MIT licensed. Looking for feedback on the module API design.

---

## r/SaaS — "Build-first SaaS: I built the entire platform before talking to customers"

**Body:**

Most SaaS advice says "talk to customers first." I did the opposite.

I built Baseplate — a vertical SaaS platform — across 4 phases with zero customer contact:
- Phase 1: Med Spa portal (full app, 26 routes)
- Phase 2: Connect API (generalized for any vertical)
- Phase 3: Intelligence + marketplace + MCP server + home services vertical
- Phase 4: Open-source launch prep

**250 tests, 16 packages, 5 apps, zero customer revenue.**

The bet: if you build genuinely reusable infrastructure, customer onboarding becomes fast (weeks, not months). Two verticals scaffolded on the same core with <5% modification proves the model.

Now entering Phase 5: customer onboarding with real pilot clinics.

Anyone else taken a build-first approach? How did it go?

---

## r/Entrepreneur — "Open-sourcing my B2B SaaS platform with an AI-native distribution model"

**Body:**

I'm open-sourcing Baseplate — a platform for building vertical B2B SaaS apps (med spas, HVAC, accounting, etc.).

**The unique angle:** Instead of traditional marketing, I built an MCP (Model Context Protocol) server. When developers use Claude/Cursor and say "build me a clinic portal," Claude automatically discovers and uses Baseplate modules.

**Revenue model (Phase 5+):**
- Connect API: $99-299/mo per clinic
- Intelligence add-on: $99-199/mo
- Marketplace: 20% take-rate on third-party modules
- Target: $7-16K MRR at maturity

**What makes this different:**
- 17 reusable modules = 2-3 week head start for any new vertical
- MCP server = AI agents do the distribution for you
- Marketplace = developers build features you don't have time for

MIT licensed. Not looking for funding — just developers who want to build marketplace modules.
