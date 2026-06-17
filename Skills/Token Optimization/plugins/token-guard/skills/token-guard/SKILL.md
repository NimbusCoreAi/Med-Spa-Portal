---
name: token-guard
description: >
  Master token optimization skill that enforces token-saving habits throughout every session.
  Automatically activates when working in any codebase to reduce token waste, manage context
  windows, preserve cache hits, and avoid session limit burnout. Use when writing prompts,
  managing sessions, choosing models, handling files, or any interaction that consumes tokens.
  Trigger phrases: "save tokens", "reduce tokens", "token usage", "context window", "session limit",
  "hitting limits", "cache", "optimize tokens", "token efficient", "compact", "context rot",
  "too many tokens", "burning tokens".
---

# Token Guard

## Overview

Every message you send costs tokens — and every subsequent message rereads the entire conversation
history, compounding cost exponentially. A 100+ message chat can burn 2.5M+ tokens, with 98.5% spent
just rereading old history. This skill enforces the habits that prevent that waste.

**Core principle: Use fewer tokens per interaction. Every habit below comes back to this one idea.**

## Token Fundamentals

- Claude counts **tokens**, not messages. One token ≈ 3/4 of a word.
- Every message **rereads the entire conversation from the top**.
- Message 1 might cost 500 tokens. Message 30 can cost 15,000+. Message 100+ can cost 232,000+.
- **Cost compounds exponentially, not linearly.**
- Output tokens cost more than input tokens.
- Cached tokens cost only **10% of normal input** — preserving cache is critical.

## Session Management Protocol

### Monitor Context Health

1. **Check context size proactively.** If the MCP server's `context_report` tool is available, use
   it to check current token usage. If not, mentally track rough turn count.
2. **Reset at ~120K tokens (~12% of 1M window).** Do NOT wait for auto-compaction at 95%.
   - Auto-compaction at 95% retains only 20–30% of detail and runs at the model's least intelligent point.
   - Manual reset at 60% retains far more context and produces better summaries.
3. **Context rot is real.** Retrieval accuracy drops from 92% at 256K tokens to 78% at 1M. Thinking
   depth drops 67% as sessions grow. Edit-without-reading rate climbs from 6% to 34%.

### When to Reset

| Trigger | Action |
|---------|--------|
| Session crosses ~120K tokens | Run `session_handoff` skill or ask for summary, then `/clear` |
| Switching to a new task | `/clear` immediately |
| Same task, long session | `/compact` or session handoff |
| Claude seems confused/vague | `/clear` and start fresh — even mid-task |
| Session idle >1 hour | New session with handoff summary |
| Failed attempt polluting context | Use `/rewind` (double-tap Escape) to drop it |

### Session Handoff (Preferred over /compact)

When the session needs resetting:

1. Invoke the **session-handoff** skill, OR ask Claude directly:
   "Give me a full summary of everything we've done, the current status, and what's next."
2. Copy the output.
3. Run `/clear`.
4. Paste the summary as the first message.
5. Continue with a fresh context window.

This preserves context quality far better than `/compact` because:
- The summary is generated while the model is still intelligent (not at 95% capacity).
- It captures decisions, files, running state, and next steps explicitly.
- The fresh session starts with prime-time model performance.

### Session Chaining for Big Projects

Don't do everything in one session. Chain specialized sessions:

1. **Discovery session** — Claude reads codebase/PDFs, produces summary docs.
2. **Planning session** — Claude reads summaries, creates a plan.
3. **Execution session** — Claude reads plan, implements.

Each session has a specialized task, like an assembly line.

## Cache Preservation Rules

The cache saves 90% on reused tokens. Protect it.

### NEVER Break the Cache If Avoidable

| Action | Cache Impact |
|--------|-------------|
| Switching models mid-session (`/model`) | **BREAKS** — full re-read, zero cache hits |
| `opus plan` model setting (Opus→Sonnet toggle) | **BREAKS** — each toggle is a fresh cache |
| Waiting >1 hour on subscription (>5 min on API) | **BREAKS** — TTL expires |
| Changing the system prompt | **BREAKS** — entire prefix invalidated |
| Editing CLAUDE.md mid-session | **SAFE** — edit applies on next session restart |
| Continuing conversation normally | **SAFE** — cache grows incrementally |

### Cache Habits

- Don't pause >1 hour mid-session. If you must, hand off to a new session.
- Don't switch models unless absolutely necessary.
- If using sub-agents, remember their TTL is only 5 minutes by default.

