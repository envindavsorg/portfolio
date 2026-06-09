interface RateLimitOptions {
  /** Nombre maximum d'appels autorisés dans la fenêtre. */
  limit: number;
  /** Durée de la fenêtre en millisecondes. */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

// Limiteur en mémoire : l'état est local à chaque instance serveur,
// suffisant pour freiner l'abus des actions publiques d'un portfolio.
const MAX_TRACKED_KEYS = 10_000;

const hits = new Map<string, number[]>();

export const checkRateLimit = (
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult => {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (hits.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: timestamps[0] + windowMs - now,
    };
  }

  if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
    const oldestKey = hits.keys().next().value;
    if (oldestKey !== undefined) {
      hits.delete(oldestKey);
    }
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  return {
    allowed: true,
    remaining: limit - timestamps.length,
    retryAfterMs: 0,
  };
};

export const getClientIp = (headers: Headers): string => {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const [firstIp] = forwarded.split(",");
    if (firstIp?.trim()) {
      return firstIp.trim();
    }
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
};

export const resetRateLimits = (): void => {
  hits.clear();
};
