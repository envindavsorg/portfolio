import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { rssFeedPath } from "./feed-path";

const LOCALES = ["fr", "en"] as const;

describe("rssFeedPath", () => {
  // La référence est le disque, pas une seconde copie des chemins : un lien
  // vers un flux qui n'a pas de route répond 404 sans rien casser d'autre.
  it.each(LOCALES)("mène à une route qui existe (%s)", (locale) => {
    expect(
      existsSync(
        join(
          process.cwd(),
          "src/app",
          rssFeedPath(locale),
          "route.ts"
        )
      )
    ).toBe(true);
  });

  it("donne un flux par langue", () => {
    expect(rssFeedPath("en")).not.toBe(rssFeedPath("fr"));
    expect(rssFeedPath("en")).toMatch(/\/en$/u);
  });
});
