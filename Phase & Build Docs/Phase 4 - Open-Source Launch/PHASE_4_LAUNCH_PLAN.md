# Phase 4 Launch Plan — Fix Gaps + GitHub Launch

> **Status:** Code complete. This plan fixes 4 minor gaps, hardens for public launch, then ships to GitHub.
> **Last updated:** June 2026
> **Prerequisite:** Phase 4 code complete (commits `308e6a7`, `14e8832`)
> **Estimated effort:** ~6-8 hours total (code fixes ~2h, hardening ~2h, launch ~2h, marketing ~2h)

---

## Decisions Locked

| Decision | Choice |
|----------|--------|
| Public repo URL | `<PUBLIC_REPO_URL>` — placeholder, update before push |
| npm publishing | **Skipped** — GitHub-only launch for now |
| Scope | Fix 4 code gaps + harden + push to GitHub + marketing rollout |

---

## Phase 4 Deliverables Verification (Pre-Audit Results)

All 30 deliverables from the Phase 4 Execution Plan were verified in the codebase:

| Sub-phase | Total Items | Present | Partial | Missing |
|-----------|-------------|---------|---------|---------|
| 4A — Repo Prep | 8 | 7 | 1 (CI coverage gap) | 0 |
| 4B — Marketplace UI + Docs | 5 | 5 | 0 | 0 |
| 4C — MCP + SDK | 5 | 3 | 1 (SDK file structure) | 1 (tools not modularized) |
| 4D — ML Pipeline | 7 | 7 | 0 | 0 |
| 4E — Marketing | 5 | 5 | 0 | 0 |

**Secrets audit:** Clean. No real secrets in tracked files. All `.env` files use placeholders.

---

## Step 1: Code Fixes (4 Gaps)

### Step 1a: CI Workflow Enhancement

**File:** `Med Spa App/.github/workflows/ci.yml`

**Problem:** CI builds 4 Next.js apps but doesn't validate the Python ML pipeline or cache turbo builds. The CHANGELOG claims "builds all apps, all packages" but it overstates coverage.

**Changes:**

| # | Change | Why |
|---|--------|-----|
| 1 | Add `actions/setup-python@v5` with `python-version: '3.11'` | ML pipeline is Python — CI should validate it |
| 2 | Add `pip install -r ml-models/requirements.txt` | Ensure deps resolve |
| 3 | Add `python -m py_compile ml-models/src/*.py` | Catch Python syntax errors |
| 4 | Add `actions/cache@v4` for turbo (`.turbo/cache`) | Faster CI runs |
| 5 | Add `working-directory` for all build steps pointing to `Med Spa App` root | Clarity |

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **modify-feature** (`mode=balanced`) | Agent Core Systems | Extend existing CI workflow with Python validation + caching |
| **check-pr-readiness** | Agent Core Systems | Verify CI pipeline passes after changes |
| **verification-before-completion** | General Skills | Confirm the pipeline works end-to-end |
| **simplify** | Agent Core Systems | Clean up any redundant steps after enhancement |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `devops-engineer` | 03-Infrastructure | CI/CD pipeline design, caching strategy |
| `build-engineer` | 06-Developer Experience | Build optimization, turbo cache config |
| `python-pro` | 02-Language Specialists | Python setup in CI |

---

### Step 1b: MCP Server Tool Modularization

**File:** `Med Spa App/apps/mcp-server/src/tools/index.ts` (226 lines, all 11 tools inline)

**Problem:** All 11 MCP tools are crammed into a single monolithic `index.ts`. The Phase 4 spec calls for separate files (`scaffold.ts`, `deploy.ts`, etc.).

**Target Structure:**

```
apps/mcp-server/src/tools/
  shared.ts            ← callConnectApi helper (shared by all API-backed tools)
  communications.ts    ← sendSmsReminder
  billing.ts           ← deductPackage
  reporting.ts         ← getTreatmentMetrics
  intelligence.ts      ← getRiskScore, getChurnPrediction
  marketplace.ts       ← browseMarketplace, installModule, uninstallModule, listInstalledModules
  scaffold.ts          ← scaffoldVertical
  deploy.ts            ← deployApp
  index.ts             ← import aggregator: imports all + exports allTools[]
```

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **reorganize-files** | Agent Core Systems | Regroup files + update all import references |
| **modify-feature** (`mode=balanced`) | Agent Core Systems | Restructure while preserving behavior |
| **harden-types** | Agent Core Systems | Ensure type safety across split files |
| **simplify** | Agent Core Systems | Post-refactor code smell check |
| **write-tests** | Agent Core Systems | Verify tests still pass after restructure |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `mcp-developer` | 06-Developer Experience | MCP tool structure + best practices |
| `typescript-pro` | 02-Language Specialists | Type-safe file splitting |
| `refactoring-specialist` | 06-Developer Experience | Clean modularization |

