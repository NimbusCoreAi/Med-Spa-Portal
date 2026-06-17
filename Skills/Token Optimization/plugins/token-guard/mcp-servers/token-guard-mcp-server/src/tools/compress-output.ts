import { COMPRESSION_RULES } from "../constants.js";
import type { CompressionResult } from "../types.js";
import { estimateTokens } from "./token-estimate.js";

export function compressOutput(
  text: string,
  options?: { aggressive?: boolean }
): CompressionResult {
  const original_chars = text.length;
  const original_estimated_tokens = estimateTokens(text);

  let lines_omitted = 0;
  let compressed = text;

  for (const rule of COMPRESSION_RULES) {
    if (rule.label === "repeated log lines") {
      const before = compressed.split("\n").length;
      compressed = compressed.replace(rule.pattern, rule.replacement);
      const after = compressed.split("\n").length;
      lines_omitted += Math.max(0, before - after);
    } else {
      compressed = compressed.replace(rule.pattern, rule.replacement);
    }
  }

  if (options?.aggressive) {
    compressed = compressed.replace(/^(DEBUG|TRACE|VERBOSE)[^\n]*\n/gim, "");
    compressed = compressed.replace(/^([ \t]*[├└│─┌┐┘└┤├┬┴┼─│][^\n]*)\n/gim, "");
    compressed = compressed.replace(/^.{0,5}$\n/gm, "");
    compressed = compressed.replace(/(\n){4,}/g, "\n\n\n");
  }

  compressed = compressed.replace(/(\n){3,}/g, "\n\n").trim();

  const compressed_chars = compressed.length;
  const compressed_estimated_tokens = estimateTokens(compressed);
  const reduction_percentage =
    original_chars > 0
      ? parseFloat(
          (((original_chars - compressed_chars) / original_chars) * 100).toFixed(1)
        )
      : 0;

  return {
    original_chars,
    compressed_chars,
    original_estimated_tokens,
    compressed_estimated_tokens,
    reduction_percentage,
    lines_omitted,
    compressed_output: compressed,
  };
}
