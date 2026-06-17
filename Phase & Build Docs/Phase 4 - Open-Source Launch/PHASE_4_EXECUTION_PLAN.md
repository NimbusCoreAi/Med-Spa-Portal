# Phase 4 Execution Plan — Open-Source Launch

> **Status:** Builds on Phase 3 completion (intelligence, marketplace, MCP server, ML scaffolding all built)
> **Last updated:** June 2026
> **Prerequisite:** Phase 3 code complete (commits `b13f270` through `66f9f5e`)
> **Estimated effort:** ~32-42 hours of AI-assisted build work (5 sub-phases)

> **🔧 MAINTENANCE:** After completing any sub-phase, update `MASTER_PROGRESS.md`: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

---

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Third vertical | Skip — defer to Phase 5+ | 2 verticals already prove core reusability; third should be demand-driven per Phase 4 overview doc |
| ML pipeline | Python scaffolding (no training) | Infrastructure ready for Phase 5; no real customer data exists during build phases |
| Marketplace model | Self-hosted (Option A from Process.md) | Simpler, controlled; upgrade to cloud (Stripe Connect) in Phase 5+ |
| MCP registry | Publish-ready (not live during build) | Prep everything; go-live happens with GitHub launch |
| MCP tools | Extend Phase 3 server (not rebuild) | Phase 3D already built 5 tools + JSON-RPC transport; add scaffold/deploy on top |

---

## What Already Exists (From Phase 3 — Do NOT Rebuild)

| Component | Status | Location |
|-----------|--------|----------|
| Marketplace API backend | ✅ Built | `@baseplate/marketplace`, migration 0013, Connect API endpoints |
| MCP server core (5 tools) | ✅ Built | `apps/mcp-server/` (send_sms, deduct_package, get_metrics, get_risk_score, browse_marketplace) |
| ML scaffolding (TS interfaces) | ✅ Built | `@baseplate/intelligence/predictions/` (predictor stubs, feature extractors, training interfaces) |
| CI pipeline (basic) | ✅ Built | `.github/workflows/ci.yml` (typecheck + test + portal build) |

---

## Sub-phase Overview

| Sub-phase | Name | Est. Hours | Dependencies |
|-----------|------|------------|--------------|
| **4A** | Open-Source Repo Prep | 6-8 | None |
| **4B** | Marketplace UI + Dev Docs | 8-10 | 3C marketplace API (done) |
| **4C** | MCP Enhancement + SDK | 6-8 | 3D MCP server (done) |
| **4D** | ML Training Pipeline | 8-10 | 3E ML scaffolding (done) |
| **4E** | Marketing & Launch Materials | 4-6 | 4A (repo must be presentable) |

**Recommended order:** 4A → 4B → 4C → 4D → 4E

---

## Phase 4 → Phase 5 Gate Criteria

| Criteria | Satisfied By |
|----------|-------------|
| Repo published and GitHub-ready | 4A |
| Marketplace UI + developer docs complete | 4B |
| MCP server enhanced (scaffold/deploy) + SDK | 4C |
| ML infrastructure finalized (Python pipeline) | 4D |
| Marketing materials prepared for launch | 4E |
| Documentation complete (all repos, guides, specs) | 4A + 4B + 4C + 4D |

---

## Architecture After Phase 4

```
Med Spa App/
  apps/
    portal-medspa/            # Phase 1-4 (marketplace UI added in 4B)
    portal-homeservices/      # Phase 3
    connect-api/              # Phase 2-4 (churn-prediction endpoint added in 4D)
    mcp-server/               # Phase 3-4 (scaffold/deploy tools added in 4C)
    test-home-services/       # Phase 2
  packages/
    core/                     # Phase 1-3
    intelligence/             # Phase 3 (ML TS interfaces)
    marketplace/              # Phase 3
    sdk/                      # Phase 4C (NEW — typed Connect API client)
    ui/                       # Phase 1
    patterns/                 # Phase 1
    hooks/                    # Phase 1
    next-api/                 # Phase 1
    dates/                    # Phase 1
    integrations/             # Phase 1
  ml-models/                  # Phase 4D (NEW — Python ML pipeline)
    src/
    notebooks/
    models/
    requirements.txt
  docs/
    MARKETPLACE_SPEC.md       # Phase 4B (NEW)
    MARKETPLACE_GUIDE.md      # Phase 4B (NEW)
  examples/
    example-module/           # Phase 4B (NEW — reference marketplace module)
  .github/
    workflows/ci.yml          # Phase 4A (enhanced)
    ISSUE_TEMPLATE/           # Phase 4A (NEW)
    pull_request_template.md  # Phase 4A (NEW)
  LICENSE                     # Phase 4A (NEW)
  CONTRIBUTING.md             # Phase 4A (NEW)
  CHANGELOG.md                # Phase 4A (NEW)
  ARCHITECTURE.md             # Phase 4A (NEW)
```

---

## Sub-phase 4A: Open-Source Repo Preparation

**Goal:** Make the repo presentable, compliant, and ready for public GitHub launch.

### Step 1: Project Meta-Files

