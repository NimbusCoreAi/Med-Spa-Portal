import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  });
}

const ratelimit = createRateLimiter();

// identifier should already be a hashed key (never pass raw secrets to this function)
export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (!ratelimit) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Rate limiter not configured — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production'
      );
    }
    return { success: true, limit: 100, remaining: 100 };
  }
  return ratelimit.limit(identifier);
}