---

### Step 1c: SDK Package Structure Fix

**Files:** `Med Spa App/packages/sdk/src/index.ts` (109 lines, ConnectClient class inline)

**Problem:** `ConnectClient` class lives in `src/index.ts`. Phase 4 spec calls for `connect-client.ts` + `types.ts` + barrel `index.ts`.

**Target Structure:**

```
packages/sdk/src/
  connect-client.ts    ← ConnectClient class (moved from index.ts)
  types.ts             ← Request/response type definitions (extracted)
  index.ts             ← Barrel: export { ConnectClient } from './connect-client'
```

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **reorganize-files** | Agent Core Systems | Regroup SDK files + update imports |
| **harden-types** | Agent Core Systems | Extract clean request/response types |
| **simplify** | Agent Core Systems | Post-refactor cleanup |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `api-designer` | 01-Core Development | SDK type design |
| `typescript-pro` | 02-Language Specialists | Type extraction + barrel exports |
| `documentation-engineer` | 06-Developer Experience | Verify SDK README stays accurate |

---

### Step 1d: .gitignore Python Additions

**File:** `Med Spa App/.gitignore`

**Problem:** Missing Python-specific patterns for the `ml-models/` directory.

**Additions:**

```gitignore
# Python
__pycache__/
*.pyc
*.pyo
ml-models/models/*.pkl
ml-models/data/
.venv/
.ipynb_checkpoints/
```

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **sync-docs** | Agent Core Systems | Update .gitignore to match current codebase |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `python-pro` | 02-Language Specialists | Knows what Python artifacts to ignore |

---

## Step 2: Pre-Launch Hardening

### Step 2a: Package Metadata Enrichment

**Files:** `Med Spa App/packages/sdk/package.json`, `Med Spa App/apps/mcp-server/package.json`, `Med Spa App/package.json`

**Problem:** Packages lack `description`, `keywords`, `license`, `author` fields needed for GitHub credibility (even without npm publishing).

**Changes to `@baseplate/sdk` package.json:**

| Field | Value |
|-------|-------|
| `description` | `"Typed Connect API client for Baseplate OS"` |
| `license` | `"MIT"` |
| `keywords` | `["baseplate", "saas", "connect-api", "sdk", "b2b", "vertical-saas"]` |
| `author` | `"Baseplate OS Contributors"` |
| `repository` | `{"type": "git", "url": "<PUBLIC_REPO_URL>", "directory": "packages/sdk"}` |

**Changes to `mcp-server` package.json:**

| Field | Value |
|-------|-------|
| `description` | `"MCP server for Baseplate OS — AI agent integration (11 tools)"` |
| `license` | `"MIT"` |
| `keywords` | `["baseplate", "mcp", "ai", "claude", "cursor", "saas"]` |
| `author` | `"Baseplate OS Contributors"` |

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **sync-docs** | Agent Core Systems | Update package.json metadata to match project state |
| **harden-types** | Agent Core Systems | Ensure package.json fields are complete and valid |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `documentation-engineer` | 06-Developer Experience | Package metadata best practices |
| `dependency-manager` | 06-Developer Experience | Validate package.json structure |

---

### Step 2b: Repository URL Alignment

**Problem:** Root `package.json` says `github.com/baseplate-os/baseplate.git` but actual remote is `NimbusCoreAi/revenueboostauditsystem.git`.

**Changes:**
1. Root `package.json` → `repository.url` → `<PUBLIC_REPO_URL>`
2. `packages/sdk/package.json` → `repository.url` → `<PUBLIC_REPO_URL>`
3. Root `README.md` → clone URL → `<PUBLIC_REPO_URL>`

> **Note:** Replace `<PUBLIC_REPO_URL>` with actual URL before pushing to GitHub.

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **sync-docs** | Agent Core Systems | Update all repo URL references |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `readme-generator` | 06-Developer Experience | Verify README clone instructions |

---

### Step 2c: Quality Gate

Run the full verification suite before any commit:

```bash
cd "Med Spa App"
pnpm typecheck    # All 17 packages must pass
pnpm test         # All 250+ tests must pass
pnpm build        # All apps must build (turbo)
```

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **check-pr-readiness** | Agent Core Systems | Pre-publish gauntlet (typecheck + lint + test) |
| **verification-before-completion** | General Skills | Final checks before marking done |
| **simplify** | Agent Core Systems | Clean up any issues found |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `code-reviewer` | 04-Quality & Security | Review all changes before launch |
| `security-auditor` | 04-Quality & Security | Final secrets scan |
| `build-engineer` | 06-Developer Experience | Verify all builds pass |

