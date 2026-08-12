import { describe, expect, it } from "vitest";

import {
  digest,
  isHashAlgorithm,
  randomUuid,
  toHex,
} from "@/lib/hash";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

describe("toHex", () => {
  it("pads each byte to two characters", () => {
    const { buffer } = new Uint8Array([0, 1, 15, 16, 255]);

    expect(toHex(buffer)).toBe("00010f10ff");
  });

  it("returns an empty string for an empty buffer", () => {
    expect(toHex(new Uint8Array([]).buffer)).toBe("");
  });
});

describe("isHashAlgorithm", () => {
  it("accepts the supported algorithms", () => {
    expect(isHashAlgorithm("SHA-256")).toBe(true);
    expect(isHashAlgorithm("SHA-1")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isHashAlgorithm("MD5")).toBe(false);
    expect(isHashAlgorithm("sha-256")).toBe(false);
  });
});

describe("digest", () => {
  it("matches the published SHA-256 of an empty string", async () => {
    await expect(digest("", "SHA-256")).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  it("matches the published SHA-256 of 'abc'", async () => {
    await expect(digest("abc", "SHA-256")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("matches the published SHA-1 of 'abc'", async () => {
    await expect(digest("abc", "SHA-1")).resolves.toBe(
      "a9993e364706816aba3e25717850c26c9cd0d89d"
    );
  });

  it("hashes utf-8 bytes, not utf-16 code units", async () => {
    // « é » vaut 2 octets en UTF-8 (C3 A9) : valeur de référence Node
    await expect(digest("é", "SHA-256")).resolves.toBe(
      "4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c"
    );
    await expect(digest("e", "SHA-256")).resolves.toBe(
      "3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea"
    );
  });
});

describe("randomUuid", () => {
  it("produces a well-formed v4 uuid", () => {
    expect(randomUuid()).toMatch(UUID_V4);
  });

  it("does not repeat itself", () => {
    const generated = new Set(
      Array.from({ length: 200 }, () => randomUuid())
    );

    expect(generated.size).toBe(200);
  });
});
