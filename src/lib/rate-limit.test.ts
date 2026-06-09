import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  checkRateLimit,
  getClientIp,
  resetRateLimits,
} from "@/lib/rate-limit";

const OPTIONS = { limit: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRateLimits();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows calls under the limit", () => {
    expect(checkRateLimit("key", OPTIONS).allowed).toBe(true);
    expect(checkRateLimit("key", OPTIONS).allowed).toBe(true);
    const third = checkRateLimit("key", OPTIONS);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks calls over the limit and reports retry delay", () => {
    checkRateLimit("key", OPTIONS);
    checkRateLimit("key", OPTIONS);
    checkRateLimit("key", OPTIONS);

    const blocked = checkRateLimit("key", OPTIONS);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(
      OPTIONS.windowMs
    );
  });

  it("tracks keys independently", () => {
    checkRateLimit("a", OPTIONS);
    checkRateLimit("a", OPTIONS);
    checkRateLimit("a", OPTIONS);

    expect(checkRateLimit("a", OPTIONS).allowed).toBe(false);
    expect(checkRateLimit("b", OPTIONS).allowed).toBe(true);
  });

  it("allows again once the window has elapsed", () => {
    checkRateLimit("key", OPTIONS);
    checkRateLimit("key", OPTIONS);
    checkRateLimit("key", OPTIONS);
    expect(checkRateLimit("key", OPTIONS).allowed).toBe(false);

    vi.advanceTimersByTime(OPTIONS.windowMs + 1);
    expect(checkRateLimit("key", OPTIONS).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("reads the first x-forwarded-for entry", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
    });
    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.8" });
    expect(getClientIp(headers)).toBe("203.0.113.8");
  });

  it("returns unknown without client headers", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
