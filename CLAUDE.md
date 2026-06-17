# CLAUDE.md — Advance Plan & Build

This is the **Baseplate OS** infrastructure project for AI-built B2B software (Med Spa vertical first).
It contains business planning docs, skill/agent collections, a token optimization system, and the Med Spa App monorepo.

**For full skill routing details, read `Skills/SKILL_ROUTING_GUIDE.md`.**
**For token optimization strategies, read `Token Saving/Token Saving.md`.**

---

## Token Optimization Protocol (Run Before ANY Task)

Every task costs tokens. Every message rereads the full conversation. Follow this protocol BEFORE starting work:

### 1. Check Context Health
- Run `audit_context_files` MCP tool on the project to see startup token overhead.
- If root CLAUDE.md exceeds 200 lines, run the **claude-md-audit** skill to trim it.
- If the project lacks a `.claudeignore`, create one excluding `node_modules/`, `dist/`, `.next/`, etc.

### 2. Estimate Task Cost
- Use `token_estimate` MCP tool on any large files you plan to read.
- Convert HTML/PDF/DOCX to markdown first with `convert_to_markdown` (33–90% token reduction).
- Compress log output with `compress_log_output` before pasting into context.

### 3. Session Hygiene
- If context is over ~120K tokens, run **session-handoff** skill first, then `/clear`.
- Never switch models mid-session — it breaks the cache (full re-read).
- Batch related questions into one message; edit mistakes instead of following up.
- Use `/rewind` (double-tap Escape) on failed attempts instead of correcting with new messages.

### 4. Delegate to Sub-Agents
- Research, code review, summarization → spin up a sub-agent (fresh context, no main-session pollution).
- Explicitly request cheaper models for sub-agents: "Use Haiku for this sub-agent."

**Token optimization skills:** `token-guard`, `session-handoff`, `claude-md-audit`
**Token optimization MCP server:** `token-guard-mcp-server` (5 tools — see below)

---

## Task → Skill Routing (Quick Reference)

| User Says | Use Skill | Collection |
|-----------|-----------|------------|
| "ship this", "build this", "figure it out" | `ship` | Agent Core |
| "add a feature", "implement X", "new feature" | `add-feature` | Agent Core |
| "modify X", "extend", "add to existing" | `modify-feature` | Agent Core |
| "remove X", "delete this feature", "rip out" | `remove-feature` | Agent Core |
| "this didn't work", "X is broken", "fix this bug" | `fix-bug` | Agent Core |
| "commit this", "commit and push" | `commit` / `commit-and-push` | Agent Core |
| "open a PR", "create pull request" | `open-pr` | Agent Core |
| "cut a release", "bump version" | `release` | Agent Core |
| "audit the codebase", "tech debt sweep" | `audit` | Agent Core |
| "review this code", "check my work" | `code-reviewer` subagent or `simplify` | General Skills / Agent Core |
| "write tests for X" | `write-tests` (via add/modify) or `test-driven-development` | Agent Core / General Skills |
| "add an e2e test" | `add-e2e-test` | Agent Core |
| "add empty/error states" | `add-empty-error-states` | Agent Core |
| "polish this UI", "UX checklist" | `polish-ui` | Agent Core |
| "check accessibility" | `audit-a11y` | Agent Core |
| "check mobile/responsive" | `audit-responsive` | Agent Core |
| "why is this slow" | `audit-perf` | Agent Core |
| "check auth/permissions" | `audit-authz` | Agent Core |
| "check SEO meta tags" | `audit-seo-meta` | Agent Core |
| "check analytics events" | `audit-analytics` | Agent Core |
| "design/build UI components" | `impeccable` | Impeccable |
| "resolve merge conflict" | `resolve-conflict` | Agent Core |
| "fix failing PR tests" | `fix-pr-tests` | Agent Core |
| "address PR comments" | `address-pr-comments` | Agent Core |
| "update docs" | `sync-docs` | Agent Core |
| "update changelog" | `update-changelog` | Agent Core |
| "generate test plan" | `testing-plan` | Agent Core |
| "add database migration" | `add-migration` | Agent Core |
| "tighten types" | `harden-types` | Agent Core |
| "session handoff", "summarize", "reset" | `session-handoff` | Token Optimization |
| "audit CLAUDE.md", "optimize context" | `claude-md-audit` | Token Optimization |
| "save tokens", "reduce tokens" | `token-guard` | Token Optimization |

### `/ship` — The Front Door

When in doubt, use `/ship`. It classifies the request (CREATE/EVOLVE/POLISH/REMOVE/FIX/AUDIT),
picks the right depth mode (fast/balanced/production), and routes to the correct skill automatically.

---

## Token Optimization MCP Server Tools

| Tool | When to Use |
|------|-------------|
| `token_estimate` | Before reading large files — check how expensive they'll be |
| `session_report` | Review token usage, cache hit rate, identify expensive sessions |
| `audit_context_files` | Audit CLAUDE.md and context files for bloat |
| `compress_log_output` | Before pasting CLI/server logs into context |
| `convert_to_markdown` | Before loading PDF/HTML/DOCX files (33–90% reduction) |

---

## Project Structure

```
Advance Plan & Build/
├── CLAUDE.md                         ← You are here (agent routing)
├── Skills/
│   ├── SKILL_ROUTING_GUIDE.md        ← Full routing tables (READ THIS)
│   ├── Token Optimization/           ← Token skills + MCP server
│   ├── Agent Core Systems/           ← Engineering pipeline (37 skills)
│   ├── Claude Code Subagents/        ← 153 domain agents (10 categories)
│   ├── General Skills/               ← TDD, debugging, plans, code review
│   ├── General Claude Code Rules/    ← Karpathy guidelines
│   ├── Grill Me Codex/               ← Codex handoff skills
│   └── Impeccable (Front End Design)/← UI design system (23 commands)
├── Token Saving/
│   └── Token Saving.md               ← Full token optimization guide
├── Phase & Build Docs/               ← Business plan, roadmap, phases
└── Med Spa App/                      ← Application monorepo (pnpm/turborepo)
```

---

## Behavioral Guidelines

1. **Think before coding** — state assumptions, surface tradeoffs, ask when unclear.
2. **Simplicity first** — minimum code that solves the problem. Nothing speculative.
3. **Surgical changes** — touch only what you must. Match existing style.
4. **Goal-driven** — define success criteria, loop until verified.
5. **Token-conscious** — every message costs tokens. Batch, delegate, convert, compress.
6. **Keep MASTER_PROGRESS.md current** — after completing any phase milestone, sub-phase, audit, or significant commit, update `MASTER_PROGRESS.md` at the project root. This is the **single source of truth** for project status. When updating: (1) change the "At a Glance" table status, (2) check off completed items in the relevant "What's Left" section, (3) add the commit hash + description to the "Build Log" table. Never update status in the Phase & Build Docs planning files — always update `MASTER_PROGRESS.md` instead.

---

## Med Spa App Stack

- **Monorepo:** pnpm + Turborepo (apps/*, packages/*)
- **Frontend:** Next.js, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments:** Stripe
- **Comms:** Postmark (email), Twilio (SMS)
- **No CLAUDE.md yet** — create one when starting work in that directory.
