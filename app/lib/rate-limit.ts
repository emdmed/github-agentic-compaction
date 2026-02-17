const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 50;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    return { allowed: true, remaining: MAX_REQUESTS, resetTime: now + WINDOW_MS };
  }

  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return { allowed: remaining > 0, remaining, resetTime: entry.resetTime };
}

export function incrementRateLimit(ip: string): void {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}
