export const CHARACTER_LIMIT = 25000;

export const CONTEXT_THRESHOLDS = {
  ROOT_CLAUDE_MD_LINES: { ok: 100, warning: 200 },
  ROOT_CLAUDE_MD_TOKENS: { ok: 1000, warning: 2000 },
  TOTAL_STARTUP_TOKENS: { ok: 8000, warning: 20000 },
  NESTED_CLAUDE_MD_COUNT: { ok: 5, warning: 10 },
  MCP_TOOLS_COUNT: { ok: 10, warning: 20 },
} as const;

export const CONTEXT_FILE_NAMES = [
  "CLAUDE.md",
  "claude.md",
  ".cursorrules",
  "AGENTS.md",
  ".claude/instructions.md",
] as const;

export const CONTEXT_FILE_GLOBS = [
  "**/CLAUDE.md",
  "**/.claude/agents/*.md",
  "**/.claude/skills/*/SKILL.md",
  "**/.mcp.json",
] as const;

export const IGNORE_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".next",
  ".git",
  ".turbo",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
] as const;

export const TOKEN_RATIO = {
  CHARS_PER_TOKEN: 4,
  WORDS_PER_TOKEN: 0.75,
} as const;

export const COMPRESSION_RULES = [
  { pattern: /\[\d+:\d+:\d+\]/g, replacement: "[time]", label: "timestamps" },
  { pattern: /\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, replacement: "[date]", label: "ISO dates" },
  {
    pattern: /([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)([^\n]*\n)+/g,
    replacement: "$1$2$3$4$5\n... [N lines omitted] ...\n",
    label: "repeated log lines",
  },
  { pattern: /^\s*$/gm, replacement: "", label: "blank lines" },
  { pattern: /\t+/g, replacement: "  ", label: "tabs to spaces" },
] as const;

export const FILE_CONVERSION_NOTES: Record<string, string> = {
  ".html": "~90% token reduction when converted to markdown",
  ".htm": "~90% token reduction when converted to markdown",
  ".pdf": "~65-70% token reduction when converted to markdown",
  ".docx": "~33% token reduction when converted to markdown",
  ".doc": "~33% token reduction when converted to markdown",
};
