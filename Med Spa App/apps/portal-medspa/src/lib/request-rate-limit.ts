// Simple in-process per-IP rate limiter for signup and public endpoints.
// For multi-instance production deployments, replace with Upstash Redis.
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const CLEANUP_THRESHOLD = 10_000;
let accessCounter = 0;

export function checkRateLimit(ip: string, maxPerWindow: number): boolean {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || entry.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    if (entry.count >= maxPerWindow) return false;
    entry.count++;
  }

  // Evict stale entries periodically to prevent unbounded Map growth
  if (++accessCounter >= CLEANUP_THRESHOLD) {
    accessCounter = 0;
    for (const [key, val] of buckets) {
      if (val.resetAt < now) buckets.delete(key);
    }
  }

  return true;
}
