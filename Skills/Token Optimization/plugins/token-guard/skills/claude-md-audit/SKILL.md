---
name: claude-md-audit
description: >
  Audits CLAUDE.md and context files for token bloat and optimization opportunities. Scans all
  CLAUDE.md, .cursorrules, context files, and agent configuration in a project to identify
  oversized files, redundant instructions, non-essential content loading every session, and
  recommendations for offloading to routed context files or skills. Use when setting up a new
  project, when sessions feel slow or expensive, when token usage seems unexpectedly high, or
  when the user says "audit", "review CLAUDE.md", "optimize context", "why is my session slow",
  "too many startup tokens", "check context files", "trim instructions".
---

# CLAUDE.md Audit

## Overview

CLAUDE.md loads on **every single session**. If it's bloated, you pay that cost every conversation
— before you've even typed anything. Some projects unknowingly burn 40K–62K tokens on startup
overhead alone. This skill identifies and fixes that bloat.

**Target: Keep CLAUDE.md under 200 lines (~2,000 tokens).**

## When to Use

- Setting up a new project (get CLAUDE.md right from the start)
- Sessions feel slow or token-heavy from the start
- `/context` shows unexpectedly high startup token count
- Adding a new agent/skill/MCP that might bloat context
- Periodic maintenance (recommend monthly for active projects)
- User reports hitting session limits quickly

## Audit Process

### Phase 1: Discover All Context Files

Scan the project for all files that load into context:

1. **Root CLAUDE.md** — `./CLAUDE.md` or `./claude.md`
2. **Nested CLAUDE.md files** — any `CLAUDE.md` in subdirectories
3. **Agent definitions** — `.claude/agents/*.md`
4. **Skill definitions** — `.claude/skills/*/SKILL.md` or plugin skill directories
5. **MCP configurations** — `.mcp.json` or MCP server configs
6. **Cursor rules** — `.cursorrules` or `.cursor/rules/*.md`
7. **Other instruction files** — `.claude/instructions.md`, `AGENTS.md`, etc.
8. **.claudeignore** — check if one exists and what it excludes

### Phase 2: Measure Each File

For each file found, measure:
- **Line count** and **estimated token count** (~1 token per 4 characters, ~0.75 tokens per word)
- **Percentage of a 200K context window** it consumes
- **Whether it loads every session** (root CLAUDE.md always does; nested files load conditionally)

Use the MCP server's `audit_context_files` tool if available for automated measurement.

### Phase 3: Classify Content

Review each file's content and classify every section:

| Classification | Action |
|---------------|--------|
| **Essential** — Claude needs this every session to do its job | Keep |
| **Conditional** — Only needed for specific tasks | Move to routed context file or skill |
| **Redundant** — Duplicated across files | Consolidate to one location |
| **Outdated** — References old patterns, removed features, stale conventions | Delete or update |
| **Over-specified** — Too much detail for what Claude needs | Condense to bullet points |
| **Human-facing** — Meant for developers, not Claude | Move to README or docs |

### Phase 4: Generate Audit Report

Produce a structured report:

```markdown
# Context File Audit Report

## Summary
- Total context files found: N
- Total estimated startup tokens: X,XXX (~X% of 200K window)
- Files exceeding recommendations: N
- Estimated savings if optimized: X,XXX tokens/session

## File-by-File Breakdown

### [filename] — X lines, ~X tokens
- Status: [OK / WARNING / CRITICAL]
- Findings: [specific issues]
- Recommendation: [specific action]

## Optimization Recommendations

### 1. [Recommendation title]
- **File:** [which file]
- **Issue:** [what's wrong]
- **Action:** [what to do]
- **Savings:** ~X tokens/session

[... more recommendations ranked by impact]

## Suggested CLAUDE.md Structure
[A recommended lean CLAUDE.md outline if the current one needs restructuring]
```

## CLAUDE.md Best Practices

### What Belongs in CLAUDE.md (Essential, Every Session)

- **Project type and stack** — One line: "This is a TypeScript monorepo using X, Y, Z."
- **Critical conventions** — Naming, file structure, import style that must be followed.
- **Build/test/lint commands** — The exact commands Claude needs to run.
- **Key constraints** — "Never modify X", "Always use Y pattern", "Tests must pass before commit."
- **Environment requirements** — Node version, package manager, env vars needed.

### What Does NOT Belong in CLAUDE.md

- **Detailed coding standards** → Move to a `docs/coding-standards.md` that gets routed to on demand.
- **Architecture documentation** → Move to `docs/architecture.md` — Claude reads it when needed.
- **Onboarding guides** → Move to README.md.
- **Long lists of rules** → Condense to the 5-10 most critical; offload the rest.
- **Change logs or history** → These are noise; Claude doesn't need them every session.
- **Full API documentation** → Route to when working on API code, not every session.

### How to Offload to Routed Context Files

Instead of putting everything in CLAUDE.md:

1. Create a `docs/` or `.claude/context/` directory.
2. Move detailed instructions into topic-specific files:
   - `docs/coding-standards.md`
   - `docs/architecture.md`
   - `docs/testing-conventions.md`
   - `docs/deployment.md`
3. In CLAUDE.md, add a brief pointer:
   ```
   When working on tests, read docs/testing-conventions.md for conventions.
   When working on API routes, read docs/api-conventions.md.
   ```
4. These files only load when the relevant task is active — not every session.

### .claudeignore

Create or update `.claudeignore` to exclude directories/files Claude shouldn't read:
- `node_modules/`, `dist/`, `build/`, `.next/`
- Large data directories, media files
- Generated code, lockfiles (if large)
- Test fixtures, mock data (if extensive)

This prevents Claude from wasting tokens scanning irrelevant content.

## Thresholds

| Metric | OK | Warning | Critical |
|--------|-----|---------|----------|
| Root CLAUDE.md lines | <100 | 100-200 | >200 |
| Root CLAUDE.md tokens | <1,000 | 1,000-2,000 | >2,000 |
| Total startup tokens | <8,000 | 8,000-20,000 | >20,000 |
| Nested CLAUDE.md files | <5 | 5-10 | >10 |
| MCP tools loaded | <10 | 10-20 | >20 |

## NEVER

- **NEVER leave detailed architecture docs in CLAUDE.md.**
  **Instead:** Move to routed context files with a one-line pointer in CLAUDE.md.
  **Why:** Architecture docs are only needed when working on architecture — not every session.

- **NEVER ignore .claudeignore for large repos.**
  **Instead:** Create one that excludes generated files, dependencies, and large data.
  **Why:** Without it, Claude may waste tokens scanning irrelevant directories.

- **NEVER duplicate instructions across CLAUDE.md and nested files.**
  **Instead:** Define once in the most specific location; reference from others.
  **Why:** Duplication means maintenance burden and inconsistent behavior when they diverge.

## Verification Checklist

After applying audit recommendations:
- [ ] Root CLAUDE.md is under 200 lines (~2,000 tokens)
- [ ] No content classified as "Conditional" remains in always-loaded files
- [ ] No duplicated instructions across files
- [ ] .claudeignore exists and excludes generated/large directories
- [ ] Routed context files are referenced from CLAUDE.md with clear triggers
- [ ] Startup token count verified via `/context` on a fresh session
