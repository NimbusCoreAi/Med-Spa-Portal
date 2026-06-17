import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import type { MarkdownConversionResult } from "../types.js";
import { estimateTokens } from "./token-estimate.js";

function stripHtml(html: string): string {
  let text = html;

  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, "");

  text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) => {
    const prefix = "#".repeat(parseInt(level));
    return `\n${prefix} ${content.trim()}\n`;
  });

  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");

  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n");

  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<hr\s*\/?>/gi, "\n---\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");

  text = text.replace(/<[^>]+>/g, "");

  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&[a-z]+;/gi, "");

  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

function extractPdfText(buffer: Buffer): string {
  const text = buffer.toString("latin1");
  const streams: string[] = [];

  const btRegex = /\(((?:[^()\\]|\\.|(?:\([^()]*\)))*)\)\s*Tj/gi;
  let match;
  while ((match = btRegex.exec(text)) !== null) {
    streams.push(match[1]);
  }

  const tjRegex = /\[((?:[^\]\\]|\\.)*)\]\s*TJ/gi;
  while ((match = tjRegex.exec(text)) !== null) {
    const inner = match[1];
    const strings = inner.match(/\(([^)]*)\)/g);
    if (strings) {
      streams.push(strings.map((s) => s.slice(1, -1)).join(""));
    }
  }

  let result = streams.join("\n");

  result = result.replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\");

  if (!result.trim()) {
    result = text
      .replace(/stream\r?\n[\s\S]*?endstream/g, "")
      .replace(/[\x00-\x08\x0e-\x1f]/g, "")
      .replace(/[^\x20-\x7e\n\r]/g, " ")
      .replace(/ {3,}/g, "  ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return result;
}

export async function convertToMarkdown(
  filePath: string
): Promise<MarkdownConversionResult> {
  const ext = extname(filePath).toLowerCase();
  const original_chars_init = 0;

  try {
    const buffer = await readFile(filePath);
    const original_chars = buffer.length;
    let markdown = "";
    let success = true;
    let error: string | null = null;

    switch (ext) {
      case ".html":
      case ".htm": {
        const html = buffer.toString("utf-8");
        markdown = stripHtml(html);
        break;
      }

      case ".pdf": {
        markdown = extractPdfText(buffer);
        if (!markdown.trim()) {
          success = false;
          error =
            "No extractable text found. PDF may contain scanned images — use OCR tool for image-based PDFs.";
        }
        break;
      }

      case ".txt":
      case ".md":
      case ".markdown": {
        markdown = buffer.toString("utf-8");
        break;
      }

      case ".docx":
      case ".doc": {
        success = false;
        error =
          "Binary DOCX/DOC not directly supported by this tool. Install a converter (e.g., 'pandoc') or save as .txt/.md first. Expected ~33% token reduction.";
        markdown = "";
        break;
      }

      default: {
        markdown = buffer.toString("utf-8");
        break;
      }
    }

    const markdown_chars = markdown.length;
    const reduction_percentage =
      original_chars > 0 && markdown_chars > 0
        ? parseFloat(
            (((original_chars - markdown_chars) / original_chars) * 100).toFixed(1)
          )
        : 0;

    return {
      file_path: filePath,
      original_format: ext,
      success,
      markdown: success ? markdown.slice(0, 50000) : "",
      original_chars: original_chars || original_chars_init,
      markdown_chars,
      reduction_percentage: reduction_percentage > 0 ? reduction_percentage : 0,
      error,
    };
  } catch (err) {
    return {
      file_path: filePath,
      original_format: ext,
      success: false,
      markdown: "",
      original_chars: 0,
      markdown_chars: 0,
      reduction_percentage: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
