import { describe, expect, it } from "vitest";

import { getAllContent, readingTime } from "./content";

/** `n` mots séparés par des espaces — le compte est celui qu'on demande */
const words = (count: number) =>
  Array.from({ length: count }, () => "mot").join(" ");

describe("readingTime", () => {
  // valeurs posées à la main, à 150 mots par minute arrondis au supérieur :
  // 1 → 1, 150 → 1, 151 → 2, 1077 → 7,18 → 8
  it.each([
    [1, "1 min"],
    [150, "1 min"],
    [151, "2 min"],
    [1077, "8 min"],
  ])("%i mots → %s", (count, expected) => {
    expect(readingTime(words(count))).toEqual({
      time: expected,
      words: count,
    });
  });

  it("ne produit jamais « 1 minutes »", () => {
    expect(readingTime("un seul paragraphe").time).not.toContain(
      "minutes"
    );
  });

  it("ignore les blancs en tête, en queue et répétés", () => {
    expect(readingTime("  un\n\n deux\ttrois  ").words).toBe(3);
  });
});

describe("temps de lecture du contenu réel", () => {
  it.each(["fr", "en"] as const)(
    "chaque contenu %s affiche « N min »",
    (locale) => {
      const all = getAllContent(locale);

      // le corpus est bien lu : sans cette borne, une liste vide passerait
      expect(all.length).toBeGreaterThan(20);

      for (const { reading, slug } of all) {
        expect(reading.time, slug).toMatch(/^[1-9]\d* min$/u);
      }
    }
  );
});
