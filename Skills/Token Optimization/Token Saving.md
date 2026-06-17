# Token Saving Guide

A comprehensive collection of strategies to reduce token usage and avoid hitting Claude session limits. Compiled from multiple expert sources on Claude Code and Claude.ai token optimization.

---

## Skills & Tools That Implement These Strategies

This guide documents the **strategies**. The following skills and MCP tools **automate** them.
Use them before and during any task to save tokens automatically.

### Skills (3) — in `Skills/Token Optimization/plugins/token-guard/skills/`

| Skill | Strategies It Covers | Trigger Phrases |
|-------|---------------------|-----------------|
| **token-guard** | All — master behavioral skill (Sections 2–13) | "save tokens", "reduce tokens", "context window", "burning tokens" |
| **session-handoff** | Section 3 (session reset), Section 4 (context rot) | "handoff", "summarize", "new session", "reset context" |
| **claude-md-audit** | Section 6 (CLAUDE.md discipline) | "audit CLAUDE.md", "optimize context", "too many startup tokens" |

### MCP Server (5 tools) — `token-guard-mcp-server`

| Tool | Section | Purpose |
|------|---------|---------|
| `token_estimate` | §1, §4 | Estimate tokens before reading files — see cost-depth multiplier |
| `session_report` | §14 (usage tracking) | Parse JSONL logs — input/output/cache tokens, hit rate, models |
| `audit_context_files` | §6 (CLAUDE.md discipline) | Scan project context files, report bloat + recommendations |
| `compress_log_output` | §12 (output compression) | Compress noisy logs before pasting into context |
| `convert_to_markdown` | §8 (file conversion) | HTML/PDF/text → markdown (33–90% reduction) |

### How to Use This Guide with the Skills

1. **Before any task:** Run the Token Optimization Protocol in the root `CLAUDE.md`.
2. **Strategy lookup:** Find the section below that matches your situation.
3. **Automate it:** Use the corresponding skill or MCP tool listed above.
4. **Full routing:** See `Skills/SKILL_ROUTING_GUIDE.md` for task → skill mapping across all collections.

---

## Table of Contents