---

## Step 3: Commit Changes

### Step 3a: Commit the code fixes

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **commit** (`mode=production`) | Agent Core Systems | Grouped commits with pre-flight quality gate |
| **update-changelog** | Agent Core Systems | Add CHANGELOG.md entry for Phase 4 gap fixes |
| **check-release-risk** | Agent Core Systems | Briefing on what could break |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `code-reviewer` | 04-Quality & Security | Final review of the diff |

**Commit message draft:**
```
fix(Phase 4): modularize MCP tools, restructure SDK, enhance CI, update .gitignore

- Split mcp-server/tools/index.ts into 8 domain files (communications, billing,
  reporting, intelligence, marketplace, scaffold, deploy, shared)
- Move ConnectClient to packages/sdk/src/connect-client.ts + extract types.ts
- Add Python validation + turbo cache to CI workflow
- Add Python patterns to .gitignore (__pycache__, *.pyc, *.pkl, .venv)
- Enrich package.json metadata (description, keywords, license, author)
```

---

## Step 4: GitHub Launch

### Step 4a: Create Public Repository

| # | Task | Notes |
|---|------|-------|
| 1 | Create public GitHub repo | User decides org/name |
| 2 | `git remote set-url origin <PUBLIC_REPO_URL>` | Point git at new repo |
| 3 | Update all `package.json` repository fields | Replace `<PUBLIC_REPO_URL>` |
| 4 | Update README clone URL | Replace placeholder |
| 5 | `git push origin main` | Push all history |
| 6 | Configure repo settings | Topics: `saas`, `monorepo`, `mcp`, `vertical-saas`, `nextjs`, `supabase` |
| 7 | Create `v0.1.0` annotated tag | `git tag -a v0.1.0 -m "Initial public release"` |
| 8 | Push tag | `git push origin v0.1.0` |
| 9 | Create GitHub Release | Use release notes from CHANGELOG |

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **release** (`mode=production`) | Agent Core Systems | Semver bump, tag, release notes from commit range |
| **sync-docs** | Agent Core Systems | Update all URL references before push |
| **commit-and-push** | Agent Core Systems | Push to new remote with `-u` |
| **check-release-risk** | Agent Core Systems | Risk briefing before making repo public |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `devops-engineer` | 03-Infrastructure | GitHub repo configuration, branch protection |
| `security-auditor` | 04-Quality & Security | Final secrets scan before going public |

---

## Step 5: Marketing Rollout

### Schedule (Launch Week)

| Day | Channel | File | Focus |
|-----|---------|------|-------|
| **Day 0** | GitHub repo public | — | — |
| **Day 0** | Hacker News ("Show HN") | `docs/marketing/hn-post.md` | Technical, humble, evidence-backed |
| **Day 0** | Twitter/X thread | `docs/marketing/twitter-thread.md` | 7-tweet thread with hooks |
| **Day 1** | Reddit r/webdev | `docs/marketing/reddit-posts.md` | Developer experience, module library |
| **Day 2** | Reddit r/SaaS | `docs/marketing/reddit-posts.md` | Vertical SaaS, B2B, marketplace |
| **Day 3** | Reddit r/Entrepreneur | `docs/marketing/reddit-posts.md` | Build-first, no-revenue-until-ready model |
| **Day 1-7** | Dev outreach emails | `docs/marketing/dev-outreach-emails.md` | Module authors, 80% revenue pitch |
| **Week 1** | Demo content | `docs/marketing/demo-plan.md` (if exists) | Screenshots, GIFs, video walkthrough |

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **internal-comms** | General Skills | All marketing copy (HN, Reddit, Twitter, landing page, emails) |
| **sync-docs** | Agent Core Systems | Update any marketing docs that reference repo URL |

**Subagent Mapping:**

| Subagent | Category | Purpose |
|----------|----------|---------|
| `content-marketer` | 08-Business & Product | All marketing copy execution |
| `growth-loops` | 08-Business & Product | Growth strategy, viral mechanics |
| `sales-engineer` | 08-Business & Product | Developer outreach email personalization |

---

## Step 6: Update MASTER_PROGRESS.md

After completing all code fixes and the commit:

| # | Change |
|---|--------|
| 1 | Phase 4 "At a Glance" table: change "Remaining: GitHub launch" → mark launch steps |
| 2 | Add commit hash to Build Log |
| 3 | Update Phase 4 → 5 gate criteria status |

**Skill Mapping:**

