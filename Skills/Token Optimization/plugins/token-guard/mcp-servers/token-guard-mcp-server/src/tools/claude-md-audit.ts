import { readFile, stat, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  CONTEXT_FILE_NAMES,
  CONTEXT_THRESHOLDS,
  IGNORE_DIRS,
} from "../constants.js";
import type { ContextAuditReport, ContextFileAudit } from "../types.js";
import { estimateTokens } from "./token-estimate.js";

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function findNestedClaudeMds(
  rootPath: string,
  maxDepth = 3
): Promise<string[]> {
  const results: string[] = [];

  async function scan(dir: string, depth: number) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORE_DIRS.includes(entry.name as typeof IGNORE_DIRS[number])) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath, depth + 1);
      } else if (
        (entry.name === "CLAUDE.md" || entry.name === "claude.md") &&
        fullPath !== join(rootPath, "CLAUDE.md") &&
        fullPath !== join(rootPath, "claude.md")
      ) {
        results.push(fullPath);
      }
    }
  }

  await scan(rootPath, 0);
  return results;
}

async function auditFile(
  filePath: string,
  projectRoot: string,
  isRoot: boolean
): Promise<ContextFileAudit> {
  const exists = await fileExists(filePath);
  if (!exists) {
    return {
      file_path: relative(projectRoot, filePath) || filePath,
      exists: false,
      line_count: 0,
      char_count: 0,
      estimated_tokens: 0,
      classification: "essential",
      content_preview: "",
    };
  }

  const content = await readFile(filePath, "utf-8");
  const line_count = content.split("\n").length;
  const char_count = content.length;
  const estimated_tokens = estimateTokens(content);

  let classification: ContextFileAudit["classification"] = "essential";
  if (isRoot) {
    if (line_count > CONTEXT_THRESHOLDS.ROOT_CLAUDE_MD_LINES.warning) {
      classification = "critical";
    } else if (line_count > CONTEXT_THRESHOLDS.ROOT_CLAUDE_MD_LINES.ok) {
      classification = "warning";
    }
  } else {
    if (estimated_tokens > 1000) classification = "warning";
    if (estimated_tokens > 2000) classification = "critical";
  }

  const content_preview = content.slice(0, 200) + (content.length > 200 ? "..." : "");

  return {
    file_path: relative(projectRoot, filePath) || filePath,
    exists: true,
    line_count,
    char_count,
    estimated_tokens,
    classification,
    content_preview,
  };
}

export async function auditContextFiles(
  projectPath: string
): Promise<ContextAuditReport> {
  const files: ContextFileAudit[] = [];

  for (const name of CONTEXT_FILE_NAMES) {
    const fullPath = join(projectPath, name);
    const isRoot = name === "CLAUDE.md" || name === "claude.md";
    const audit = await auditFile(fullPath, projectPath, isRoot);
    if (audit.exists) files.push(audit);
  }

  const nestedMds = await findNestedClaudeMds(projectPath);
  for (const nested of nestedMds) {
    const audit = await auditFile(nested, projectPath, false);
    if (audit.exists) files.push(audit);
  }

  const agentsDir = join(projectPath, ".claude", "agents");
  if (await fileExists(agentsDir)) {
    try {
      const agentFiles = await readdir(agentsDir);
      for (const file of agentFiles) {
        if (file.endsWith(".md")) {
          const audit = await auditFile(join(agentsDir, file), projectPath, false);
          if (audit.exists) files.push(audit);
        }
      }
    } catch {
      // ignore
    }
  }

  const hasClaudeignore = await fileExists(join(projectPath, ".claudeignore"));

  const total_lines = files.reduce((s, f) => s + f.line_count, 0);
  const total_estimated_tokens = files.reduce((s, f) => s + f.estimated_tokens, 0);
  const context_window_percentage = parseFloat(
    ((total_estimated_tokens / 1_000_000) * 100).toFixed(2)
  );

  const recommendations: string[] = [];

  const rootClaude = files.find(
    (f) => f.file_path === "CLAUDE.md" || f.file_path === "claude.md"
  );
  if (rootClaude && rootClaude.line_count > CONTEXT_THRESHOLDS.ROOT_CLAUDE_MD_LINES.warning) {
    recommendations.push(
      `Root CLAUDE.md is ${rootClaude.line_count} lines (target: <200). Move non-essential content to routed context files or skills. Estimated savings: ~${rootClaude.estimated_tokens - 2000} tokens/session.`
    );
  }

  if (!hasClaudeignore) {
    recommendations.push(
      "No .claudeignore file found. Create one to exclude node_modules/, dist/, build/, and other large directories from context scanning."
    );
  }

  const criticalFiles = files.filter((f) => f.classification === "critical");
  for (const f of criticalFiles) {
    if (f.file_path !== "CLAUDE.md" && f.file_path !== "claude.md") {
      recommendations.push(
        `${f.file_path} is large (${f.estimated_tokens} tokens). Consider condensing or splitting into on-demand context files.`
      );
    }
  }

  if (total_estimated_tokens > CONTEXT_THRESHOLDS.TOTAL_STARTUP_TOKENS.warning) {
    recommendations.push(
      `Total startup token overhead is ${total_estimated_tokens} tokens (${context_window_percentage}% of 1M window). Target: <8,000. Audit which files load every session vs. on-demand.`
    );
  }

  if (nestedMds.length > CONTEXT_THRESHOLDS.NESTED_CLAUDE_MD_COUNT.warning) {
    recommendations.push(
      `Found ${nestedMds.length} nested CLAUDE.md files. Consider consolidating or converting some to routed context files.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Context files look healthy. No major optimizations needed."
    );
  }

  return {
    project_path: projectPath,
    total_files: files.length,
    total_lines,
    total_estimated_tokens,
    context_window_percentage,
    has_claudeignore: hasClaudeignore,
    files,
    recommendations,
  };
}
