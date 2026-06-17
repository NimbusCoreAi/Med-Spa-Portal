# Skill Routing Guide

The complete reference for knowing which skill or agent to use for any task.
Read this before starting any non-trivial work.

---

## Table of Contents

1. [Token Optimization Protocol](#1-token-optimization-protocol-always-run-first)
2. [Task → Skill Routing](#2-task--skill-routing)
3. [Skill Collections](#3-skill-collections)
4. [Subagent Catalog](#4-subagent-catalog-153-agents)
5. [Decision Trees](#5-decision-trees)
6. [Phase Integration](#6-phase--build-docs-integration)

---

## 1. Token Optimization Protocol (Always Run First)

Before starting ANY task, follow this protocol. Every token wasted on bloat, re-reads, or cache
breaks compounds across the entire session.

### Pre-Task Checklist

| Step | Action | Tool / Skill |
|------|--------|-------------|
| 1 | Check startup token overhead | MCP: `audit_context_files` |
| 2 | If CLAUDE.md is bloated (>200 lines) | Skill: **claude-md-audit** |
| 3 | Estimate cost of files you'll read | MCP: `token_estimate` |
| 4 | Convert PDFs/HTML/DOCX to markdown | MCP: `convert_to_markdown` |
| 5 | Compress logs before pasting | MCP: `compress_log_output` |
| 6 | If session is >120K tokens, hand off first | Skill: **session-handoff** |
| 7 | Delegate research/review to sub-agents | Request Haiku model for cheap tasks |

### Token Optimization Skills (3)

| Skill | Trigger Phrases | Purpose |
|-------|----------------|---------|
| **token-guard** | "save tokens", "reduce tokens", "context window", "session limit", "cache", "burning tokens" | Master behavioral skill — enforces all token-saving habits (cache preservation, session resets, prompting, model selection, file handling) |
| **session-handoff** | "summarize", "handoff", "start fresh", "new session", "reset context", "/compact", "preserve progress" | Generates structured handoff summary for clean `/clear` resets at ~120K tokens |
| **claude-md-audit** | "audit CLAUDE.md", "optimize context", "why is session slow", "too many startup tokens" | Scans CLAUDE.md and context files for bloat, recommends offloading to routed files |

### Token Optimization MCP Server (5 tools)

**Server name:** `token-guard-mcp-server`
**Location:** `Skills/Token Optimization/plugins/token-guard/mcp-servers/token-guard-mcp-server/`

| Tool | What It Does | When to Call |
|------|-------------|-------------|
| `token_estimate` | Count tokens in text/files, show context window % and depth cost multiplier | Before reading large files; before pasting content |
| `session_report` | Parse Claude Code JSONL session logs — input/output/cache tokens, hit rate, models | Reviewing token usage; identifying expensive sessions |
| `audit_context_files` | Scan project for CLAUDE.md + context files, report per-file costs + recommendations | At project start; when sessions feel expensive |
| `compress_log_output` | Compress noisy CLI/server logs (timestamps, repeated lines, blank lines) | Before pasting any log output into context |
| `convert_to_markdown` | Convert HTML/PDF/text → markdown (33–90% token reduction) | Before loading any PDF, HTML, or DOCX |

### Cache Preservation Rules (Critical)

| Action | Cache Impact |
|--------|-------------|
| Switching models mid-session | **BREAKS** cache — full re-read |
| `opus plan` model setting toggle | **BREAKS** cache each toggle |
| Session idle >1 hour (subscription) / >5 min (API) | **BREAKS** cache — TTL expires |
| Changing system prompt | **BREAKS** cache |
| Editing CLAUDE.md mid-session | **SAFE** — applies on restart |
| Normal conversation continuation | **SAFE** — incremental growth |

---

## 2. Task → Skill Routing

### Engineering Pipeline (Agent Core Systems — 37 skills)

The front door is `/ship`. It auto-classifies and routes. Use it when unsure.

#### Create / Build

| User Says | Skill | Notes |
|-----------|-------|-------|
| "ship this", "figure it out", "autopilot" | **ship** | Classifies → routes to the right skill + depth mode |
| "add a feature", "implement X", "new feature" | **add-feature** | Full pipeline: clarify → plan → implement → test → review |
| "add database migration" | **add-migration** | Safe schema changes (additive/mutating/destructive) |
| "add e2e test" | **add-e2e-test** | Playwright browser tests for user flows |
| "add empty/error states" | **add-empty-error-states** | Empty + error UI states after data fetching wired |
| "add observability", "instrument this" | **add-observability** | (Internal — called by add-feature/modify-feature) |
| "add regression test" | **add-regression-test** | Pin a bug fix so it can't return |

#### Modify / Extend

| User Says | Skill | Notes |
|-----------|-------|-------|
| "modify X", "extend", "add to existing" | **modify-feature** | Lighter than add-feature; maps contract shifts |
| "polish this UI", "UX checklist" | **polish-ui** | Auto-fixes UX gaps on UI changes |
| "propagate this pattern" | **propagate-ui-pattern** | Apply a UX pattern across sibling components |
| "reorganize files", "tidy this directory" | **reorganize-files** | Regroup files + update all references |
| "tighten types", "remove anys" | **harden-types** | Strip `any`, `as`, `@ts-ignore`; add zod at boundaries |
| "rename this enum/status", "domain model update" | **realign** | (Internal — enum/state changes with data migration) |

#### Remove / Delete

| User Says | Skill | Notes |
|-----------|-------|-------|
| "remove X", "delete this feature", "rip out" | **remove-feature** | Safe delete + sweep all orphaned dead code |

#### Fix / Debug

| User Says | Skill | Notes |
|-----------|-------|-------|
| "this didn't work", "X is broken" | **fix-bug** | Runtime contract tracing; `mode=regression` for regressions |
| "fix failing PR tests" | **fix-pr-tests** | CI test failures: real-bug vs stale vs flake |
| "resolve merge conflict" | **resolve-conflict** | Git merge/rebase conflict resolution |
| "hand off to codex" | **handoff-codex** | Second pass via OpenAI Codex CLI |

#### Review / Audit

| User Says | Skill | Notes |
|-----------|-------|-------|
| "audit the codebase", "tech debt sweep" | **audit** | Whole-codebase sweep orchestrating all audit skills |
| "check accessibility" | **audit-a11y** | WCAG, ARIA, keyboard, contrast |
| "check mobile/responsive" | **audit-responsive** | Breakpoints, fixed widths, overflow |
| "why is this slow" | **audit-perf** | N+1, missing indexes, blocking awaits, bundle size |
| "check auth/permissions" | **audit-authz** | Missing ownership checks, IDOR, role gaps |
| "check SEO meta tags" | **audit-seo-meta** | Title, OG tags, canonical, sitemap |
| "check analytics events" | **audit-analytics** | Event taxonomy, PII, missing events |
| "review this code", "clean up" | **simplify** | DRY, dead code, naming, coupling (internal handoff) |

#### Ship / Publish

| User Says | Skill | Notes |
|-----------|-------|-------|
| "commit this" | **commit** | Grouped commits with pre-flight quality gate |
| "commit and push" | **commit-and-push** | Commit then push with `-u` |
| "open a PR", "create pull request" | **open-pr** | Full readiness gauntlet before publishing |
| "cut a release", "bump version" | **release** | Semver bump, tag, release notes |
| "address PR comments" | **address-pr-comments** | Fix + reply + resolve each review thread |
| "update changelog" | **update-changelog** | Append entry to CHANGELOG.md |
| "update docs" | **sync-docs** | Update existing docs after code changes |
| "generate test plan" | **testing-plan** | QA test plan for human tester |

#### Code Quality (Internal — invoked by other skills)

| Skill | How It's Triggered |
|-------|-------------------|
| **simplify** | Post-step of add/modify/fix — reviews diff for code smells |
| **write-tests** | Phase 8 of add-feature; test step for modify/realign |
| **add-observability** | By add-feature/modify-feature when wiring integration boundaries |
| **realign** | By add/modify/fix when domain-model rename detected |
| **check-release-risk** | By commit-and-push/open-pr/release before publishing |
| **check-pr-readiness** | By commit/open-pr/release — typecheck + lint + test gauntlet |

### UI Design (Impeccable — 23 sub-commands)

| User Says | Command | Purpose |
|-----------|---------|---------|
| "design/build UI components" | **impeccable** | Entry point to the full design system |
| "audit this UI" | `impeccable audit` | Check components against design system |
| "build a [component]" | `impeccable build` | Generate a component from design tokens |
| "extract tokens" | `impeccable tokens` | Extract design tokens from existing UI |
| "create a theme" | `impeccable theme` | Build a complete theme |
| "generate variations" | `impeccable variations` | Generate component variations |

> Full command list: `impeccable help`. The `impeccable` skill has 2 subagents:
> `impeccable-manual-edit-applier` and `impeccable-asset-producer`.

### General Skills (28 skills)

| User Says | Skill | Purpose |
|-----------|-------|---------|
| "write a plan", "plan this out" | **writing-plans** | Structured implementation plans |
| "execute this plan" | **executing-plans** | Follow a plan step by step |
| "brainstorm ideas" | **brainstorming** | Structured ideation |
| "use TDD" | **test-driven-development** | Red-Green-Refactor cycle |
| "debug this systematically" | **systematic-debugging** | Structured debugging methodology |
| "review my code" | **requesting-code-review** | Request a code review |
| "address review feedback" | **receiving-code-review** | Respond to review comments |
| "dispatch parallel agents" | **dispatching-parallel-agents** | Fan out work to multiple sub-agents |
| "subagent-driven development" | **subagent-driven-development** | Delegate implementation to sub-agents |
| "use git worktrees" | **using-git-worktrees** | Parallel branch work |
| "finish this branch" | **finishing-a-development-branch** | Merge/cleanup workflow |
| "verify before completion" | **verification-before-completion** | Final checks before marking done |
| "build an MCP server" | **mcp-builder** | 4-phase MCP server creation |
| "write internal comms" | **internal-comms** | 3P updates, newsletters, FAQs |
| "write a PDF/docx/pptx" | **pdf** / **docx** / **pptx** | Document generation |
| "create a spreadsheet" | **xlsx** | Excel file generation |

### Codex Handoff (Grill Me Codex — 3 skills)

| User Says | Skill | Purpose |
|-----------|-------|---------|
| "grill me with docs" | **grill-with-docs-codex** | Codex review with project docs as context |
| "grill me codex" | **grill-me-codex** | Codex code review |
| "codex review" | **codex-review** | Second-opinion review via Codex |

---

## 3. Skill Collections

### Quick Reference

| Collection | Skills | Agents | Path |
|-----------|--------|--------|------|
| **Token Optimization** | 3 | 0 | `Skills/Token Optimization/` |
| **Agent Core Systems** | 37 | 16 | `Skills/Agent Core Systems/` |
| **Claude Code Subagents** | 0 | 153 | `Skills/Claude Code Subagents/` |
| **Impeccable (Front End)** | 1 (23 cmds) | 2 | `Skills/Impeccable (Front End Design)/` |
| **General Skills** | ~28 | 0 | `Skills/General Skills/` |
| **General Claude Code Rules** | 1 | 0 | `Skills/General Claude Code Rules/` |
| **Grill Me Codex** | 3 | 0 | `Skills/Grill Me Codex/` |
| **Total** | **~73** | **171** | |

### Collection Details

#### Token Optimization (`Skills/Token Optimization/`)
- **Plugin:** `token-guard` v1.0.0
- **MCP Server:** `token-guard-mcp-server` (5 tools — see above)
- **Skills:** `token-guard`, `session-handoff`, `claude-md-audit`
- **Purpose:** Reduce token usage, manage context windows, preserve cache, audit context bloat
- **When to use:** Before every task (protocol), when sessions feel expensive, when hitting limits

#### Agent Core Systems (`Skills/Agent Core Systems/`)
- **Plugin:** `agentsystem-core` v0.48.2 (by webdevcody)
- **Install:** `npx @agentsystemlabs/core init --harness claude`
- **Front door:** `/ship`
- **Skills:** 37 (5 internal/non-user-invocable)
- **Agents:** 16 read-only reviewer/tracer subagents
- **Depth modes:** `fast` | `balanced` | `production` (default varies by skill)
- **When to use:** All engineering tasks — features, bugs, PRs, releases, audits

#### Claude Code Subagents (`Skills/Claude Code Subagents/`)
- **Plugins:** 10 category plugins (VoltAgent)
- **Agents:** 153 domain experts across 10 categories
- **When to use:** Delegate specialized work to fresh context windows (see Section 4)

#### Impeccable (`Skills/Impeccable (Front End Design)/`)
- **Plugin:** `impeccable` v3.5.0 (by Paul Bakaus)
- **Skills:** 1 skill with 23 sub-commands
- **Agents:** `impeccable-manual-edit-applier`, `impeccable-asset-producer`
- **When to use:** Any UI design, component building, theme creation, design token work

#### General Skills (`Skills/General Skills/`)
- **Skills:** ~28 standalone skills (TDD, debugging, plans, code review, MCP builder, etc.)
- **When to use:** Methodology-driven tasks that don't fit the Agent Core pipeline

#### General Claude Code Rules (`Skills/General Claude Code Rules/`)
- **Skill:** `karpathy-guidelines` (by forrestchang)
- **Purpose:** 4 behavioral principles: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution
- **When to use:** Always — these are baseline behavioral guidelines for all work

#### Grill Me Codex (`Skills/Grill Me Codex/`)
- **Skills:** 3 Codex handoff skills
- **When to use:** Second-opinion reviews via OpenAI Codex CLI

---

## 4. Subagent Catalog (153 Agents)

Use subagents to delegate work to a **fresh context window** — the research/result comes back
without polluting your main session. Explicitly request cheaper models (Haiku) for simple tasks.

### When to Delegate vs. Do It Yourself

| Scenario | Action |
|----------|--------|
| Research, exploration, codebase understanding | Delegate to sub-agent |
| Code review, verification | Delegate to sub-agent |
| Summarization, documentation | Delegate to sub-agent (use Haiku) |
| Implementation that changes files | Do it in main session |
| Debugging requiring interactive iteration | Do it in main session |

### Agent Categories (10)

#### 01-Core Development (11 agents)
`backend-developer`, `frontend-developer`, `fullstack-developer`, `mobile-developer`, `api-designer`, `ui-designer`, `design-bridge`, `graphql-architect`, `microservices-architect`, `websocket-engineer`, `electron-pro`

**When to use:** Core coding tasks by role.

#### 02-Language Specialists (29 agents)
`typescript-pro`, `react-specialist`, `nextjs-developer`, `node-specialist`, `python-pro`, `golang-pro`, `rust-engineer`, `java-architect`, + 22 more

**When to use:** Language/framework-specific deep expertise.
**Med Spa App tip:** Use `nextjs-developer`, `typescript-pro`, `react-specialist` for the frontend; `node-specialist` for Edge Functions.

#### 03-Infrastructure (16 agents)
`devops-engineer`, `docker-expert`, `kubernetes-specialist`, `terraform-engineer`, `database-administrator`, `security-engineer`, `sre-engineer`, `cloud-architect`, + 8 more

**When to use:** Deployment, cloud, database administration, security hardening.

#### 04-Quality & Security (17 agents)
`code-reviewer`, `security-auditor`, `penetration-tester`, `debugger`, `qa-expert`, `test-automator`, `accessibility-tester`, `performance-engineer`, + 9 more

**When to use:** Code review, security audits, testing, debugging.
**Token tip:** Delegate `code-reviewer` to a sub-agent — review output comes back without polluting your session.

#### 05-Data & AI (13 agents)
`data-engineer`, `data-scientist`, `database-optimizer`, `postgres-pro`, `llm-architect`, `prompt-engineer`, `ai-engineer`, `ml-engineer`, + 5 more

**When to use:** Data pipelines, ML, AI architecture, database optimization.
**Med Spa App tip:** Use `postgres-pro` for Supabase query optimization.

#### 06-Developer Experience (15 agents)
`documentation-engineer`, `refactoring-specialist`, `dependency-manager`, `build-engineer`, `dx-optimizer`, `readme-generator`, `mcp-developer`, + 8 more

**When to use:** Docs, refactoring, dependency updates, build tooling, DX improvements.

#### 07-Specialized Domains (14 agents)
`payment-integration`, `fintech-engineer`, `hipaa-compliance`, `healthcare-admin`, `seo-specialist`, `blockchain-developer`, + 8 more

**When to use:** Domain-specific work.
**Med Spa App tip:** Use `payment-integration` for Stripe; `hipaa-compliance` for healthcare data compliance.

#### 08-Business & Product (16 agents)
`product-manager`, `project-manager`, `ux-researcher`, `business-analyst`, `growth-loops`, `content-marketer`, `scrum-master`, + 9 more

**When to use:** Product strategy, project management, UX research, business analysis.

#### 09-Meta-Orchestration (11 agents)
`multi-agent-coordinator`, `workflow-orchestrator`, `task-distributor`, `context-manager`, `knowledge-synthesizer`, + 6 more

**When to use:** Multi-agent coordination, workflow automation, complex task distribution.
**Token tip:** Use `context-manager` to optimize what goes into context windows.

#### 10-Research & Analysis (11 agents)
`research-analyst`, `market-researcher`, `competitive-analyst`, `trend-analyst`, `data-researcher`, `search-specialist`, + 5 more

**When to use:** Market research, competitive analysis, trend forecasting, idea validation.
**Token tip:** Always delegate research to sub-agents — don't pollute your main session with raw research data.

### Agent Core Reviewer Subagents (16 internal)

These are invoked automatically by Agent Core skills during gated reviews:

`reviewer-authz`, `reviewer-security-regression`, `reviewer-perf`, `reviewer-data-integrity`, `reviewer-contracts`, `reviewer-concurrency`, `reviewer-client-bundle`, `reviewer-loading-states`, `reviewer-error-boundaries`, `reviewer-observability-coverage`, `reviewer-accessibility-regression`, `crud-surface-mapper`, `runtime-contract-tracer`, `ui-pattern-inspector`, `utility-finder`, `pr-comment-resolver`

---

## 5. Decision Trees

### "I want to build something new"
```
Is it a full new feature?
  → /ship (or add-feature with mode=production)
Is it a small addition to something existing?
  → modify-feature (mode=balanced)
Is it just a UI component?
  → impeccable build
Does it need a database change?
  → add-migration first, then add-feature
```

### "Something is broken"
```
Did it used to work?
  → fix-bug (mode=regression)
Does it "should work but doesn't"?
  → fix-bug (mode=balanced)
Is it a failing CI test on a PR?
  → fix-pr-tests
Am I stuck after multiple attempts?
  → handoff-codex
```

### "I want to improve code quality"
```
Full codebase health check?
  → audit (orchestrates all audit skills)
Specific concern?
  → audit-a11y / audit-perf / audit-authz / audit-responsive / audit-seo-meta / audit-analytics
Just clean up recent changes?
  → simplify
Tighten TypeScript?
  → harden-types
```

### "My session is getting expensive"
```
Session over ~120K tokens?
  → session-handoff, then /clear
CLAUDE.md seems bloated?
  → claude-md-audit
Want to see where tokens go?
  → MCP: session_report
About to read a large file?
  → MCP: token_estimate first
Have a PDF/HTML to load?
  → MCP: convert_to_markdown first
```

### "I need to ship"
```
Just commit?
  → commit
Commit and push?
  → commit-and-push
Open a PR?
  → open-pr (runs full readiness gauntlet)
Cut a release?
  → release (runs readiness + risk check)
Update changelog?
  → update-changelog (before committing)
```

### "I need a second opinion"
```
From another AI (Codex)?
  → handoff-codex or grill-me-codex
From a code review subagent?
  → requesting-code-review (General Skills)
From a domain expert?
  → Delegate to the appropriate Claude Code Subagent (Section 4)
```

---

## 6. Phase & Build Docs Integration

The `Phase & Build Docs/` directory defines the Baseplate OS build plan. Skills map to phases:

### Phase 0 — Vertical Validation
**Docs:** Market research, vertical selection
**Skills:** Delegate to `market-researcher`, `competitive-analyst`, `project-idea-validator` subagents

### Phase 1 — The Wedge & First Build
**Docs:** Scaffold spec, build guide, quick start
**Skills:** `add-feature` (core features), `add-migration` (schema), `write-tests` (test setup), `add-e2e-test` (user flows)

### Phase 2 — Open-Source & Middleware
**Docs:** Middleware integration, API design
**Skills:** `modify-feature` (integrations), `add-observability` (instrument boundaries), `audit-authz` (permission checks)

### Phase 3 — Intelligence & Expansion
**Docs:** AI/ML integration, scale features
**Skills:** Delegate to `ai-engineer`, `llm-architect`, `data-engineer` subagents; `add-feature` for new capabilities

### Phase 4 — The Ecosystem
**Docs:** Marketplace, multi-tenant, ecosystem
**Skills:** `audit` (full codebase health), `release` (versioned releases), `audit-perf` (scale check), `sync-docs` (API docs)

### Cross-Phase Token Optimization
**Every phase:** Run `token-guard` protocol before starting work. Use `session-handoff` between phase transitions. Audit context files with `claude-md-audit` when project grows.

---

## Med Spa App — Recommended Stack Skills

The Med Spa App uses Next.js + TypeScript + Supabase + Stripe + Postmark + Twilio.

| Task | Primary Skill | Supporting Agents |
|------|--------------|-------------------|
| Build a new page/feature | `add-feature` | `nextjs-developer`, `react-specialist` |
| Design UI components | `impeccable` | `ui-designer` |
| Database schema change | `add-migration` | `postgres-pro` |
| Stripe integration | `modify-feature` | `payment-integration` |
| Supabase auth/RLS | `audit-authz` | `security-auditor` |
| Edge Functions | `add-feature` | `node-specialist` |
| Email/SMS integration | `modify-feature` | `backend-developer` |
| Accessibility check | `audit-a11y` | `accessibility-tester` |
| Performance check | `audit-perf` | `performance-engineer` |
| E2E user flow test | `add-e2e-test` | `qa-expert`, `test-automator` |
| Healthcare compliance | — | `hipaa-compliance` |
| Deploy/release | `release` | `devops-engineer` |

---

*This document is the authoritative skill routing reference. When a skill or agent is added to
the project, update this guide. Keep the root CLAUDE.md under 200 lines — offload detail here.*
