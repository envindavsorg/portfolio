import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { TOCItemType } from "fumadocs-core/toc";
import { describe, expect, it } from "vitest";

import { groupTocItems } from "./toc";

const item = (title: string, depth: number): TOCItemType => ({
  depth,
  title,
  url: `#${title}`,
});

describe("groupTocItems", () => {
  it("rend une liste vide pour un sommaire vide", () => {
    expect(groupTocItems([])).toEqual([]);
  });

  it("rattache chaque sous-titre au titre qui le précède", () => {
    const groups = groupTocItems([
      item("a", 2),
      item("a1", 3),
      item("a2", 3),
      item("b", 2),
      item("b1", 3),
    ]);

    expect(
      groups.map((group) => [
        group.parent.title,
        group.children.map((child) => child.title),
      ])
    ).toEqual([
      ["a", ["a1", "a2"]],
      ["b", ["b1"]],
    ]);
  });

  it("prend le niveau le plus haut PRÉSENT comme niveau parent", () => {
    // un contenu qui commence en h3 n'a aucun h2 : ses h3 sont les parents
    const groups = groupTocItems([
      item("a", 3),
      item("a1", 4),
      item("b", 3),
    ]);

    expect(groups.map((group) => group.parent.title)).toEqual([
      "a",
      "b",
    ]);
    expect(groups[0]?.children.map((child) => child.title)).toEqual([
      "a1",
    ]);
  });

  it("garde un titre sans enfant", () => {
    const groups = groupTocItems([item("a", 2), item("b", 2)]);

    expect(groups).toHaveLength(2);
    expect(groups.every((group) => group.children.length === 0)).toBe(
      true
    );
  });

  it("ignore les sous-titres placés avant le premier parent", () => {
    // rien à quoi les rattacher : les afficher sans parent casserait
    // l'indentation du sommaire
    const groups = groupTocItems([
      item("orphelin", 3),
      item("a", 2),
      item("a1", 3),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.children.map((child) => child.title)).toEqual([
      "a1",
    ]);
  });
});

/**
 * Garde contre le retour de la fuite.
 *
 * `WritingsToC` est un composant client et importe ce module : tout import de
 * VALEUR ajouté ici part dans le bundle de chaque page de contenu. C'est ainsi
 * que le parseur markdown de fumadocs s'y est retrouvé, puis acorn avec lui.
 * Le test lit la source plutôt que de se fier à une convention que personne ne
 * relit.
 */
describe("toc.ts reste importable par un composant client", () => {
  it("n'importe de fumadocs que des types", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/toc.ts"),
      "utf-8"
    );
    const valueImports = source
      .split("\n")
      .filter(
        (line) =>
          line.startsWith("import ") &&
          !line.startsWith("import type ")
      );

    expect(valueImports).toEqual([]);
  });
});
