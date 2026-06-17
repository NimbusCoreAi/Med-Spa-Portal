import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir, platform } from "node:os";
import type { SessionTokenUsage } from "../types.js";

interface SessionEntry {
  type?: string;
  message?: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
    model?: string;
  };
  timestamp?: string;
  sessionId?: string;
  cwd?: string;
}

function getClaudeProjectsDir(): string {
  const home = homedir();
  return join(home, ".claude", "projects");
}

async function findProjectSessions(projectPath: string): Promise<string[]> {
  const projectsDir = getClaudeProjectsDir();
  try {
    await stat(projectsDir);
  } catch {
    return [];
  }

  const normalizedProject = projectPath.replace(/\\/g, "-").replace(/[:/]/g, "-").replace(/^-+|-+$/g, "");
  const entries = await readdir(projectsDir, { withFileTypes: true });

  const sessionFiles: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name.replace(/-/g, "");
    const targetName = normalizedProject.replace(/-/g, "");

    if (dirName === targetName || entry.name.includes(normalizedProject) || normalizedProject.includes(entry.name.replace(/-/g, ""))) {
      const dirPath = join(projectsDir, entry.name);
      const files = await readdir(dirPath);
      for (const file of files) {
        if (file.endsWith(".jsonl")) {
          sessionFiles.push(join(dirPath, file));
        }
      }
    }
  }

  if (sessionFiles.length === 0) {
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dirPath = join(projectsDir, entry.name);
      const files = await readdir(dirPath);
      for (const file of files) {
        if (file.endsWith(".jsonl")) {
          sessionFiles.push(join(dirPath, file));
        }
      }
    }
  }

  return sessionFiles;
}

async function parseSessionFile(filePath: string): Promise<SessionTokenUsage | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return null;

    const entries: SessionEntry[] = [];
    for (const line of lines) {
      try {
        entries.push(JSON.parse(line));
      } catch {
        continue;
      }
    }

    let total_input_tokens = 0;
    let total_output_tokens = 0;
    let total_cache_creation_tokens = 0;
    let total_cache_read_tokens = 0;
    let turn_count = 0;
    const models_used = new Set<string>();
    const timestamps: string[] = [];

    for (const entry of entries) {
      if (entry.type === "assistant" && entry.message?.usage) {
        const u = entry.message.usage;
        total_input_tokens += u.input_tokens || 0;
        total_output_tokens += u.output_tokens || 0;
        total_cache_creation_tokens += u.cache_creation_input_tokens || 0;
        total_cache_read_tokens += u.cache_read_input_tokens || 0;
        turn_count++;
        if (entry.message.model) {
          models_used.add(entry.message.model);
        }
      }
      if (entry.timestamp) {
        timestamps.push(entry.timestamp);
      }
    }

    const total_tokens =
      total_input_tokens +
      total_output_tokens +
      total_cache_creation_tokens +
      total_cache_read_tokens;

    const effective_tokens =
      total_input_tokens +
      total_output_tokens +
      total_cache_creation_tokens +
      Math.ceil(total_cache_read_tokens * 0.1);

    const total_cacheable = total_cache_creation_tokens + total_cache_read_tokens;
    const cache_hit_rate =
      total_cacheable > 0
        ? parseFloat(((total_cache_read_tokens / total_cacheable) * 100).toFixed(1))
        : 0;

    const sessionId = filePath.split(/[\\/]/).pop()?.replace(".jsonl", "") || filePath;

    const cwd = entries.find((e) => e.cwd)?.cwd || "";

    return {
      session_id: sessionId,
      project_path: cwd,
      total_input_tokens,
      total_output_tokens,
      total_cache_creation_tokens,
      total_cache_read_tokens,
      total_tokens,
      effective_tokens,
      cache_hit_rate,
      turn_count,
      models_used: Array.from(models_used),
      first_activity: timestamps.length > 0 ? timestamps[0] : null,
      last_activity: timestamps.length > 0 ? timestamps[timestamps.length - 1] : null,
    };
  } catch {
    return null;
  }
}

export async function getSessionReport(
  projectPath: string
): Promise<{ sessions: SessionTokenUsage[]; summary: Record<string, unknown> }> {
  const sessionFiles = await findProjectSessions(projectPath);
  const sessions: SessionTokenUsage[] = [];

  for (const file of sessionFiles) {
    const parsed = await parseSessionFile(file);
    if (parsed) sessions.push(parsed);
  }

  sessions.sort((a, b) => {
    const aTime = a.last_activity ? new Date(a.last_activity).getTime() : 0;
    const bTime = b.last_activity ? new Date(b.last_activity).getTime() : 0;
    return bTime - aTime;
  });

  const summary = {
    total_sessions: sessions.length,
    total_input_tokens: sessions.reduce((s, x) => s + x.total_input_tokens, 0),
    total_output_tokens: sessions.reduce((s, x) => s + x.total_output_tokens, 0),
    total_cache_read_tokens: sessions.reduce((s, x) => s + x.total_cache_read_tokens, 0),
    total_cache_creation_tokens: sessions.reduce((s, x) => s + x.total_cache_creation_tokens, 0),
    average_cache_hit_rate:
      sessions.length > 0
        ? parseFloat(
            (sessions.reduce((s, x) => s + x.cache_hit_rate, 0) / sessions.length).toFixed(1)
          )
        : 0,
    total_effective_tokens: sessions.reduce((s, x) => s + x.effective_tokens, 0),
    all_models_used: Array.from(new Set(sessions.flatMap((s) => s.models_used))),
  };

  return { sessions, summary };
}
