import { describe, expect, it } from "vitest";

import { decodeJwt } from "@/lib/jwt";

/**
 * Encode en base64url comme le fait un émetteur de JWT : les octets UTF-8
 * d'abord (`btoa` seul rejette tout caractère hors Latin-1), puis l'alphabet
 * base64url sans padding.
 */
const b64url = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const makeToken = (
  header: unknown,
  payload: unknown,
  signature = "sig"
): string =>
  `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.${signature}`;

const NOW = new Date("2025-06-10T12:00:00Z");

describe("decodeJwt", () => {
  it("decodes header and payload", () => {
    const token = makeToken(
      { alg: "HS256", typ: "JWT" },
      { name: "Florin", sub: "1234" }
    );

    const result = decodeJwt(token, NOW);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.value.payload.sub).toBe("1234");
    expect(result.value.signature).toBe("sig");
  });

  it("rejects an empty input", () => {
    expect(decodeJwt("   ", NOW)).toEqual({
      error: "empty",
      ok: false,
    });
  });

  it("rejects a token without three segments", () => {
    expect(decodeJwt("a.b", NOW)).toEqual({
      error: "malformed",
      ok: false,
    });
    expect(decodeJwt("a.b.c.d", NOW)).toEqual({
      error: "malformed",
      ok: false,
    });
  });

  it("rejects segments outside the base64url alphabet", () => {
    // « + » et « / » appartiennent au base64 classique, pas au base64url
    expect(decodeJwt("ab+cd.ef.sig", NOW)).toEqual({
      error: "invalid_base64",
      ok: false,
    });
  });

  it("rejects a segment that is not JSON", () => {
    const token = `${b64url("pas du json")}.${b64url('{"a":1}')}.sig`;

    expect(decodeJwt(token, NOW)).toEqual({
      error: "invalid_json",
      ok: false,
    });
  });

  it("rejects a JSON payload that is not an object", () => {
    const token = `${b64url('{"alg":"HS256"}')}.${b64url("[1,2,3]")}.sig`;

    expect(decodeJwt(token, NOW)).toEqual({
      error: "invalid_json",
      ok: false,
    });
  });

  it("decodes base64url without padding", () => {
    // longueur non multiple de 4 : le padding doit être reconstitué
    const payload = { a: "b" };
    const token = makeToken({ alg: "none" }, payload);

    expect(token).not.toContain("=");
    const result = decodeJwt(token, NOW);
    expect(result.ok).toBe(true);
  });

  it("handles non-ascii payloads", () => {
    const token = makeToken(
      { alg: "HS256" },
      { name: "Cuzeac Florin — développeur" }
    );

    const result = decodeJwt(token, NOW);
    expect(result.ok && result.value.payload.name).toBe(
      "Cuzeac Florin — développeur"
    );
  });

  it("converts exp, iat and nbf from seconds to dates", () => {
    const token = makeToken(
      { alg: "HS256" },
      {
        exp: 1_760_000_000,
        iat: 1_750_000_000,
        nbf: 1_750_000_500,
      }
    );

    const result = decodeJwt(token, NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.claims.issuedAt?.toISOString()).toBe(
      new Date(1_750_000_000 * 1000).toISOString()
    );
    expect(result.value.claims.notBefore?.toISOString()).toBe(
      new Date(1_750_000_500 * 1000).toISOString()
    );
    expect(result.value.claims.expiresAt?.toISOString()).toBe(
      new Date(1_760_000_000 * 1000).toISOString()
    );
  });

  it("flags an expired token", () => {
    const past = Math.floor(NOW.getTime() / 1000) - 60;
    const result = decodeJwt(
      makeToken({ alg: "HS256" }, { exp: past }),
      NOW
    );

    expect(result.ok && result.value.claims.isExpired).toBe(true);
  });

  it("does not flag a still-valid token", () => {
    const future = Math.floor(NOW.getTime() / 1000) + 60;
    const result = decodeJwt(
      makeToken({ alg: "HS256" }, { exp: future }),
      NOW
    );

    expect(result.ok && result.value.claims.isExpired).toBe(false);
  });

  it("never claims expiry when exp is absent", () => {
    const result = decodeJwt(makeToken({ alg: "HS256" }, {}), NOW);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.claims.expiresAt).toBeNull();
    expect(result.value.claims.isExpired).toBe(false);
  });

  it("ignores a non-numeric exp instead of trusting it", () => {
    const result = decodeJwt(
      makeToken({ alg: "HS256" }, { exp: "bientôt" }),
      NOW
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.claims.expiresAt).toBeNull();
    expect(result.value.claims.isExpired).toBe(false);
  });

  it("accepts a token with an empty signature segment", () => {
    // alg: none produit un troisième segment vide, mais le jeton reste lisible
    const token = `${b64url('{"alg":"none"}')}.${b64url('{"a":1}')}.`;

    const result = decodeJwt(token, NOW);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.signature).toBe("");
  });
});
