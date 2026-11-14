import { describe, expect, it } from "vitest";

import { accessibleName } from "@/lib/accessible-name";

/**
 * Découpage en mots tel que le fait un contrôle « libellé dans le nom » : sans
 * casse, sans accents, sans ponctuation. Écrit ici, indépendamment de la
 * fonction testée, pour vérifier la propriété qui compte — les mots affichés se
 * retrouvent dans le nom, dans l'ordre et sans rien entre eux.
 */
const words = (text: string): string[] =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const containsInOrder = (name: string, visible: string): boolean => {
  const haystack = words(name);
  const needle = words(visible);

  return haystack.some((_, start) =>
    needle.every((word, offset) => haystack[start + offset] === word)
  );
};

describe("accessibleName", () => {
  it("ouvre le nom par le texte visible, inchangé", () => {
    expect(
      accessibleName("voir la certification", "Meta Front-End")
    ).toBe("voir la certification — Meta Front-End");
    expect(accessibleName("EN", "changer de langue")).toBe(
      "EN — changer de langue"
    );
  });

  it("garde les mots affichés contigus, quelle que soit la précision", () => {
    const cases: [visible: string, detail: string][] = [
      ["voir et télécharger", "cv_florin_cuzeac.pdf"],
      ["lire l'article", "Comment j'écris du CSS (et pourquoi)"],
      ["read article", "Things I believe in: a short list"],
      ["FR", "switch language"],
    ];

    for (const [visible, detail] of cases) {
      expect(
        containsInOrder(accessibleName(visible, detail), visible)
      ).toBe(true);
    }
  });

  it("le contrôle échoue bien sur l'ancien libellé", () => {
    // garde-fou sur la garde : si `containsInOrder` acceptait tout, le test
    // précédent passerait au vert sans rien vérifier
    expect(
      containsInOrder("cv_florin_cuzeac.pdf", "voir et télécharger")
    ).toBe(false);
    expect(
      containsInOrder(
        "Voir tous les articles",
        "voir tous mes articles"
      )
    ).toBe(false);
  });
});
