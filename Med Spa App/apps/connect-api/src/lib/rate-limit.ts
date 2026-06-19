import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Global per-key request limiter (100 req/min). Identifier must be the hashed
// API key — never pass a raw secret here.
const redis = getRedis();
const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), analytics: true })
  : null;

// Per-clinic daily SMS volume cap. Stops a single clinic key from texting
// arbitrary numbers at scale (SMS-pumping / toll fraud). Defaults to 50/day,
// override with SMS_DAILY_LIMIT_PER_CLINIC.
const SMS_DAILY_LIMIT = Number(process.env.SMS_DAILY_LIMIT_PER_CLINIC) || 50;
const smsDailyLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(SMS_DAILY_LIMIT, '24 h'),
      prefix: 'sms.daily',
      analytics: true,
    })
  : null;

function failClosed(limit: number) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Rate limiter not configured — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production'
    );
  }
  return { success: true, limit, remaining: limit };
}

// identifier should already be a hashed key (never pass raw secrets to this function)
export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (!ratelimit) return failClosed(100);
  return ratelimit.limit(identifier);
}

/**
 * Per-clinic daily SMS cap. Pass the clinic id (derived from the authenticated
 * key, never the request body). Fails closed in production when Upstash is not
 * configured (same posture as checkRateLimit).
 */
export async function checkSmsDailyLimit(
  clinicId: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (!smsDailyLimit) return failClosed(SMS_DAILY_LIMIT);
  return smsDailyLimit.limit(clinicId);
}
