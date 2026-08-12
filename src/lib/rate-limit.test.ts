import { describe, expect, it } from "vitest";

import { RateLimiter } from "./rate-limit";

/** horloge contrôlée pour piloter le temps sans attendre */
const fakeClock = (start = 1_000_000) => {
  let current = start;
  return {
    advance: (ms: number) => {
      current += ms;
    },
    now: () => current,
  };
};

describe("RateLimiter", () => {
  it("allows requests up to the limit", () => {
    const clock = fakeClock();
    const limiter = new RateLimiter(
      { limit: 3, windowMs: 60_000 },
      clock.now
    );

    expect(limiter.check("ip").success).toBe(true);
    expect(limiter.check("ip").success).toBe(true);

    const third = limiter.check("ip");
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks the request that exceeds the limit", () => {
    const clock = fakeClock();
    const limiter = new RateLimiter(
      { limit: 2, windowMs: 60_000 },
      clock.now
    );

    limiter.check("ip");
    limiter.check("ip");

    const blocked = limiter.check("ip");
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBe(60_000);
  });

  it("keeps counters independent per key", () => {
    const clock = fakeClock();
    const limiter = new RateLimiter(
      { limit: 1, windowMs: 60_000 },
      clock.now
    );

    expect(limiter.check("a").success).toBe(true);
    expect(limiter.check("b").success).toBe(true);
    expect(limiter.check("a").success).toBe(false);
  });

  it("lets the window slide so attempts recover", () => {
    const clock = fakeClock();
    const limiter = new RateLimiter(
      { limit: 1, windowMs: 60_000 },
      clock.now
    );

    expect(limiter.check("ip").success).toBe(true);
    expect(limiter.check("ip").success).toBe(false);

    // juste avant l'expiration : toujours bloqué
    clock.advance(59_999);
    expect(limiter.check("ip").success).toBe(false);

    // la première tentative sort de la fenêtre
    clock.advance(2);
    expect(limiter.check("ip").success).toBe(true);
  });

  it("reports a decreasing retryAfter as the window elapses", () => {
    const clock = fakeClock();
    const limiter = new RateLimiter(
      { limit: 1, windowMs: 10_000 },
      clock.now
    );

    limiter.check("ip");
    clock.advance(4000);

    expect(limiter.check("ip").retryAfter).toBe(6000);
  });

  it("does not let a blocked attempt extend the window", () => {
    const clock = fakeClock();
    const limiter = new RateLimiter(
      { limit: 1, windowMs: 10_000 },
      clock.now
    );

    limiter.check("ip");

    // marteler l'endpoint ne doit pas repousser indéfiniment la réouverture
    clock.advance(5000);
    limiter.check("ip");
    clock.advance(5001);

    expect(limiter.check("ip").success).toBe(true);
  });
});