1. [Understanding How Tokens Work](#1-understanding-how-tokens-work)
2. [Prompt Caching](#2-prompt-caching)
3. [Session Management](#3-session-management)
4. [Context Rot & Window Management](#4-context-rot--window-management)
5. [Sub-Agents](#5-sub-agents)
6. [CLAUDE.md Discipline](#6-claudemd-discipline)
7. [Model Selection](#7-model-selection)
8. [File Handling & Conversion](#8-file-handling--conversion)
9. [Feature Management](#9-feature-management)
10. [Batching & Workflow Habits](#10-batching--workflow-habits)
11. [Code Retrieval Strategies](#11-code-retrieval-strategies)
12. [Output Compression](#12-output-compression)
13. [Concise Responses](#13-concise-responses)
14. [Usage Tracking](#14-usage-tracking)
15. [Tools & Repos](#15-tools--repos)
16. [Quick Reference Cheat Sheet](#16-quick-reference-cheat-sheet)

---

## 1. Understanding How Tokens Work

### The Core Concept
- **Claude counts tokens, not messages.** One token is roughly 3/4 of a word (a 100-word message ≈ 130 tokens).
- **Every message rereads the entire conversation from the top.** Message 1 might cost 500 tokens, message 10 costs 5,000, message 30 costs ~232,000 tokens — for a single message.
- **Cost compounds exponentially, not linearly.** Your 10th message costs 11x more than your first.
- A developer tracked a 100+ message chat: **98.5% of all tokens were spent rereading old chat history.** Only 1.5% went to generating useful responses.
- **Output tokens cost more than input tokens**, so long verbose responses also count against you.

### Why This Matters
Every single strategy below comes back to one idea: **use fewer tokens per interaction.**

---

## 2. Prompt Caching

### How Caching Saves Tokens
- Cached tokens cost only **10% of normal input** — a 90% savings on reused content.
- Prompt caching happens **automatically** in Claude Code and Claude — nothing to configure.
- Example: 91 million tokens cached cost the equivalent of processing only ~9 million.

### What Gets Cached (Layered)
| Layer | Contents | Scope |
|-------|----------|-------|
| **System Layer** | System instructions, tool definitions (read, write, bash, grep, glob), output style | Globally cached |
| **Project Layer** | CLAUDE.md, memory, rules | Cached per project |
| **Conversation Layer** | Messages and replies | Cached each turn (grows incrementally) |

### Cache TTL (Time to Live)
| Environment | Default TTL |
|-------------|-------------|
| Claude subscription (Claude Code terminal/extension) | **1 hour** |
| API / sub-agents | **5 minutes** (can be extended to 1 hour at higher cost) |
| Over-limit pay-per-token API territory | **5 minutes** (dangerous for multi-session management) |
| Claude.ai web | Not officially documented (likely same as subscription) |

### What Breaks the Cache
- **Switching models mid-session** — each model has its own cache; switching means the next request reads the entire conversation history with no cache hits.
- **The `opus plan` model setting** — resolves to Opus during plan mode and Sonnet during execution; each plan toggle is a model switch and starts a fresh cache.
- **Waiting longer than the TTL** (1 hour on subscription, 5 min on API).
- **Changing the system prompt** — everything from the beginning must be fully re-read.

### Cache-Safe Actions
- **Editing CLAUDE.md mid-session is safe** — the edit doesn't apply until you restart the session, so the cache stays intact.
- **Uploading docs to Claude Projects** — project files are cached differently and more optimized than pasting documents directly into chat.

### Cache Habits
- **Don't pause too long.** If a session has been idle for over an hour, hand it off to a new session.
- **Keep sessions alive and focused.** Avoid unnecessary interruptions.
- **Start fresh when switching tasks** — use `/compact` (breaks cache intentionally) or `/clear`.

---

## 3. Session Management

### Don't Follow Up — Edit Instead
- When Claude gets something wrong, **don't send a correction message**. Every follow-up gets added to history and is reread every turn.
- Instead: **click Edit on your original message**, fix the wording, and **hit Regenerate**. The old exchange gets replaced instead of multiplied — same result, fraction of the cost.

### Use `/rewind` (or `/re`)
- Double-tap Escape or run `/re` to **jump back to any previous message** and drop everything after it.
- This is **Anthropic's #1 recommended habit**.
- Failed attempts, broken code, and wrong approaches stay in your context if you don't rewind — polluting future responses.
- The `/re` menu also has a **"summarize from here"** option that creates a handoff message (a note from Claude's future self to its past self).

### Fresh Chat Every 15–20 Messages
- A 100+ message chat burns over 2.5 million tokens, mostly rereading old history.
- When a conversation gets long: ask Claude to summarize everything, copy the summary, start a new chat, paste it as your first message.
- You keep the context, you ditch the bloat.

### Manual Compaction (Not Auto)
- Auto-compaction kicks in around **95%** of the context window — **way too late**.
- At that point, you only keep **20–30% of original detail**, and the model does compaction at its **least intelligent point** (peak context rot).
- **Manually compact at ~60%** of your context window for far better results.
- Rule of thumb: use `/clear` when starting a new task, use `/compact` when continuing the same task.

### Session Handoff Technique
1. Ask Claude for a **full summary** of everything done, current status, and what's next.
2. Copy the summary output.
3. Run `/clear`.
4. Paste the summary as your first message.
5. Continue working with a completely fresh context window.

A **session handoff skill** automates this — it reads everything, then outputs:
- Where it started, decisions locked, what shipped
- Key files for the next session
- Running state, verification, deferred items, open questions
- Pick-up-from-here instructions

### Session Chaining
- Don't do everything in one session for big projects. Chain specialized sessions:
  - **Discovery session** — Claude reads PDFs, codebase, and produces a summary doc.
  - **Planning session** — Claude reads the summary and creates a plan.
  - **Execution session** — Claude reads the plan and implements it.
- Like an assembly line — each session has a specialized task.

### Just Start Fresh
- If a session feels off (repeating things, going off rails) — **clear it or open a new one**, even if you're not near context rot.
- Better for both your sanity and the session's coherence.

---

## 4. Context Rot & Window Management

### What Is Context Rot
- As sessions grow, the model's performance degrades — its attention spreads across every token and message.
- Symptoms: gets distracted, forgets things, contradicts itself, edits files without reading them first, becomes vague and noticeably worse.

### The Statistics
| Metric | At 256k tokens | At 1M tokens |
|--------|----------------|-------------|
| Retrieval accuracy | 92% | 78% |
| Thinking depth (18k thinking blocks analyzed) | Baseline | Dropped 67% |
| Edit-without-reading rate | 6% | 34% |

- One user went from **$345/month to $42,000/month** in token costs while output quality stayed completely flat — purely from bad context management.

### The 1M Window Is Insurance, Not a Goal
- Don't fill the 1M token window just because you can.
- Bigger window ≠ better output — it means more room for context rot and distraction.
- **Recommended ceiling: ~120,000 tokens (~12%)** per session, even on Opus with 1M context.
- The first 0–20% of your session is **prime time** — CLAUDE.md is freshest, the model is most primed.
- Consider starting with the 200K context window to build discipline before graduating to 1M.

---

## 5. Sub-Agents

### How They Save Tokens
- Each sub-agent gets its **own fresh context window** — it does its own work, research, and synthesis, then sends back a result to your main session.
- Like a research intern: you don't watch them read 50 articles; you just get the summary.

### Delegation Strategies
- **"Spin up a sub-agent to verify this."**
- **"Spin up a sub-agent to review your codebase and summarize."**
- **Use cheaper models for sub-agents**: "Spin up a sub-agent to summarize this and make sure it's using Haiku." — the task becomes much cheaper than if Opus did it, with similar quality.

### When to Use
- Research-heavy tasks, code review, verification, summarization — anything where the intermediate steps don't need to pollute your main context.

---

## 6. CLAUDE.md Discipline

### Keep It Lean
- **Keep CLAUDE.md under 200 lines (~2,000 tokens)** — it loads every single session.
- Only put in what Claude actually needs to do the job well.
- Don't cram everything in there — bloat is paid for every conversation.

### Offload Specialized Instructions
- Move specialized instructions into **context files** that get routed to on demand.
- Move them into **skills** that only load when needed.
- This prevents every session from paying the token cost of instructions it doesn't need.

### Use `.claudeignore`
- Exclude folders or files you don't want Claude to read from.
- Especially valuable for massive repos where Claude might waste tokens scanning irrelevant directories.

### Audit Regularly
- Run `/context` on a fresh session to see your **startup overhead** before you even type anything.
- Some people discover 40K–62K tokens burned on every fresh session from bloated config — invisible tokens you don't know are being spent.
- Check periodically: if a 50K-token CLAUDE.md is loading every session, that's 4% gone before you start.

---

## 7. Model Selection

### Choose the Right Model for the Task
| Model | Best For | Cost |
|-------|----------|------|
| **Haiku** | Grammar checking, brainstorming, formatting, quick translations, short answers, `/chrome` navigation, scheduled jobs | Low |
| **Sonnet** | Real work, medium-complexity tasks, repeated/scheduled tasks you know succeed | Medium |
| **Opus** | Deep thinking, planning, deep dives, complex programming | High |

- Using Haiku for drafts and simple tasks **frees up 50–70% of your budget** for tasks that truly require powerful models.
- **Don't use powerful models for simple tasks.**
- For significant programming tasks, use the most reliable model for planning and deep dives — quality itself is a token saver (avoids redoing bad work).

### Warning: Switching Models Breaks Cache
- Each model has its own cache. Switching with `/model` means the next request reads the entire conversation history with no cache hits, even though the context is identical.
- The `opus plan` setting (Opus for plan, Sonnet for execution) resets the cache on each toggle.

---

## 8. File Handling & Conversion

### Convert Everything to Markdown
Markdown is dramatically faster and cheaper for AI models to process:

| Format → Markdown | Token Reduction |
|--------------------|-----------------|
| HTML → Markdown | ~90% fewer tokens |
| PDF → Markdown | ~65–70% reduction |
| DOCX → Markdown | ~33% reduction |

- You can fit roughly **3x more content** into the same context window.
- A 40-page PDF takes up the same space as a 130-page markdown file.
- Use tools like **Docling** to convert files in seconds.
- PDFs, docs, and HTML carry layout, metadata, and formatting noise the model doesn't need — it just needs the text content.
- (If you need OCR or vision, that's a different story — give Claude the actual file.)

### Upload Recurring Files to Projects
- If you upload the same PDF to multiple chats, Claude **retokenizes it every time**.
- Use the **Projects feature** instead: upload once, it gets cached, and every new conversation in that project references it without burning tokens again.
- Cached project content doesn't eat into your usage when accessed repeatedly.
- Huge savings if you work with contracts, briefs, style guides, or long documents.

### Use Claude Projects for Big Documents
- Project files are cached differently and more optimized for document storage.
- Prefer projects over pasting documents directly into Claude chat.

---

## 9. Feature Management

### Turn Off Unused Features
Features add tokens to every response, even if you don't use them:

- **Web search** — turn off if you're writing your own content.
- **Connectors** — disable if not needed.
- **Explore mode** — disable if not actively exploring.
- **Advanced thinking** — keep off by default; only turn on if your first attempt was unsatisfactory.

**Rule of thumb:** If you didn't turn a feature on intentionally, turn it off.

### Enable Extra Usage (Safety Net)
- Pro/Max subscribers can enable the **overage feature** in Settings → Usage.
- When your session limit is reached, Claude switches to pay-as-you-go billing at API rates instead of blocking access.
- Set a monthly spending limit to avoid unexpected bills.
- Not about saving tokens — it's about **not losing your work at the worst possible moment**.

---

## 10. Batching & Workflow Habits

### Batch Questions Into One Message
- Three separate prompts = three context loads.
- One prompt with three tasks = one context load.
- You save tokens twice: fewer context reloads AND you stay further from your limit.
- Example: Instead of "summarize this article" → "list the main points" → "suggest a headline" (3 messages), write "summarize this article, list the main points, and suggest a headline" (1 message).
- Answers are often **better** because Claude sees the full picture immediately.

### Set Up Memory & User Preferences
- Every new chat without saved context wastes 3–5 messages on setup ("I'm a marketer. I write casually. I prefer short paragraphs.").
- Go to **Settings → Memory and User Settings** and save your role, communication style, and preferences once.
- Claude applies them automatically to every new chat — no repeated token burn on boilerplate.

### Use Plan Mode First
- Boris Churnney (creator of Claude Code) **starts every session in plan mode**.
- Spending tokens upfront to clarify the plan prevents costly corrections later.
- Get the plan right, then let Claude one-shot the implementation.
- Tools like **Ultra Plan** or **Superpowers** help with this.

### Watch Your Session Limit
- In the desktop app, you can see remaining session limit — **watch it constantly**.
- If on two monitors, keep it visible on the other screen.
- Be strategic: if close to limit after a long session, take a break. If you have 50% left and it resets soon, **abuse it** — spin up agent teams, tackle heavy codebase work.

### Spread Work Across the Day (Rolling 5-Hour Window)
- Claude uses a **rolling 5-hour window** — it does NOT reset at midnight.
- Messages sent at 9:00 AM no longer count by 2:00 PM.
- Divide your day into 2–3 sessions (morning, afternoon, evening).
- By the time you return, previous usage no longer counts.
- **Cheat code:** Set a cron job to ping Claude with one tiny message at 6:00 AM — your 5-hour window starts then, not when you sit down to work.

### Work During Off-Peak Hours
- As of March 26, 2026, Anthropic uses your 5-hour session limit **more quickly during peak hours**:
  - **Peak:** 5:00 AM – 11:00 AM Pacific / 8:00 AM – 2:00 PM Eastern (weekdays)
- Same query, same chat, but peak hours impact your limit more.
- Running resource-intensive tasks in the **evening or on weekends** significantly stretches your plan.
- If outside the US, check time zone calculations — peak hours may fall during your afternoon.
- Weekly limit stays the same, but distribution changes.

### Use `/btw` (By the Way)
- Opens a quick overlay for side questions that **don't enter your conversation history**.
- If deep into a project and need a quick tangential question answered, use `/btw` to keep your context clean.

### Design Before Coding
- Use tools like **Pencil or Figma** to design before having Claude code.
- Starting from a design produces better results with fewer correction cycles.

---

## 11. Code Retrieval Strategies

### Index Your Code (CodeGraph)
- Creates a searchable graph map of your codebase ahead of time.
- Instead of Claude Code grepping and reading files one by one (loading unnecessary files into context), it uses **semantic natural language search** to find relevant code quickly.
- Install with `npx codegraph init` or `npm install -g codegraph`, then `codegraph init -i`.
- Claude Code learns to use the CLI tool automatically and performs queries on your behalf.

**Trade-offs:**
- Two sources of truth (codebase + index) — must stay synced.
- If out of sync, Claude can confidently report wrong information (file exists when it doesn't, or vice versa).
- May miss module-level CLAUDE.md files when using query-based retrieval.
- Still need to read the actual file once found (saves retrieval tokens, not reading tokens).

### Audit Context with `/context`
- Shows what's in the current context and how many tokens each item uses.
- Look for unexpectedly large items: bloated CLAUDE.md files, heavy MCP servers, unnecessary loaded tools.
- Sometimes MCPs consume a lot of tokens without you realizing it.
- Run this periodically to debug token usage.

---

## 12. Output Compression

### Compress CLI/Log Output (RTK)
- Open-source library that **compresses noisy terminal output** before it enters Claude's context.
- Example: Instead of listing all 43 test results, shows "43 test paths" and bundles suppressed warnings.
- Huge savings for workflows heavy in logs, server output, or noisy CLI usage.
- Install via Homebrew, configure per-directory or globally.
- Claude Code leverages this tooling automatically on your behalf.

**Trade-offs:**
- Compression is **lossy** — risk of dropping an important log or message.
- Turn **off** when debugging server logs or when you need full output for self-correction.
- Turn **on** for most general work where full logs aren't needed.

---

## 13. Concise Responses

### Make Claude Talk Less (Caveman)
- Open-source skill that sets Claude Code into a mode where it **drops fluff and gives concise responses**.
- Modes: Light, Full, Ultra.
- Per-session — can be removed or toggled at any time.
- Reports of **up to 65% token reduction** from this alone.
- Install with `npm install` and set the mode per session.

**Trade-offs:**
- Correctness is at risk — Claude's feedback loop relies on context history; dramatically shrinking outputs can lead to worse answers over time.
- Quality may degrade for complex tasks where detailed reasoning matters.
- Best for routine work, not deep planning or complex problem-solving.

### Important Caveat on Conciseness
- Simply telling Claude "be concise" **doesn't move the needle much** because the bulk of output tokens happen behind the scenes (file edits, tool calls) — not in the visible response window.
- Output tokens cost more than input tokens, but visible response length isn't the main cost driver.

---

## 14. Usage Tracking

### Build a Token Dashboard
- Claude logs every session, turn, and token to your machine in **JSONL files** — input tokens, output tokens, cache reads, cache creation, model names, timestamps.
- A local dashboard scans these files, builds a database, and serves charts on localhost.
- Filter by model, time range, project; get cost estimates based on current API pricing.
- Works **retroactively** on your entire Claude Code history.
- Free, open source, zero dependencies (just needs Python).

### What to Look For
- **Cache read vs. cache create ratio** — high cache reads = good caching behavior.
- **Input vs. output token imbalance per project** — unexpected ratios signal inefficiency.
- **Most expensive prompts** — identify which prompts ate the most tokens and why.
- **Most frequently opened files** — patterns you might not notice (e.g., a file opened 181 times in a week).
- **Most frequent bash commands** — repeated operations that could be optimized.

### Available Dashboards
- Multiple free token dashboard repos exist (search GitHub). Give the repo URL to Claude Code and say "set this up on localhost" — it reads your past session files automatically.

---

## 15. Tools & Repos

### Token Reduction Tools

| Tool | What It Does | Install |
|------|-------------|---------|
| **CodeGraph** | Indexes codebase into a searchable graph for semantic retrieval | `npx codegraph init` or `npm i -g codegraph` |
| **RTK** | Compresses noisy CLI/log output before it hits context | Homebrew install |
| **Caveman** | Makes Claude respond concisely (up to 65% reduction) | `npm install` |
| **Token Dashboard** | Local dashboard tracking all token usage from JSONL files | GitHub repo + Python |

### Additional Token Reduction Repos (10-framework collection)
- **Rust Token Killer** — CLI proxy that filters terminal output before it hits context
- **Context Mode** — sandboxes raw tool output into SQLite instead of dumping into context
- **Code Review Graph** — graph-based code review optimization
- **Token Savior** — token reduction utility
- **Claude Token Efficient** — single CLAUDE.md file that keeps responses terse
- **Token Optimizer MCP** — MCP-based token optimization
- **Claude Token Optimizer** — another token optimization approach
- **Claude Context** — context management tool

> **Don't install all 10.** Each tackles token reduction differently. Analyze them, feed them to Claude Code, and ask which fits your specific project best. Pick 2–3 based on your workflow.

### Built-In Claude Code Commands

| Command | Purpose |
|---------|---------|
| `/context` | View current context and token usage |
| `/clear` | Clear all context, start completely fresh |
| `/compact` | Summarize session and replace history with summary |
| `/rewind` or `/re` | Jump back to a previous message, drop everything after |
| `/model` | Switch models (warning: breaks cache) |
| `/btw` | Ask a side question without adding to conversation history |

---

## 16. Quick Reference Cheat Sheet

### The 80/20 — If You Do Nothing Else

1. **Think in tokens, not messages** — every message rereads the entire history.
2. **Don't follow up on mistakes** — edit the original message and regenerate instead.
3. **Start a fresh chat every 15–20 messages** or use session handoff.
4. **Batch questions** — one message with three tasks beats three separate messages.
5. **Don't switch models mid-session** — it breaks the cache and re-reads everything.
6. **Keep CLAUDE.md under 200 lines** — it loads every session.
7. **Use Haiku for simple tasks** — saves 50–70% of budget for tasks that need power.
8. **Manually compact or clear at ~60%** of your context window, not 95%.
9. **Convert files to markdown** before feeding them to Claude (up to 90% reduction).
10. **Upload recurring files to Projects** — they get cached instead of retokenized.
11. **Use plan mode first** — spending tokens upfront prevents costly corrections.
12. **Watch your session limit** and work strategically around the rolling 5-hour window.

### Habits That Cover 95% of People
- **Don't pause too long** — if idle >1 hour, hand off to a new session.
- **Start fresh when switching tasks** — `/compact` or `/clear`.
- **Paste big documents into Projects**, not into chat directly.

### Trade-Off Summary

| Strategy | Savings | Main Risk |
|----------|---------|-----------|
| Code indexing (CodeGraph) | High (retrieval) | Index can go stale; two sources of truth |
| Output compression (RTK) | High (logs) | Lossy — may drop important messages |
| Concise responses (Caveman) | Up to 65% | Correctness at risk; degraded feedback loop |
| Model switching (Haiku) | 50–70% | Lower quality for complex tasks |
| Session resetting | Very high | Lose conversation history (mitigate with handoff) |
| Markdown conversion | 33–90% | Loses layout/formatting (fine for text content) |

---

*Compiled from multiple expert sources on Claude Code and Claude.ai token optimization. Strategies should be selected based on your specific workflow — not all apply to every situation.*
