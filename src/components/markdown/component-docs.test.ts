import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Les balises de `component-docs.ts` ne sont fournies qu'aux pages /components.
 *
 * Un article ou un outil qui en écrirait une afficherait le nom de la balise en
 * clair, sans erreur de build : c'est le seul mode de défaillance que le
 * découpage introduit, et il est silencieux. Ce test relit donc les contenus.
 *
 * Le module est lu comme du TEXTE et non importé : l'importer évaluerait
 * `ComponentPreview`, donc le registre et ses démos, pour vérifier trois noms.
 */
const SOURCE = readFileSync(
  "src/components/markdown/component-docs.ts",
  "utf-8"
);

/** les clés de l'objet exporté : `  ComponentPreview,` — une par ligne */
const readTags = (source: string): string[] => {
  const body = /COMPONENT_DOCS[^=]*=\s*\{(?<keys>[^}]*)\}/u.exec(
    source
  )?.groups?.keys;
  return (body ?? "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
};

const readMdx = (dir: string): { path: string; text: string }[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);
      return { path, text: readFileSync(path, "utf-8") };
    });

const usages = (dir: string, tags: string[]): string[] =>
  readMdx(dir).flatMap(({ path, text }) =>
    tags
      .filter((tag) => new RegExp(`<${tag}\\b`, "u").test(text))
      .map((tag) => `${path} → <${tag}>`)
  );

describe("balises MDX réservées aux pages /components", () => {
  const tags = readTags(SOURCE);

  it("lit bien les trois balises du module", () => {
    expect(tags.toSorted()).toEqual([
      "CodeCollapsibleWrapper",
      "ComponentPreview",
      "ComponentSource",
    ]);
  });

  it("aucun article ne les utilise", () => {
    expect(usages("src/content/articles", tags)).toEqual([]);
  });

  it("aucun outil ne les utilise", () => {
    expect(usages("src/content/utils", tags)).toEqual([]);
  });

  // TÉMOIN : sans lui, un motif qui ne trouverait jamais rien rendrait les deux
  // tests ci-dessus verts pour de mauvaises raisons
  it("les pages de composants, elles, s'en servent", () => {
    const found = usages("src/content/components", tags);

    expect(found.length).toBeGreaterThan(0);
    expect(
      found.some((usage) => usage.endsWith("<ComponentPreview>"))
    ).toBe(true);
  });

  it("la table de base de mdx.tsx ne les déclare plus", () => {
    const base = readFileSync(
      "src/components/markdown/mdx.tsx",
      "utf-8"
    );

    for (const tag of tags) {
      expect(base, tag).not.toMatch(
        new RegExp(`^import .*\\b${tag}\\b`, "mu")
      );
    }
  });
});
