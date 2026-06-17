import { TOKEN_RATIO } from "../constants.js";
import type { TokenEstimate } from "../types.js";

const CONTEXT_WINDOW_SIZE = 1_000_000;

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const charEstimate = Math.ceil(text.length / TOKEN_RATIO.CHARS_PER_TOKEN);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const wordEstimate = Math.ceil(wordCount / TOKEN_RATIO.WORDS_PER_TOKEN);
  return Math.max(charEstimate, wordEstimate);
}

export function analyzeText(text: string): TokenEstimate {
  const text_length = text.length;
  const word_count = text.trim().split(/\s+/).filter(Boolean).length;
  const line_count = text.split("\n").length;
  const estimated_tokens = estimateTokens(text);
  const context_window_percentage = parseFloat(
    ((estimated_tokens / CONTEXT_WINDOW_SIZE) * 100).toFixed(2)
  );

  const cost_multiplier_at_depth = parseFloat(
    (estimated_tokens / 500).toFixed(1)
  );

  return {
    text_length,
    word_count,
    line_count,
    estimated_tokens,
    context_window_percentage,
    cost_multiplier_at_depth,
  };
}

export function estimateFileTokens(content: string): number {
  return estimateTokens(content);
}