| Skill | Collection | Purpose |
|-------|-----------|---------|
| **sync-docs** | Agent Core Systems | Update MASTER_PROGRESS.md to reflect current state |
| **update-changelog** | Agent Core Systems | Add CHANGELOG entry |

---

## Complete Skill Reference for Phase 4 Launch

### Agent Core Skills Used

| Skill | Step(s) | Mode | Purpose |
|-------|---------|------|---------|
| `modify-feature` | 1a, 1b | balanced | Extend CI workflow, restructure MCP tools |
| `reorganize-files` | 1b, 1c | — | Regroup MCP tools + SDK files, update imports |
| `harden-types` | 1b, 1c, 2a | — | Type safety across file splits, SDK types |
| `sync-docs` | 1d, 2a, 2b, 4a, 6 | — | .gitignore, package.json, URLs, MASTER_PROGRESS |
| `simplify` | 1a, 1b, 1c, 2c | — | Post-change cleanup on all refactored files |
| `check-pr-readiness` | 2c | — | Full typecheck + lint + test gauntlet |
| `commit` | 3a | production | Grouped commits with quality gate |
| `update-changelog` | 3a, 6 | — | CHANGELOG entry for gap fixes |
| `check-release-risk` | 3a, 4a | — | Risk briefing before commit + public push |
| `release` | 4a | production | v0.1.0 tag + release notes |
| `commit-and-push` | 4a | production | Push to public remote |

### General Skills Used

| Skill | Step(s) | Purpose |
|-------|---------|---------|
| `verification-before-completion` | 1a, 2c | Verify CI works + quality gate passes |
| `internal-comms` | 5 | All marketing copy (HN, Reddit, Twitter, emails) |

### Subagents Used (by category)

| Subagent | Category | Step(s) | Purpose |
|----------|----------|---------|---------|
| `devops-engineer` | 03-Infrastructure | 1a, 4a | CI design, GitHub repo setup |
| `build-engineer` | 06-Developer Experience | 1a, 2c | Build optimization, turbo cache |
| `python-pro` | 02-Language Specialists | 1a, 1d | Python CI setup, .gitignore patterns |
| `mcp-developer` | 06-Developer Experience | 1b | MCP tool modularization |
| `typescript-pro` | 02-Language Specialists | 1b, 1c | Type-safe file splitting |
| `refactoring-specialist` | 06-Developer Experience | 1b | Clean modularization |
| `api-designer` | 01-Core Development | 1c | SDK type design |
| `documentation-engineer` | 06-Developer Experience | 1c, 2a, 2b | Package metadata, SDK docs |
| `dependency-manager` | 06-Developer Experience | 2a | Validate package.json structure |
| `readme-generator` | 06-Developer Experience | 2b | Verify README clone instructions |
| `code-reviewer` | 04-Quality & Security | 2c, 3a | Pre-launch review |
| `security-auditor` | 04-Quality & Security | 2c, 4a | Final secrets scan |
| `content-marketer` | 08-Business & Product | 5 | Marketing copy execution |
| `growth-loops` | 08-Business & Product | 5 | Growth strategy |
| `sales-engineer` | 08-Business & Product | 5 | Developer outreach |

### Token Optimization (Run Throughout)

| Skill/Tool | When | Purpose |
|-----------|------|---------|
| `token-guard` | Before each step | Enforce token-saving habits |
| `session-handoff` | Between Steps 2 and 3 (if context >120K) | Context handoff before commit |
| MCP: `audit_context_files` | At session start | Check startup overhead |
| MCP: `token_estimate` | Before reading large files | Cost awareness |

---

## What's Explicitly NOT in This Plan

| Item | Deferred To | Why |
|------|------------|-----|
| npm publishing | Post-launch | User chose GitHub-only for now |
| Actual ML model training | Phase 5+ | No real customer data exists |
| Marketplace go-live (live customers) | Phase 5+ | No customers exist yet |
| Developer recruitment (sending emails) | Post-launch | Send when repo is public |
| Third vertical scaffold | Phase 5+ | Demand-driven |

---

## Estimated Timeline

| Step | Est. Hours | Cumulative |
|------|------------|------------|
| Step 1: Code Fixes (1a–1d) | 2 | 2 |
| Step 2: Pre-Launch Hardening | 2 | 4 |
| Step 3: Commit | 0.5 | 4.5 |
| Step 4: GitHub Launch | 1.5 | 6 |
| Step 5: Marketing | 2-4 (spread over week) | 8-10 |
| Step 6: Update Progress | 0.5 | 8.5-10.5 |

> **Note:** After completing each step, update `MASTER_PROGRESS.md` (see Step 6).