| Task | Deliverable |
|------|------------|
| `LICENSE` (MIT) | License file |
| `CONTRIBUTING.md` | Contribution guide: setup instructions, coding standards, PR process, code of conduct link |
| `CHANGELOG.md` | Seeded with Phase 1-3 entries (Keep a Changelog format) |
| `ARCHITECTURE.md` | Full architecture doc: monorepo structure, package graph, data flow, multi-vertical design, Connect API, intelligence layer |

> **Skill:** `/update-changelog` (Agent Core) — for seeding CHANGELOG.md properly
> **Skill:** `/sync-docs` (Agent Core) — create/update all documentation files
> **Subagents:** `documentation-engineer` (06-developer-experience) — architecture doc + contributing guide, `readme-generator` (06-developer-experience) — meta-file polish

### Step 2: GitHub Templates

| Task | Deliverable |
|------|------------|
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug report template (labels, reproduction steps, environment) |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Feature request template (use case, proposed solution, vertical) |
| `.github/ISSUE_TEMPLATE/module_request.md` | Marketplace module request template (vertical, pain point, willing to pay) |
| `.github/pull_request_template.md` | PR template (summary, type of change, test plan, breaking changes) |
| `.github/CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 |

> **Skill:** `/sync-docs` (Agent Core) — create all template files
> **Subagents:** `documentation-engineer` (06-developer-experience)

### Step 3: README Polish for GitHub Landing

| Task | Deliverable |
|------|------------|
| Rewrite root README with badges (build status, license, npm, stars) | Presentable README |
| Add "What is Baseplate?" elevator pitch section | Clear value prop |
| Add architecture diagram (ASCII or mermaid) | Visual overview |
| Add quick start that works in <5 commands | Frictionless onboarding |
| Add "Modules" table with links to each package README | Navigation |
| Add screenshot/GIF placeholders | Visual proof (actual assets in 4E) |

> **Skill:** `/sync-docs` (Agent Core) — update README
> **Skill:** `/impeccable` → `shape` (Impeccable) — shape the README narrative + information hierarchy
> **Subagents:** `readme-generator` (06-developer-experience) — README generation, `ui-designer` (01-core-development) — visual layout

### Step 4: CI/CD Enhancement

| Task | Deliverable |
|------|------------|
| Update `.github/workflows/ci.yml` to build ALL apps (portal-medspa, portal-homeservices, connect-api, test-home-services) | Full CI pipeline |
| Add `pnpm typecheck` for all 16 packages (not just portal) | Comprehensive type check |
| Add `pnpm test` for all packages | Full test suite in CI |
| Add lint step (if not present) | Lint gate |
| Add caching for pnpm store + turbo cache | Faster CI runs |

> **Skill:** `/add-feature` (Agent Core, mode=balanced) — CI/CD enhancement
> **Skill:** `verification-before-completion` (General Skills) — verify CI pipeline works
> **Subagents:** `devops-engineer` (03-infrastructure) — CI/CD pipeline design, `build-engineer` (06-developer-experience) — build optimization

### Step 5: Security & Cleanup Audit

| Task | Deliverable |
|------|------------|
| Scan for hardcoded secrets, API keys, tokens | Security scan results |
| Audit `.gitignore` for completeness | Ensure no secrets/build artifacts tracked |
| Remove any dead code, unused imports | Clean codebase |
| Verify no `console.log` or debug statements in production code | Clean codebase |
| Ensure all packages have proper `package.json` metadata (author, license, repository) | NPM-ready metadata |

> **Skill:** `/audit` (Agent Core) — whole-codebase tech-debt sweep
> **Skill:** `/check-pr-readiness` (Agent Core) — pre-publish gauntlet
> **Subagents:** `security-auditor` (04-quality-security) — security scan, `code-reviewer` (04-quality-security) — code review

### 4A Gate Checklist
- [ ] LICENSE (MIT) created
- [ ] CONTRIBUTING.md with setup + standards + PR process
- [ ] CHANGELOG.md seeded with Phase 1-3 entries
- [ ] ARCHITECTURE.md with full architecture
- [ ] GitHub issue templates (bug, feature, module request)
- [ ] GitHub PR template
- [ ] Code of Conduct
- [ ] Root README polished for GitHub (badges, diagram, quick start)
- [ ] CI/CD builds all apps + all packages
- [ ] Security audit passed (no secrets, no dead code)
- [ ] All package.json metadata complete
- [ ] `pnpm typecheck` passes (16/16)
- [ ] `pnpm test` passes (250+ tests)
- [ ] `pnpm build` passes (all apps)

---

## Sub-phase 4B: Marketplace UI + Developer Docs

**Goal:** Build the portal-facing marketplace browse/install UI and developer documentation for module authors.

### Step 1: Marketplace Browse Page

| Task | Deliverable |
|------|------------|
| `apps/portal-medspa/src/app/dashboard/marketplace/page.tsx` | Browse/search marketplace page |
| Module card component (name, description, author, price, category badge, install button) | Card component |
| Search bar (filter by name, category, vertical) | Search UI |
| Grid layout for module cards | Responsive grid |
| Sort options (popular, newest, price) | Sort dropdown |

> **Skill:** `/add-feature` (Agent Core, mode=production) — full marketplace UI page
> **Skill:** `/polish-ui` (Agent Core) — UX checklist on the marketplace page
> **Skill:** `/add-empty-error-states` (Agent Core) — empty state ("No modules available yet"), loading state, error state
> **Skill:** `/audit-responsive` (Agent Core) — verify marketplace grid works at mobile/tablet/desktop
> **Subagents:** `react-specialist` (02-language-specialists) — component design, `ui-designer` (01-core-development) — visual design, `nextjs-developer` (02-language-specialists) — Next.js routing

### Step 2: Module Install/Uninstall Flow

| Task | Deliverable |
|------|------------|
| Install button → calls Connect API via portal proxy route | Install flow |
| `apps/portal-medspa/src/app/api/marketplace/route.ts` | Proxy route to Connect API marketplace endpoints |
| Confirmation modal before install ("This will add $X/month to your bill") | Confirm dialog |
| Success toast notification | Feedback |
| Uninstall button on installed modules | Uninstall flow |
| Installed modules management section on same page or sub-page | Management UI |

> **Skill:** `/add-feature` (Agent Core, mode=production) — install/uninstall flow
> **Skill:** `/polish-ui` (Agent Core) — modal, toast, button states
> **Skill:** `/audit-authz` (Agent Core) — verify marketplace proxy route checks clinic ownership
> **Subagents:** `react-specialist` (02-language-specialists), `api-designer` (01-core-development)

### Step 3: Module Loader Infrastructure

| Task | Deliverable |
|------|------------|
| `apps/portal-medspa/src/lib/module-loader.ts` | Module loading infrastructure |
| `getInstalledModules(clinicId)` — fetch active subscriptions | Loader function |
| `enableModule(clinicId, moduleId)` — subscribe to module | Install function |
| `disableModule(clinicId, moduleId)` — unsubscribe | Uninstall function |
| Dynamic navigation integration — installed modules appear in sidebar | Nav integration |

> **Skill:** `/modify-feature` (Agent Core, mode=balanced) — extend existing portal navigation
> **Skill:** `/harden-types` (Agent Core) — ensure type safety at module loader boundaries
> **Subagents:** `backend-developer` (01-core-development), `typescript-pro` (02-language-specialists)

### Step 4: Marketplace Module Spec

| Task | Deliverable |
|------|------------|
| `docs/MARKETPLACE_SPEC.md` | Complete module specification |
| Module structure (package.json, manifest.json, src/pages, src/api) | Spec section |
| manifest.json schema (name, version, author, vertical, category, pricing, dependencies, entryPoint, permissions) | Spec section |
| Module API access (what Baseplate APIs modules can call) | Spec section |
| Submission process (review criteria, timeline) | Spec section |
| Pricing guidelines ($29-49 small, $99-199 major, $299+ enterprise) | Spec section |
| Security requirements (no direct DB write, sandboxed, RLS-scoped) | Spec section |

> **Skill:** `/sync-docs` (Agent Core) — create comprehensive spec doc
> **Skill:** `/harden-types` (Agent Core) — define manifest.json JSON schema with zod
> **Subagents:** `api-designer` (01-core-development) — manifest schema, `documentation-engineer` (06-developer-experience) — spec doc, `security-auditor` (04-quality-security) — security requirements

### Step 5: Marketplace Developer Guide

| Task | Deliverable |
|------|------------|
| `docs/MARKETPLACE_GUIDE.md` | Step-by-step developer guide |
| Prerequisites (Node.js, Baseplate SDK, Supabase project) | Setup section |
| Creating a module from scratch (init, manifest, code, test) | Tutorial section |
| Publishing to marketplace (submission, review, listing) | Publishing section |
| Revenue model explanation (80/20 split, payout schedule) | Revenue section |
| Example walkthrough using the reference module | Walkthrough section |

> **Skill:** `/sync-docs` (Agent Core) — create developer guide
> **Subagents:** `documentation-engineer` (06-developer-experience), `technical-writer` (08-business-product)

### Step 6: Reference Example Module

| Task | Deliverable |
|------|------------|
| `examples/example-module/` directory | Reference implementation |
| `examples/example-module/manifest.json` | Valid manifest |
| `examples/example-module/package.json` | Package config |
| `examples/example-module/src/pages/index.tsx` | Sample UI page |
| `examples/example-module/src/api/index.ts` | Sample API endpoint |
| `examples/example-module/README.md` | Module README |
| Verify it passes manifest validation | Validation |

> **Skill:** `/add-feature` (Agent Core, mode=fast) — example module scaffold
> **Subagents:** `frontend-developer` (01-core-development), `documentation-engineer` (06-developer-experience)

### 4B Gate Checklist
- [ ] Marketplace browse page with search, filter, sort
- [ ] Module card component with install/uninstall
- [ ] Portal proxy API route to Connect marketplace endpoints
- [ ] Confirmation modal + success toast
- [ ] Module loader infrastructure (getInstalledModules, enable, disable)
- [ ] Installed modules appear in portal sidebar
- [ ] `docs/MARKETPLACE_SPEC.md` complete (manifest, API, submission, pricing, security)
- [ ] `docs/MARKETPLACE_GUIDE.md` complete (setup, create, publish, revenue)
- [ ] `examples/example-module/` with valid manifest + working code
- [ ] Empty/loading/error states on marketplace page
- [ ] Responsive layout verified (mobile/tablet/desktop)
- [ ] All tests pass, typecheck passes, build succeeds

---

## Sub-phase 4C: MCP Server Enhancement + SDK

**Goal:** Add scaffold/deploy tools to the MCP server, create a TypeScript SDK, and prepare for registry publishing.

### Step 1: Add Scaffold Tool to MCP Server

| Task | Deliverable |
|------|------------|
| `apps/mcp-server/src/tools/scaffold.ts` — `scaffold_vertical` tool | New MCP tool |
| Input: `{ vertical: string, app_name: string }` | Input schema |
| Output: scaffold instructions (clone template, customize, setup commands) | Output |
| Register in `tools/index.ts` | Tool registration |

> **Skill:** `mcp-builder` (General Skills) — 4-phase MCP tool creation
> **Skill:** `/modify-feature` (Agent Core, mode=balanced) — extend existing MCP server
> **Subagents:** `mcp-developer` (06-developer-experience) — MCP tool design, `backend-developer` (01-core-development)

### Step 2: Add Deploy Tool to MCP Server

| Task | Deliverable |
|------|------------|
| `apps/mcp-server/src/tools/deploy.ts` — `deploy_app` tool | New MCP tool |
| Input: `{ app_name: string, provider?: 'vercel' }` | Input schema |
| Output: deployment URL + status | Output |
| Register in `tools/index.ts` | Tool registration |

> **Skill:** `mcp-builder` (General Skills) — MCP tool creation
> **Skill:** `/modify-feature` (Agent Core, mode=balanced) — extend MCP server
> **Subagents:** `mcp-developer` (06-developer-experience), `deployment-engineer` (03-infrastructure) — deploy logic

### Step 3: Add Marketplace Tools to MCP Server

| Task | Deliverable |
|------|------------|
| `install_module` tool — subscribe clinic to marketplace module via Connect API | New MCP tool |
| `uninstall_module` tool — unsubscribe from module | New MCP tool |
| `list_installed_modules` tool — get installed modules for a clinic | New MCP tool |
| Register all in `tools/index.ts` | Tool registration |

> **Skill:** `mcp-builder` (General Skills) — MCP tool creation
> **Subagents:** `mcp-developer` (06-developer-experience)

### Step 4: TypeScript SDK Package

| Task | Deliverable |
|------|------------|
| `packages/sdk/` — `@baseplate/sdk` workspace package | New package |
| `packages/sdk/src/connect-client.ts` — typed Connect API client (all 8 endpoints) | API client |
| `packages/sdk/src/types.ts` — request/response types matching OpenAPI spec | Types |
| `packages/sdk/src/index.ts` — barrel export | Entry point |
| Auto-generated from OpenAPI spec (if tooling available) or hand-written | Client code |
| `packages/sdk/README.md` — SDK quick start | Docs |

> **Skill:** `/add-feature` (Agent Core, mode=production) — new SDK package
> **Skill:** `/harden-types` (Agent Core) — strict typing matching OpenAPI spec
> **Subagents:** `api-designer` (01-core-development) — SDK design, `typescript-pro` (02-language-specialists) — type generation, `documentation-engineer` (06-developer-experience) — SDK docs

### Step 5: MCP Server Documentation

| Task | Deliverable |
|------|------------|
| `apps/mcp-server/MCP_SERVER.md` — full documentation | MCP docs |
| Tool reference table (all 10+ tools with input/output schemas) | Reference |
| Setup guide (Claude Desktop config, Cursor config, standalone) | Setup section |
| Authentication guide (CONNECT_API_KEY) | Auth section |
| Example interactions ("Build me a med spa portal") | Examples |
| Registry publishing checklist (npm metadata, README, keywords) | Publishing prep |

> **Skill:** `/sync-docs` (Agent Core) — create/update all MCP documentation
> **Subagents:** `documentation-engineer` (06-developer-experience), `mcp-developer` (06-developer-experience)

### Step 6: Tests for New Tools

| Task | Deliverable |
|------|------------|
| `apps/mcp-server/src/__tests__/tools.test.ts` — test all MCP tools | Test suite |
| Test scaffold returns valid instructions | Scaffold test |
| Test deploy returns URL | Deploy test |
| Test marketplace tools call Connect API correctly | Marketplace tool tests |
| Test error handling (invalid input, API failure) | Error tests |

> **Skill:** `write-tests` (Agent Core, via `/add-feature`) — test coverage
> **Skill:** `test-driven-development` (General Skills) — TDD approach
> **Subagents:** `test-automator` (04-quality-security)

### 4C Gate Checklist
- [ ] `scaffold_vertical` MCP tool added and tested
- [ ] `deploy_app` MCP tool added and tested
- [ ] `install_module`, `uninstall_module`, `list_installed_modules` tools added
- [ ] MCP server has 10+ tools total
- [ ] `@baseplate/sdk` package created with typed Connect API client
- [ ] `MCP_SERVER.md` documentation complete
- [ ] All MCP tool tests pass
- [ ] Typecheck + build passes

---

## Sub-phase 4D: ML Training Pipeline

**Goal:** Python ML scaffolding ready for Phase 5 training. No actual training — no real customer data exists during build phases.

### Step 1: Python Project Structure

| Task | Deliverable |
|------|------------|
| `ml-models/` directory at monorepo root | Project root |
| `ml-models/requirements.txt` — scikit-learn, pandas, numpy, joblib, fastapi, uvicorn | Dependencies |
| `ml-models/README.md` — setup, training, serving instructions | Docs |
| `ml-models/.gitignore` — `models/*.pkl`, `data/*.csv`, `__pycache__/` | Ignore file |
| `ml-models/pyproject.toml` or `setup.py` — package metadata | Package config |

> **Skill:** `/add-feature` (Agent Core, mode=fast) — project scaffolding
> **Subagents:** `python-pro` (02-language-specialists) — Python project setup, `ml-engineer` (05-data-ai) — ML project design

### Step 2: Feature Extraction Module

| Task | Deliverable |
|------|------------|
| `ml-models/src/features.py` — feature extraction from Supabase data | Feature module |
| Maps to Phase 3E TS feature extractors (appointment, payment, engagement features) | Feature alignment |
| `extract_appointment_features(data)` → normalized feature vector | Appointment features |
| `extract_payment_features(data)` → normalized feature vector | Payment features |
| `extract_engagement_features(data)` → normalized feature vector | Engagement features |
| `build_feature_matrix(supabase_client, clinic_id)` → full feature matrix | Matrix builder |

> **Skill:** `/add-feature` (Agent Core, mode=balanced) — feature engineering
> **Subagents:** `data-engineer` (05-data-ai) — feature pipeline design, `python-pro` (02-language-specialists)

### Step 3: Training Script

| Task | Deliverable |
|------|------------|
| `ml-models/src/train.py` — model training script | Training script |
| `train_churn_model(data_path)` — trains RandomForest churn classifier | Churn training |
| `train_ltv_model(data_path)` — trains LTV regression model | LTV training |
| Saves models to `ml-models/models/*.pkl` | Model persistence |
| Logs training metrics (accuracy, precision, recall, F1) | Evaluation logging |
| CLI interface: `python -m src.train --model churn --data data/customers.csv` | CLI |

> **Skill:** `/add-feature` (Agent Core, mode=balanced) — training pipeline
> **Subagents:** `ml-engineer` (05-data-ai), `data-scientist` (05-data-ai) — model selection, `python-pro` (02-language-specialists)

### Step 4: Model Serving

| Task | Deliverable |
|------|------------|
| `ml-models/src/serve.py` — FastAPI prediction server | Serving script |
| `POST /predict/churn` — returns churn probability + confidence | Churn endpoint |
| `POST /predict/ltv` — returns estimated lifetime value | LTV endpoint |
| Loads `.pkl` model at startup; falls back to heuristic if no model | Graceful fallback |
| `GET /health` — health check | Health endpoint |
| Runs on port 8000 by default | Server config |

> **Skill:** `/add-feature` (Agent Core, mode=balanced) — serving infrastructure
> **Skill:** `add-observability` (Agent Core) — log when using heuristic vs trained model
> **Subagents:** `ml-engineer` (05-data-ai), `mlops-engineer` (05-data-ai) — serving design, `python-pro` (02-language-specialists)

### Step 5: Evaluation Script

| Task | Deliverable |
|------|------------|
| `ml-models/src/evaluate.py` — model evaluation script | Evaluation script |
| `evaluate_model(model_path, test_data_path)` → metrics dict | Evaluator |
| Outputs: accuracy, precision, recall, F1, confusion matrix | Metrics |
| CLI: `python -m src.evaluate --model churn --test-data data/test.csv` | CLI |
| Generates evaluation report (markdown) | Report |

> **Skill:** `/add-feature` (Agent Core, mode=fast) — evaluation script
> **Subagents:** `ml-engineer` (05-data-ai), `data-analyst` (05-data-ai)

### Step 6: Churn Prediction Notebook

| Task | Deliverable |
|------|------------|
| `ml-models/notebooks/churn_prediction.ipynb` — Jupyter notebook | Notebook |
| Section 1: Data loading + exploration | EDA |
| Section 2: Feature engineering walkthrough | Feature creation |
| Section 3: Model training + cross-validation | Training |
| Section 4: Evaluation + interpretation | Evaluation |
| Section 5: Feature importance analysis | Interpretation |
| Note: Uses synthetic data from migration 0012 until real data exists in Phase 5 | Data note |

> **Skill:** `/add-feature` (Agent Core, mode=balanced) — notebook creation
> **Subagents:** `data-scientist` (05-data-ai) — notebook design, `ml-engineer` (05-data-ai)

### Step 7: Connect API ML Endpoint

| Task | Deliverable |
|------|------------|
| `apps/connect-api/src/app/api/v1/intelligence/churn-prediction/route.ts` | ML endpoint |
| Input: `{ tenant_id, customer_id? }` | Request schema |
| Calls Python ML server if available, falls back to heuristic (rules-engine ChurnPredictor) | Hybrid approach |
| Output: `{ churn_probability, confidence, risk_level, factors[], recommendation }` | Response schema |
| Add to OpenAPI spec | API docs |
| Add to MCP server tools (`get_churn_prediction`) | MCP tool |

> **Skill:** `/add-feature` (Agent Core, mode=production) — new API endpoint with fallback logic
> **Skill:** `add-observability` (Agent Core) — log which path was used (ML vs heuristic)
> **Skill:** `/sync-docs` (Agent Core) — update OpenAPI spec
> **Skill:** `mcp-builder` (General Skills) — add MCP tool
> **Subagents:** `api-designer` (01-core-development), `backend-developer` (01-core-development), `ml-engineer` (05-data-ai)

### 4D Gate Checklist
- [ ] `ml-models/` directory with requirements.txt, README, .gitignore
- [ ] `features.py` — feature extraction aligned with Phase 3E TS extractors
- [ ] `train.py` — churn + LTV training scripts with CLI
- [ ] `serve.py` — FastAPI prediction server with health check
- [ ] `evaluate.py` — model evaluation script with metrics output
- [ ] `notebooks/churn_prediction.ipynb` — complete walkthrough notebook
- [ ] Connect API: `POST /api/v1/intelligence/churn-prediction` with hybrid fallback
- [ ] OpenAPI spec updated with churn-prediction endpoint
- [ ] MCP tool `get_churn_prediction` added
- [ ] All TypeScript packages still typecheck/test/build pass

---

## Sub-phase 4E: Marketing & Launch Materials

**Goal:** Everything needed for launch day — HN, Reddit, Twitter, dev outreach.

### Step 1: Hacker News Post

| Task | Deliverable |
|------|------------|
| `docs/marketing/hn-post.md` | HN launch post |
| Title options (3 variants) | Title candidates |
| Body: what it is, why we built it, what's different, tech stack, call to action | Post body |
| Tone: technical, humble, evidence-backed | Voice guide |

> **Skill:** `internal-comms` (General Skills) — marketing copy
> **Subagents:** `content-marketer` (08-business-product), `growth-loops` (08-business-product)

### Step 2: Reddit Posts

| Task | Deliverable |
|------|------------|
| `docs/marketing/reddit-webdev.md` | r/webdev post (focus on developer experience, module library) |
| `docs/marketing/reddit-saas.md` | r/SaaS post (focus on vertical SaaS, B2B, marketplace) |
| `docs/marketing/reddit-entrepreneur.md` | r/Entrepreneur post (focus on build-first, no-revenue-until-ready model) |
| Each: title, body, comment responses to likely questions | Complete posts |

> **Skill:** `internal-comms` (General Skills) — marketing copy
> **Subagents:** `content-marketer` (08-business-product), `growth-loops` (08-business-product)

### Step 3: Twitter/X Announcement

| Task | Deliverable |
|------|------------|
| `docs/marketing/twitter-thread.md` | 5-7 tweet thread |
| Tweet 1: Hook (what Baseplate is in one line) | Opener |
| Tweet 2: Problem (building B2B SaaS from scratch sucks) | Problem |
| Tweet 3: Solution (reusable core + Connect API + marketplace) | Solution |
| Tweet 4: Tech stack (Next.js, Supabase, Stripe, MCP) | Stack |
| Tweet 5: Open source (MIT, how to use, quick start) | CTA |
| Tweet 6-7: Screenshots/GIFs + links | Media |

> **Skill:** `internal-comms` (General Skills) — social media copy
> **Subagents:** `content-marketer` (08-business-product)

### Step 4: Demo Content Plan

| Task | Deliverable |
|------|------------|
| `docs/marketing/demo-plan.md` | Content plan |
| List of screenshots needed (dashboard, marketplace, intelligence panel, code structure) | Shot list |
| GIF storyboard (booking flow, marketplace install, risk panel loading) | GIF plan |
| Demo video script (2-3 min walkthrough) | Video script |

> **Skill:** `/sync-docs` (Agent Core) — create demo content plan
> **Subagents:** `content-marketer` (08-business-product), `visual-asset-generator` (06-developer-experience)

### Step 5: Landing Page Copy

| Task | Deliverable |
|------|------------|
| `docs/marketing/landing-page.md` | Landing page copy |
| Headline (1 line — what Baseplate does) | Hook |
| Sub-headline (who it's for) | Audience |
| Features section (6 key features with icons) | Features |
| How it works (3 steps: scaffold → connect → launch) | Process |
| Pricing tiers (Connect, Intelligence, Marketplace) | Pricing |
| Social proof placeholders | Proof |
| FAQ (5 common questions) | FAQ |
| CTA (GitHub link, docs link, Discord) | CTA |

> **Skill:** `/sync-docs` (Agent Core) — landing page copy
> **Skill:** `internal-comms` (General Skills) — copywriting
> **Subagents:** `content-marketer` (08-business-product), `growth-loops` (08-business-product)

### Step 6: Developer Outreach Templates

| Task | Deliverable |
|------|------------|
| `docs/marketing/dev-outreach-email.md` | Cold email template |
| Pitch: build a marketplace module, earn 80% revenue, we handle hosting/billing | Value prop |
| Personalization variables (name, vertical, module idea) | Merge fields |
| Follow-up email (day 3, day 7) | Follow-ups |
| Discord/Slack community outreach template | Community template |

> **Skill:** `internal-comms` (General Skills) — email templates
> **Skill:** `/sync-docs` (Agent Core) — create template docs
> **Subagents:** `content-marketer` (08-business-product), `sales-engineer` (08-business-product)

### 4E Gate Checklist
- [ ] HN post drafted (3 title variants, full body)
- [ ] Reddit posts drafted (3 communities, tailored messaging)
- [ ] Twitter thread drafted (5-7 tweets with media plan)
- [ ] Demo content plan (screenshots, GIFs, video script)
- [ ] Landing page copy complete (headline through FAQ)
- [ ] Developer outreach email templates (cold + follow-ups + community)

---

## Skill Mapping Summary (Complete Reference)

### Agent Core Skills (37)

| Skill | Used In | Purpose |
|-------|---------|---------|
| `/add-feature` | 4A.4, 4B.1, 4B.2, 4B.6, 4C.1, 4C.2, 4C.4, 4D.1, 4D.2, 4D.3, 4D.4, 4D.5, 4D.6, 4D.7 | New features, endpoints, packages, Python pipeline |
| `/modify-feature` | 4B.3, 4C.1, 4C.2, 4C.3 | Extend existing portal nav, MCP server |
| `/sync-docs` | 4A.1, 4A.2, 4A.3, 4B.4, 4B.5, 4C.5, 4D.7, 4E.4, 4E.5, 4E.6 | Create/update documentation |
| `/update-changelog` | 4A.1 | Seed CHANGELOG.md |
| `/audit` | 4A.5 | Whole-codebase security + cleanup sweep |
| `/check-pr-readiness` | 4A.5 | Pre-publish gauntlet |
| `/polish-ui` | 4B.1, 4B.2 | UX checklist on marketplace UI |
| `/add-empty-error-states` | 4B.1 | Empty/loading/error states |
| `/audit-responsive` | 4B.1 | Responsive layout check |
| `/audit-authz` | 4B.2 | Verify marketplace proxy route auth |
| `/harden-types` | 4B.3, 4B.4, 4C.4 | Type safety at boundaries, SDK types |
| `add-observability` | 4D.4, 4D.7 | Log ML vs heuristic fallback |
| `write-tests` | 4C.6 | MCP tool test coverage |
| `/commit` | After each step | Commit work |

### General Skills (31)

| Skill | Used In | Purpose |
|-------|---------|---------|
| `mcp-builder` | 4C.1, 4C.2, 4C.3, 4D.7 | MCP tool creation (4-phase process) |
| `internal-comms` | 4E.1, 4E.2, 4E.3, 4E.5, 4E.6 | Marketing copy (HN, Reddit, Twitter, landing page, emails) |
| `verification-before-completion` | 4A.4 | Verify CI pipeline works |
| `test-driven-development` | 4C.6 | TDD for MCP tools |
| `code-review` | 4A.5 | Independent code review before launch |
| `writing-plans` | All sub-phases | Reference for plan structure |

### Claude Code Subagents (153 → ~25 used)

| Subagent | Category | Used In | Purpose |
|----------|----------|---------|---------|
| `documentation-engineer` | 06-dev-experience | 4A.1, 4A.2, 4B.4, 4B.5, 4B.6, 4C.4, 4C.5 | All documentation tasks |
| `readme-generator` | 06-dev-experience | 4A.1, 4A.3 | README + meta-file polish |
| `devops-engineer` | 03-infrastructure | 4A.4 | CI/CD pipeline design |
| `build-engineer` | 06-dev-experience | 4A.4 | Build optimization |
| `security-auditor` | 04-quality-security | 4A.5, 4B.4 | Security scan, module spec security |
| `code-reviewer` | 04-quality-security | 4A.5 | Pre-launch code review |
| `react-specialist` | 02-language-specs | 4B.1, 4B.2 | Marketplace UI components |
| `ui-designer` | 01-core-dev | 4A.3, 4B.1 | Visual design |
| `nextjs-developer` | 02-language-specs | 4B.1 | Next.js routing |
| `api-designer` | 01-core-dev | 4B.2, 4B.4, 4C.4, 4D.7 | Endpoint + SDK design |
| `backend-developer` | 01-core-dev | 4B.3, 4C.1, 4D.7 | Module loader, MCP tools, endpoints |
| `typescript-pro` | 02-language-specs | 4B.3, 4C.4 | Type design for SDK |
| `mcp-developer` | 06-dev-experience | 4C.1-3, 4C.5 | MCP tool creation + docs |
| `deployment-engineer` | 03-infrastructure | 4C.2 | Deploy tool logic |
| `python-pro` | 02-language-specs | 4D.1, 4D.2, 4D.4 | Python ML pipeline |
| `ml-engineer` | 05-data-ai | 4D.1, 4D.3, 4D.4, 4D.6, 4D.7 | ML model design |
| `data-engineer` | 05-data-ai | 4D.2 | Feature extraction pipeline |
| `data-scientist` | 05-data-ai | 4D.3, 4D.6 | Model selection, notebook design |
| `data-analyst` | 05-data-ai | 4D.5 | Model evaluation |
| `mlops-engineer` | 05-data-ai | 4D.4 | Model serving design |
| `test-automator` | 04-quality-security | 4C.6 | MCP tool test design |
| `content-marketer` | 08-business-product | 4E.1-6 | All marketing copy |
| `growth-loops` | 08-business-product | 4E.1, 4E.2, 4E.5 | Growth strategy |
| `technical-writer` | 08-business-product | 4B.5 | Developer guide |
| `visual-asset-generator` | 06-dev-experience | 4E.4 | Demo content assets |
| `sales-engineer` | 08-business-product | 4E.6 | Developer outreach |

### Impeccable (Front End Design)

| Command | Used In | Purpose |
|---------|---------|---------|
| `/impeccable shape` | 4A.3 | Shape README narrative and information hierarchy |

### Token Optimization

| Skill | Used In | Purpose |
|-------|---------|---------|
| `session-handoff` | Between sub-phases | Context handoff when switching sub-phases |
| `token-guard` | Throughout | Token optimization habits |

---

## New Packages Summary

| Package | Purpose | Sub-phase |
|---------|---------|-----------|
| `@baseplate/sdk` | Typed Connect API client for external developers | 4C |

## New Directories Summary

| Directory | Purpose | Sub-phase |
|-----------|---------|-----------|
| `ml-models/` | Python ML training pipeline | 4D |
| `examples/example-module/` | Reference marketplace module | 4B |
| `docs/marketing/` | Launch materials | 4E |

## New Connect API Endpoints Summary

| Endpoint | Method | Purpose | Sub-phase |
|----------|--------|---------|-----------|
| `/api/v1/intelligence/churn-prediction` | POST | ML-based churn prediction with heuristic fallback | 4D |

## New MCP Tools Summary

| Tool | Purpose | Sub-phase |
|------|---------|-----------|
| `scaffold_vertical` | Create new vertical app from template | 4C |
| `deploy_app` | Deploy app to Vercel | 4C |
| `install_module` | Subscribe clinic to marketplace module | 4C |
| `uninstall_module` | Unsubscribe from module | 4C |
| `list_installed_modules` | Get installed modules for a clinic | 4C |
| `get_churn_prediction` | ML churn prediction | 4D |

---

## Estimated Timeline (AI-Assisted)

| Sub-phase | Steps | Est. Hours | Cumulative |
|-----------|-------|------------|------------|
| 4A — Open-Source Repo Prep | 5 | 6-8 | 6-8 |
| 4B — Marketplace UI + Dev Docs | 6 | 8-10 | 14-18 |
| 4C — MCP Enhancement + SDK | 6 | 6-8 | 20-26 |
| 4D — ML Training Pipeline | 7 | 8-10 | 28-36 |
| 4E — Marketing & Launch Materials | 6 | 4-6 | 32-42 |

> **Note:** AI-assisted timelines. Each sub-phase should end with `/commit` + `MASTER_PROGRESS.md` update.

---

## Post-Phase 4 Artifacts

By the end of Phase 4, you will have:

- ✅ GitHub-ready repo (LICENSE, CONTRIBUTING, CHANGELOG, ARCHITECTURE, issue/PR templates)
- ✅ Enhanced CI/CD (builds all apps, all packages, all tests)
- ✅ Security-audited codebase (no secrets, no dead code)
- ✅ Marketplace UI in portal (browse, search, install, uninstall, manage)
- ✅ Module loader infrastructure (dynamic sidebar integration)
- ✅ Marketplace developer spec + guide + reference module
- ✅ MCP server with 10+ tools (scaffold, deploy, marketplace, intelligence, communications, billing, reporting)
- ✅ `@baseplate/sdk` typed Connect API client package
- ✅ MCP server documentation (MCP_SERVER.md)
- ✅ Python ML pipeline (features, train, serve, evaluate, notebook)
- ✅ Connect API churn-prediction endpoint (ML + heuristic fallback)
- ✅ Marketing materials (HN, Reddit x3, Twitter thread, landing page, dev outreach)
- ✅ Demo content plan (screenshots, GIFs, video script)
- ✅ Ready for Phase 5 (customer onboarding)

---

## What's Explicitly NOT in Phase 4

| Item | Deferred To | Why |
|------|------------|-----|
| Third vertical scaffold | Phase 5+ | Demand-driven per Phase 4 overview doc |
| ML model training (actual) | Phase 5+ | Needs real customer data (50+ clinics, 6+ months) |
| Marketplace go-live (live customers) | Phase 5+ | No customers exist yet |
| MCP registry go-live (live publishing) | With GitHub launch | Coordinated with marketing launch |
| Stripe Connect real payments | Phase 5+ | No module authors or customers yet |
| Developer recruitment (actual outreach) | Phase 5+ | Send emails when repo is public |
| Module review process (live) | Phase 5+ | No modules submitted yet |
