---
name: session-handoff
description: >
  Generates a structured session handoff summary that captures all important context from the
  current session so it can be pasted into a fresh session after /clear. Produces: what was done,
  decisions locked, key files, running state, verification steps, deferred items, open questions,
  and exact pickup instructions. Use proactively when a session is getting long (~120K tokens),
  when switching sub-tasks within a project, when context rot is degrading quality, or when the
  user says "summarize", "handoff", "start fresh", "new session", "reset context", "/compact",
  "save context", "preserve progress".
---

# Session Handoff

## Overview

When a session grows past ~120K tokens, context rot degrades model performance significantly.
Rather than relying on `/compact` (which auto-fires at 95% capacity and loses 70–80% of detail),
this skill generates a rich, structured handoff summary while the model is still intelligent,
then the user runs `/clear` and pastes the summary into a fresh session.

**The result feels like you never reset — but you get prime-time model performance back.**

## When to Use

- Session is approaching ~120K tokens (~12% of 1M window)
- Model quality is degrading (vagueness, contradictions, editing without reading)
- Switching from one sub-task to another within the same project
- Session has been idle and you're returning after a break
- Before `/clear` or `/compact` — always hand off first
- User explicitly requests a summary or session reset

## How to Use

1. Invoke this skill (it will analyze the full current session).
2. Read through all conversation history, decisions, files created/modified, and tool calls.
3. Generate the handoff output using the template below.
4. Tell the user to: copy the output → run `/clear` → paste the output as first message.

## Handoff Output Template

Generate a handoff with EXACTLY these sections. Be specific — include file paths, function names,
and concrete details. Do not summarize vaguely.

```markdown
# Session Handoff

## Project Context
- One-paragraph description of what this project is and the current goal.

## What Was Done
- Bullet list of completed work with specific file paths and changes made.
- Include any commands run, configs changed, dependencies added.

## Decisions Locked
- Decisions made with rationale (e.g., "Chose PostgreSQL over SQLite because X").
- Architecture choices committed to.
- Patterns/conventions agreed upon.

## Key Files
- List of the most important files for the next session with one-line descriptions.
- Mark which files need to be read first.

## Running State
- Current state of the codebase (does it build? do tests pass? any errors?).
- Any running processes, servers, or pending operations.

## Verification
- How to verify the current state works (build commands, test commands, manual checks).

## Deferred / TODO
- Items intentionally postponed with reasons.
- Technical debt acknowledged.

## Open Questions
- Unresolved decisions that need user input.
- Risks or unknowns identified.

## Pick Up From Here
- The EXACT next task to work on.
- Any specific instructions or constraints for that task.
```

## Process

### Phase 1: Analyze Session

Review the entire conversation:
- What was the original goal?
- What approaches were tried? Which succeeded? Which failed?
- What files were created, modified, or deleted?
- What decisions were made and why?
- What is the current state of the work?
- What was about to happen next?

### Phase 2: Extract Key Information

- **Decisions:** Any choice that affects future work (architecture, patterns, libraries, naming).
- **Files:** Every file that matters for continuing the work. Prioritize by importance.
- **State:** Does it compile? Do tests pass? Are there runtime errors? Is something half-done?
- **Context:** What does the next session NEED to know that isn't obvious from the code?

### Phase 3: Generate Handoff

Write the handoff using the template. Rules:
- **Be specific.** Use full file paths, function names, exact error messages.
- **Be concise.** Each bullet should be one line. No paragraphs.
- **Include the "why".** Decisions should have rationale, not just the choice.
- **Flag unknowns.** If something is uncertain, put it in Open Questions.
- **Give clear next steps.** The "Pick Up From Here" section should be immediately actionable.

### Phase 4: Deliver

Present the handoff to the user with instructions:

> Copy the handoff above. Run `/clear`. Paste the handoff as your first message. The new session
> will pick up right where this one left off — with full model intelligence restored.

## NEVER

- **NEVER produce a vague summary.**
  **Instead:** Include specific file paths, function names, and error messages.
  **Why:** The next session has NO other context — vague summaries lose critical details.

- **NEVER skip the "Pick Up From Here" section.**
  **Instead:** Always specify the exact next task with actionable instructions.
  **Why:** Without a clear starting point, the new session wastes tokens figuring out what to do.

- **NEVER forget to mention broken states.**
  **Instead:** If something doesn't compile or tests fail, say so explicitly in Running State.
  **Why:** The new session will waste tokens discovering problems you already know about.

- **NEVER use this as a substitute for storing data in files.**
  **Instead:** Encourage the user to maintain tracker sheets, decision logs, and task lists in files.
  **Why:** File-based state survives across sessions; conversation-based state does not.

## Tips for the User

- Store progress in files (task lists, decision logs, activity logs) so even if a session is lost,
  the state persists.
- The handoff is like closing all your Chrome tabs but keeping your bookmarks — you reset, but you
  can get back to everything quickly.
- For very large projects, chain sessions: Discovery → Planning → Execution. Hand off between each.
