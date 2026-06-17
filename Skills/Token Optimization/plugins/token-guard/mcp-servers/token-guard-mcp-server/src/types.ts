export interface TokenEstimate {
  text_length: number;
  word_count: number;
  line_count: number;
  estimated_tokens: number;
  context_window_percentage: number;
  cost_multiplier_at_depth: number;
}

export interface SessionTokenUsage {
  session_id: string;
  project_path: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
  total_tokens: number;
  effective_tokens: number;
  cache_hit_rate: number;
  turn_count: number;
  models_used: string[];
  first_activity: string | null;
  last_activity: string | null;
}

export interface ContextFileAudit {
  file_path: string;
  exists: boolean;
  line_count: number;
  char_count: number;
  estimated_tokens: number;
  classification: "essential" | "warning" | "critical";
  content_preview: string;
}

export interface ContextAuditReport {
  project_path: string;
  total_files: number;
  total_lines: number;
  total_estimated_tokens: number;
  context_window_percentage: number;
  has_claudeignore: boolean;
  files: ContextFileAudit[];
  recommendations: string[];
}

export interface CompressionResult {
  original_chars: number;
  compressed_chars: number;
  original_estimated_tokens: number;
  compressed_estimated_tokens: number;
  reduction_percentage: number;
  lines_omitted: number;
  compressed_output: string;
}

export interface MarkdownConversionResult {
  file_path: string;
  original_format: string;
  success: boolean;
  markdown: string;
  original_chars: number;
  markdown_chars: number;
  reduction_percentage: number;
  error: string | null;
}
