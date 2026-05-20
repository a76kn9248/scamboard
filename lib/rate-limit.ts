type RateLimitEntry = {
  timestamp: number;
  count: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.timestamp > 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

export function checkRateLimit(
  userId: string,
  action: string,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.timestamp > windowMs) {
    rateLimitStore.set(key, { timestamp: now, count: 1 });
    return { allowed: true };
  }

  const timeRemaining = windowMs - (now - entry.timestamp);
  return {
    allowed: false,
    retryAfter: Math.ceil(timeRemaining / 1000),
  };
}
