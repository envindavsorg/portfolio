import { describe, expect, it } from "vitest";

import type { InventoryItem } from "@/lib/admin/inventory";
import { buildInventory } from "@/lib/admin/inventory";

const item = (
  overrides: Partial<InventoryItem> & { slug: string }
): InventoryItem => ({
  category: "articles",
  description: "une description",
  locale: "fr",
  tags: ["css"],
  title: "un titre",
  ...overrides,
});

describe("buildInventory", () => {
  /**
   * LE piège de cet inventaire.
   *
   * `getAllContent("en")` rend TOUJOURS les 44 contenus : un fichier anglais
   * absent retombe sur le français, et c'est `content.locale` qui porte la
   * vérité. Comparer les listes de slugs ne trouverait donc jamais rien — la
   * première version de ce module aurait rendu « tout est traduit ».
   */
  it("reconnaît une traduction manquante par la locale servie, pas par le slug", () => {
    const french = [item({ slug: "a" }), item({ slug: "b" })];
    const english = [
      item({ locale: "en", slug: "a" }),
      // présent dans la liste, mais servi en français : non traduit
      item({ locale: "fr", slug: "b" }),
    ];

    const summary = buildInventory(french, english);

    expect(summary.total).toBe(2);
    expect(summary.translated).toBe(1);

    const missing = summary.findings.filter(
      (finding) => finding.kind === "traduction-manquante"
    );
    expect(missing.map((finding) => finding.slug)).toEqual(["b"]);
  });

  it("signale un contenu absent de l'arbre anglais", () => {
    const summary = buildInventory([item({ slug: "orphelin" })], []);

    expect(summary.translated).toBe(0);
    expect(
      summary.findings.some(
        (finding) =>
          finding.kind === "traduction-manquante" &&
          finding.slug === "orphelin"
      )
    ).toBe(true);
  });

  it("signale une description absente, vide ou blanche", () => {
    const summary = buildInventory(
      [
        item({ description: undefined, slug: "sans" }),
        item({ description: "", slug: "vide" }),
        item({ description: "   ", slug: "blanche" }),
        item({ description: "vraie", slug: "bonne" }),
      ],
      []
    );

    const flagged = summary.findings
      .filter((finding) => finding.kind === "description-absente")
      .map((finding) => finding.slug);

    expect(flagged.sort()).toEqual(["blanche", "sans", "vide"]);
  });

  it("signale un contenu sans étiquette", () => {
    const summary = buildInventory(
      [
        item({ slug: "nu", tags: [] }),
        item({ slug: "aussi-nu", tags: undefined }),
        item({ slug: "habille", tags: ["css"] }),
      ],
      []
    );

    const flagged = summary.findings
      .filter((finding) => finding.kind === "sans-etiquette")
      .map((finding) => finding.slug);

    expect(flagged.sort()).toEqual(["aussi-nu", "nu"]);
  });

  /**
   * Un ordre dupliqué ne casse rien — `series.ts` retombe sur la date puis le
   * slug — mais l'ordre de lecture devient arbitraire alors qu'il est censé
   * être choisi. Invisible en relisant le site.
   */
  it("signale deux contenus au même rang dans une série", () => {
    const summary = buildInventory(
      [
        item({ series: "parcours", seriesOrder: 1, slug: "un" }),
        item({ series: "parcours", seriesOrder: 1, slug: "deux" }),
        item({ series: "parcours", seriesOrder: 2, slug: "trois" }),
        // même rang, mais série différente : pas un conflit
        item({ series: "autre", seriesOrder: 1, slug: "quatre" }),
      ],
      []
    );

    const clashes = summary.findings
      .filter((finding) => finding.kind === "ordre-de-serie-duplique")
      .map((finding) => finding.slug);

    expect(clashes.sort()).toEqual(["deux", "un"]);
  });

  it("ignore un contenu hors série", () => {
    const summary = buildInventory(
      [
        item({ seriesOrder: 1, slug: "a" }),
        item({ seriesOrder: 1, slug: "b" }),
      ],
      []
    );

    expect(
      summary.findings.filter(
        (finding) => finding.kind === "ordre-de-serie-duplique"
      )
    ).toEqual([]);
  });

  it("compte par catégorie, du plus fourni au moins fourni", () => {
    const summary = buildInventory(
      [
        item({ category: "utils", slug: "a" }),
        item({ category: "utils", slug: "b" }),
        item({ category: "utils", slug: "c" }),
        item({ category: "articles", slug: "d" }),
        item({ category: "components", slug: "e" }),
        item({ category: "components", slug: "f" }),
      ],
      []
    );

    expect(summary.byCategory).toEqual([
      { category: "utils", count: 3 },
      { category: "components", count: 2 },
      { category: "articles", count: 1 },
    ]);
  });

  it("ne rend aucun signalement sur un corpus sain", () => {
    const french = [
      item({ series: "s", seriesOrder: 1, slug: "a" }),
      item({ series: "s", seriesOrder: 2, slug: "b" }),
    ];
    const english = [
      item({ locale: "en", slug: "a" }),
      item({ locale: "en", slug: "b" }),
    ];

    const summary = buildInventory(french, english);

    expect(summary.findings).toEqual([]);
    expect(summary.translated).toBe(2);
  });

  it("tient un corpus vide", () => {
    const summary = buildInventory([], []);

    expect(summary).toEqual({
      byCategory: [],
      findings: [],
      total: 0,
      translated: 0,
    });
  });
});
