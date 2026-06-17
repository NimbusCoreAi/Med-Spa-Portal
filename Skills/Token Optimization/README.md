# Token Optimization

Skills and an MCP server for reducing token usage and managing context windows in Claude Code and Claude.ai.

Built from the [Token Saving Guide](../../Token%20Saving/Token%20Saving.md).

---

## What's Included

### Skills (Behavioral Guidelines)

| Skill | Purpose |
|-------|---------|
| **token-guard** | Master skill — enforces token-saving habits across every session (cache preservation, session management, prompting habits, model selection, file handling) |
| **session-handoff** | Generates structured handoff summaries for clean context resets — replaces `/compact` with higher-fidelity output |
| **claude-md-audit** | Scans CLAUDE.md and context files for token bloat, identifies oversized files, recommends offloading to routed context files |

### MCP Server (Executable Tools)

**`token-guard-mcp-server`** — A TypeScript MCP server with 5 tools:

| Tool | Purpose |
|------|---------|
| `token_estimate` | Estimate token count of text/files with cost-depth multiplier warning |
| `session_report` | Parse Claude Code session JSONL files and report token usage, cache hit rate, model usage |
| `audit_context_files` | Scan project for CLAUDE.md and context files, report token costs and optimization recommendations |
| `compress_log_output` | Compress noisy terminal/log output before it enters context (up to 60%+ reduction) |
| `convert_to_markdown` | Convert HTML/PDF/text to markdown for 33–90% token reduction |

---

## Installation

### Option A: Install as Claude Code Plugin

1. Add this directory to your Claude Code plugin marketplace.
2. The skills auto-activate based on context (no manual invocation needed for most cases).

### Option B: Install the MCP Server Only

```bash
cd Skills/Token\ Optimization/plugins/token-guard/mcp-servers/token-guard-mcp-server
npm install
npm run build
```

Then register it in your project's `.mcp.json` or Claude Code settings:

```json
{
  "mcpServers": {
    "token-guard": {
      "command": "node",
      "args": ["<absolute-path-to>/token-guard-mcp-server/dist/index.js"]
    }
  }
}
```

Or add it globally in `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "token-guard": {
      "command": "node",
      "args": ["<absolute-path-to>/token-guard-mcp-server/dist/index.js"]
    }
  }
}
```

---

## Usage

### Skills

Skills activate automatically when Claude detects relevant context. You can also trigger them explicitly:

- **"Audit my CLAUDE.md"** → activates `claude-md-audit`
- **"Give me a session handoff"** → activates `session-handoff`
- **"Why am I burning so many tokens?"** → activates `token-guard`

### MCP Tools

Once the server is registered, Claude can call these tools automatically:

- **"How many tokens is this file?"** → calls `token_estimate`
- **"Show me my token usage report"** → calls `session_report`
- **"Compress these logs"** → calls `compress_log_output`
- **"Convert this PDF to markdown"** → calls `convert_to_markdown`
- **"Audit my context files"** → calls `audit_context_files`

---

## Key Token-Saving Principles Enforced

1. **Think in tokens, not messages** — every message rereads the entire conversation
2. **Edit, don't follow up** — correct mistakes by editing the original message, not appending
3. **Reset at ~120K tokens** — don't wait for auto-compaction at 95%
4. **Don't switch models mid-session** — it breaks the cache (full re-read)
5. **Keep CLAUDE.md under 200 lines** — it loads every session
6. **Convert files to markdown** — 33–90% token reduction
7. **Batch questions** — one message with three tasks beats three separate messages
8. **Use plan mode first** — spending tokens upfront prevents costly corrections
9. **Use cheaper models for simple tasks** — Haiku for drafts saves 50–70% budget
10. **Delegate to sub-agents** — fresh context windows keep main session clean

---

## Project Structure

```
Token Optimization/
├── .claude-plugin/
│   └── marketplace.json              # Plugin marketplace listing
├── plugins/
│   └── token-guard/
│       ├── .claude-plugin/
│       │   └── plugin.json           # Plugin metadata
│       ├── skills/
│       │   ├── token-guard/
│       │   │   └── SKILL.md          # Master behavioral skill
│       │   ├── session-handoff/
│       │   │   └── SKILL.md          # Session handoff skill
│       │   └── claude-md-audit/
│       │       └── SKILL.md          # Context file audit skill
│       └── mcp-servers/
│           └── token-guard-mcp-server/
│               ├── package.json
│               ├── tsconfig.json
│               └── src/
│                   ├── index.ts      # Server entry point + tool registration
│                   ├── types.ts      # TypeScript interfaces
│                   ├── constants.ts  # Thresholds, patterns, config
│                   └── tools/
│                       ├── token-estimate.ts
│                       ├── session-report.ts
│                       ├── claude-md-audit.ts
│                       ├── compress-output.ts
│                       └── file-to-markdown.ts
└── README.md
```

---

## MCP Server Development

```bash
# Install dependencies
npm install

# Run in dev mode (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Requirements

- Node.js >= 18
- Claude Code or Claude Desktop (for MCP integration)

## License

MIT
