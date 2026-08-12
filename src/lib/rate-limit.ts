/**
 * Limiteur de débit en fenêtre glissante, sans dépendance externe.
 *
 * LIMITE CONNUE : l'état vit dans la mémoire de l'instance. En serverless,
 * chaque instance a son propre compteur, donc la limite réelle est
 * `limit × nombre d'instances actives`. C'est volontaire : cela suffit à
 * rendre l'abus coûteux sans imposer Redis/KV. Pour une garantie stricte,
 * remplacer `MemoryStore` par un store partagé (Vercel KV, Upstash).
 */

export interface RateLimitResult {
  success: boolean;
  /** tentatives restantes dans la fenêtre courante */
  remaining: number;
  /** ms à attendre avant que la prochaine tentative passe (0 si autorisée) */
  retryAfter: number;
}

export interface RateLimitRule {
  /** nombre de tentatives autorisées par fenêtre */
  limit: number;
  /** durée de la fenêtre en millisecondes */
  windowMs: number;
}

/** horloge injectable pour rendre le limiteur testable */
export type Clock = () => number;

const MAX_TRACKED_KEYS = 10_000;

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly rule: RateLimitRule;
  private readonly now: Clock;

  constructor(rule: RateLimitRule, now: Clock = Date.now) {
    this.rule = rule;
    this.now = now;
  }

  check(key: string): RateLimitResult {
    const currentTime = this.now();
    const windowStart = currentTime - this.rule.windowMs;

    const previous = this.hits.get(key) ?? [];
    const recent = previous.filter(
      (timestamp) => timestamp > windowStart
    );

    if (recent.length >= this.rule.limit) {
      const [oldest] = recent;
      this.hits.set(key, recent);
      return {
        remaining: 0,
        retryAfter: oldest + this.rule.windowMs - currentTime,
        success: false,
      };
    }

    recent.push(currentTime);
    this.hits.set(key, recent);
    this.evictIfNeeded(windowStart);

    return {
      remaining: this.rule.limit - recent.length,
      retryAfter: 0,
      success: true,
    };
  }

  /**
   * Purge les clés dont toutes les tentatives sont hors fenêtre. Sans cela la
   * Map grossirait indéfiniment (une clé par IP vue).
   */
  private evictIfNeeded(windowStart: number) {
    if (this.hits.size <= MAX_TRACKED_KEYS) {
      return;
    }

    for (const [key, timestamps] of this.hits) {
      const stillRelevant = timestamps.some(
        (timestamp) => timestamp > windowStart
      );
      if (!stillRelevant) {
        this.hits.delete(key);
      }
    }
  }
}
