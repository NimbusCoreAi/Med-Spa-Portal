import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { analyzeText } from "./tools/token-estimate.js";
import { getSessionReport } from "./tools/session-report.js";
import { auditContextFiles } from "./tools/claude-md-audit.js";
import { compressOutput } from "./tools/compress-output.js";
import { convertToMarkdown } from "./tools/file-to-markdown.js";
import { CHARACTER_LIMIT } from "./constants.js";

const server = new McpServer({
  name: "token-guard-mcp-server",
  version: "1.0.0",
});

// ─── Tool: token_estimate ──────────────────────────────────────────────────

server.registerTool(
  "token_estimate",
  {
    title: "Estimate Token Count",
    description:
      "Estimate the token count of text or a file. Returns token count, word count, line count, " +
      "percentage of context window consumed, and the cost multiplier at conversation depth. " +
      "Use to understand how expensive a prompt, file, or message will be before sending it.",
    inputSchema: {
      text: z.string().optional().describe("Text to estimate tokens for"),
      file_path: z.string().optional().describe("Path to a file to estimate tokens for"),
    },
    outputSchema: {
      result: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ text, file_path }) => {
    let content = text || "";

    if (file_path) {
      const { readFile } = await import("node:fs/promises");
      content = await readFile(file_path, "utf-8");
    }

    if (!content) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Provide either 'text' or 'file_path'.",
          },
        ],
      };
    }

    const analysis = analyzeText(content);

    const output = {
      ...analysis,
      note:
        analysis.estimated_tokens > 10000
          ? "WARNING: This is a large token count. Consider converting to markdown, compressing, or splitting."
          : "Token count is within reasonable range.",
      context_depth_warning:
        analysis.cost_multiplier_at_depth > 20
          ? `At message depth ~10, this content costs ${analysis.cost_multiplier_at_depth}x more than your first message due to conversation re-reading.`
          : null,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

// ─── Tool: session_report ──────────────────────────────────────────────────

server.registerTool(
  "session_report",
  {
    title: "Session Token Report",
    description:
      "Read Claude Code session JSONL files from disk and return detailed token usage statistics " +
      "including input/output tokens, cache reads, cache creation, cache hit rate, turn counts, " +
      "and models used. Use to understand where tokens are going and monitor cache health. " +
      "Scans ~/.claude/projects/ for the specified project path.",
    inputSchema: {
      project_path: z
        .string()
        .describe("Absolute path to the project to report on (e.g., /home/user/myproject)"),
    },
    outputSchema: {
      result: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project_path }) => {
    const { sessions, summary } = await getSessionReport(project_path);

    const report = {
      summary,
      cache_health:
        (summary.average_cache_hit_rate as number) > 70
          ? "HEALTHY"
          : (summary.average_cache_hit_rate as number) > 40
            ? "MODERATE"
            : "POOR",
      cache_health_note:
        (summary.average_cache_hit_rate as number) < 40
          ? "WARNING: Low cache hit rate. You may be resetting sessions too frequently, switching models, or waiting too long between messages."
          : "Cache hit rate is acceptable.",
      recent_sessions: sessions.slice(0, 10).map((s) => ({
        session_id: s.session_id.slice(0, 12) + "...",
        effective_tokens: s.effective_tokens,
        cache_hit_rate: s.cache_hit_rate,
        turn_count: s.turn_count,
        last_activity: s.last_activity,
      })),
      session_count: sessions.length,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(report, null, 2) }],
      structuredContent: report,
    };
  }
);

// ─── Tool: audit_context_files ─────────────────────────────────────────────

server.registerTool(
  "audit_context_files",
  {
    title: "Audit Context Files",
    description:
      "Scan a project for CLAUDE.md, .cursorrules, AGENTS.md, .claude/agents/, and nested context " +
      "files. Reports token cost of each file, identifies bloat, checks for .claudeignore, and " +
      "provides optimization recommendations. Use to reduce startup token overhead.",
    inputSchema: {
      project_path: z
        .string()
        .describe("Absolute path to the project root to audit"),
    },
    outputSchema: {
      result: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ project_path }) => {
    const report = await auditContextFiles(project_path);

    return {
      content: [{ type: "text" as const, text: JSON.stringify(report, null, 2) }],
      structuredContent: report,
    };
  }
);

// ─── Tool: compress_log_output ─────────────────────────────────────────────

server.registerTool(
  "compress_log_output",
  {
    title: "Compress Log/CLI Output",
    description:
      "Compress noisy terminal output, server logs, or CLI output before it enters the context " +
      "window. Removes redundant lines, compresses timestamps, strips blank lines, and optionally " +
      "aggressively removes debug/trace output. Returns compressed text with reduction stats. " +
      "Use before pasting log output into Claude to save tokens.",
    inputSchema: {
      text: z.string().describe("The log/CLI output text to compress"),
      aggressive: z
        .boolean()
        .optional()
        .default(false)
        .describe("Enable aggressive mode: strip DEBUG/TRACE lines, tree-drawing chars, short lines"),
    },
    outputSchema: {
      result: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ text, aggressive }) => {
    const result = compressOutput(text, { aggressive });

    const truncatedOutput = result.compressed_output.slice(0, CHARACTER_LIMIT);
    const wasTruncated = result.compressed_output.length > CHARACTER_LIMIT;

    const output = {
      original_estimated_tokens: result.original_estimated_tokens,
      compressed_estimated_tokens: result.compressed_estimated_tokens,
      reduction_percentage: result.reduction_percentage,
      lines_omitted: result.lines_omitted,
      compressed_output: truncatedOutput,
      truncated: wasTruncated,
      truncation_note: wasTruncated
        ? `Output truncated to ${CHARACTER_LIMIT} chars. Original compressed length: ${result.compressed_chars}`
        : null,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

// ─── Tool: convert_to_markdown ─────────────────────────────────────────────

server.registerTool(
  "convert_to_markdown",
  {
    title: "Convert File to Markdown",
    description:
      "Convert HTML, PDF, or text files to markdown to dramatically reduce token consumption. " +
      "HTML→Markdown saves ~90% tokens, PDF→Markdown saves ~65-70%, DOCX→Markdown saves ~33%. " +
      "Strips layout, metadata, and formatting noise — the model only needs the text content. " +
      "Use before loading documents into Claude.",
    inputSchema: {
      file_path: z.string().describe("Path to the file to convert"),
    },
    outputSchema: {
      result: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ file_path }) => {
    const result = await convertToMarkdown(file_path);

    const truncatedMarkdown = result.markdown.slice(0, CHARACTER_LIMIT);
    const wasTruncated = result.markdown.length > CHARACTER_LIMIT;

    const output = {
      file_path: result.file_path,
      original_format: result.original_format,
      success: result.success,
      original_chars: result.original_chars,
      markdown_chars: result.markdown_chars,
      reduction_percentage: result.reduction_percentage,
      error: result.error,
      markdown: truncatedMarkdown,
      truncated: wasTruncated,
      truncation_note: wasTruncated
        ? `Markdown truncated to ${CHARACTER_LIMIT} chars. Full length: ${result.markdown_chars}`
        : null,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

// ─── Start Server ──────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Token Guard MCP Server failed to start:", err);
  process.exit(1);
});