## Prompting Habits

### Edit, Don't Follow Up

When Claude gets something wrong:
- **WRONG:** Send a correction message ("No, I meant this", "Try this instead")
- **RIGHT:** Edit the original message, fix the wording, regenerate

Every follow-up multiplies context. Editing replaces it.

### Batch Questions

- Three separate prompts = three full context loads.
- One prompt with three tasks = one context load.
- Batch unrelated questions into a single message whenever possible.
- Answers are often better because Claude sees the full picture.

### Use `/btw` for Tangential Questions

Side questions via `/btw` don't enter conversation history — keeps context clean.

### Plan Mode First

- Boris Churnney (creator of Claude Code) starts every session in plan mode.
- Spending tokens upfront on a clear plan prevents costly corrections later.
- Get the plan right → let Claude one-shot the implementation.

## File Handling Rules

### Convert to Markdown Before Loading

| Format | Token Reduction When Converted to Markdown |
|--------|-------------------------------------------|
| HTML | ~90% |
| PDF | ~65–70% |
| DOCX | ~33% |

If a user provides a PDF, HTML, or DOCX, convert it to markdown first using the MCP server's
`convert_to_markdown` tool. The model only needs the text content, not layout/metadata noise.

### Upload Recurring Files to Projects

If the same document is used across multiple chats, upload it to a Claude Project once.
Projects cache the file — subsequent conversations reference it without retokenizing.

## Model Selection Guidance

| Model | Use For | Cost |
|-------|---------|------|
| Haiku | Grammar, brainstorming, formatting, quick translations, navigation, scheduled jobs | Low |
| Sonnet | Real work, medium tasks, known-successful repeated tasks | Medium |
| Opus | Deep thinking, planning, deep dives, complex programming | High |

- Using Haiku for simple tasks frees up 50–70% of budget.
- **Do NOT switch models mid-session** — it breaks the cache.
- For sub-agents, explicitly request cheaper models: "Use Haiku for this sub-agent."

## Sub-Agent Delegation

Delegate research, verification, and summarization to sub-agents:
- Each gets a fresh context window — research noise doesn't pollute your main session.
- Explicitly request cheaper models for sub-agents.
- "Spin up a sub-agent to verify this" or "Spin up a sub-agent to summarize and use Haiku."

## Feature Management

Turn off unused features — they add tokens to every response even when unused:
- Web search (off if writing own content)
- Connectors (off if not needed)
- Explore mode (off if not exploring)
- Advanced thinking (off by default; only on if first attempt was unsatisfactory)

**Rule: If you didn't turn a feature on intentionally, turn it off.**

## NEVER

- **NEVER send a follow-up correction when you can edit the original message and regenerate.**
  **Instead:** Edit the original message.
  **Why:** Follow-ups multiply context; edits replace it.

- **NEVER switch models mid-session unless the session is being reset anyway.**
  **Instead:** Plan model choice before starting; reset if you must switch.
  **Why:** Switching models invalidates the entire cache — full re-read with zero hits.

- **NEVER let a session run past ~120K tokens without resetting.**
  **Instead:** Run session handoff, then `/clear`.
  **Why:** Context rot degrades quality; 78% retrieval accuracy at 1M vs 92% at 256K.

- **NEVER load a PDF/HTML/DOCX directly when markdown is available.**
  **Instead:** Convert to markdown first.
  **Why:** 33–90% token reduction with no information loss for text content.

- **NEVER use auto-compaction at 95% when you can manually reset at 60%.**
  **Instead:** Proactive session handoff + `/clear`.
  **Why:** Auto-compaction loses 70–80% of detail at the model's worst performance point.

- **NEVER cram everything into CLAUDE.md.**
  **Instead:** Keep under 200 lines; offload specialized instructions to routed context files or skills.
  **Why:** CLAUDE.md loads every session — bloat is paid forever.

## Quick Self-Check (Run Mentally Every 10 Turns)

- [ ] Am I past ~120K tokens? → Hand off and reset.
- [ ] Did Claude just fail? → `/rewind` instead of correcting.
- [ ] Can I batch my next 2-3 questions? → Combine them.
- [ ] Am I about to switch models? → Reset first, or don't switch.
- [ ] Is this a side question? → Use `/btw`.
- [ ] Could a sub-agent handle this? → Delegate it.
- [ ] Could a cheaper model handle this? → Switch (on a fresh session).
