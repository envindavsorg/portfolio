import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";
import { describe, expect, it } from "vitest";

import {
  isRealDay,
  serializeMdx,
  toDay,
} from "@/lib/admin/frontmatter";

/**
 * L'aller-retour, sur les VRAIS fichiers du dépôt.
 *
 * C'est le seul test qui compte vraiment ici : l'administration réécrit des
 * fichiers de contenu, et une sérialisation qui perd ou déforme un champ
 * casserait le site sans que rien d'autre ne le signale. On relit donc avec
 * `gray-matter`, exactement le parseur que `content.ts` utilise — pas une
 * seconde implémentation écrite pour l'occasion.
 */

const CONTENT_DIR = join(process.cwd(), "src/content");

/** parcours récursif, sans dépendance de glob : `content.ts` fait de même */
const collectMdx = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectMdx(path);
    }

    return entry.name.endsWith(".mdx") ? [path] : [];
  });

const realFiles = collectMdx(CONTENT_DIR);

describe("serializeMdx", () => {
  it("trouve les fichiers de contenu du dépôt", () => {
    // sans ce garde, un chemin cassé rendrait toute la suite verte pour rien
    expect(realFiles.length).toBeGreaterThan(30);
  });

  it("rend un frontmatter relisable à l'identique pour chaque fichier", () => {
    const broken: string[] = [];

    for (const file of realFiles) {
      const original = matter(readFileSync(file, "utf8"));

      const rewritten = matter(
        serializeMdx({
          body: original.content,
          frontmatter: original.data,
        })
      );

      /**
       * On compare les VALEURS, pas l'ordre des clés.
       *
       * L'ordre des champs YAML n'est pas sémantique : `gray-matter` rend un
       * objet, et le site ne lit que des propriétés. Le sérialiseur impose
       * volontairement un ordre canonique, ce qui est un gain — le corpus est
       * aujourd'hui incohérent (`bannerDark` avant `bannerLight` ici, `isNew`
       * avant `author` là), et un ordre stable rend les diffs lisibles.
       *
       * Conséquence assumée : la première sauvegarde de six fichiers produira un
       * diff de réordonnancement, sans changement de valeur. L'ordre canonique
       * est vérifié par son propre test plus bas.
       *
       * Les jours sont normalisés des deux côtés : `gray-matter` rend un `Date`,
       * et comparer une `Date` à une chaîne échouerait pour rien.
       */
      const normalize = (data: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(data)
            .map(([key, value]) => [
              key,
              value instanceof Date ? toDay(value) : value,
            ])
            .sort(([left], [right]) =>
              String(left).localeCompare(String(right))
            )
        );

      const before = normalize(original.data);
      const after = normalize(rewritten.data);

      if (JSON.stringify(before) !== JSON.stringify(after)) {
        broken.push(
          `${file}\n  avant : ${JSON.stringify(before)}\n  après : ${JSON.stringify(after)}`
        );
      }
    }

    expect(broken).toEqual([]);
  });

  it("préserve le corps de chaque fichier", () => {
    const broken: string[] = [];

    for (const file of realFiles) {
      const original = matter(readFileSync(file, "utf8"));
      const rewritten = matter(
        serializeMdx({
          body: original.content,
          frontmatter: original.data,
        })
      );

      if (rewritten.content.trim() !== original.content.trim()) {
        broken.push(file);
      }
    }

    expect(broken).toEqual([]);
  });

  /**
   * LE défaut que ce module existe pour éviter.
   *
   * `z.coerce.date()` rend un `Date`. Le resérialiser naïvement donnerait
   * `2026-03-03T00:00:00.000Z`, que `assertValidDates` refuse — donc une
   * sauvegarde depuis l'administration produirait un fichier que le site ne sait
   * plus lire.
   */
  it("écrit les dates en jour nu, jamais en horodatage", () => {
    const output = serializeMdx({
      body: "corps",
      frontmatter: {
        createdAt: "2026-03-03",
        description: "d",
        title: "t",
        updatedAt: new Date(
          Date.UTC(2026, 2, 4, 23, 59, 59)
        ) as never,
      },
    });

    expect(output).toContain("createdAt: 2026-03-03");
    expect(output).toContain("updatedAt: 2026-03-04");
    expect(output).not.toContain("T00:00:00");
    expect(output).not.toContain("T23:59:59");
  });

  it("écrit les étiquettes en tableau sur une ligne", () => {
    const output = serializeMdx({
      body: "corps",
      frontmatter: { tags: ["css", "retour d'expérience"] },
    });

    expect(output).toContain(`tags: ["css", "retour d'expérience"]`);
  });

  it("respecte l'ordre de champs du dépôt", () => {
    const output = serializeMdx({
      body: "corps",
      frontmatter: {
        author: "a",
        category: "articles",
        description: "d",
        title: "t",
      },
    });

    const order = output
      .split("\n")
      .filter((line) => line.includes(": "))
      .map((line) => line.split(":")[0]);

    expect(order).toEqual([
      "title",
      "description",
      "category",
      "author",
    ]);
  });

  it("écarte les champs vides plutôt que d'écrire du vide", () => {
    const output = serializeMdx({
      body: "corps",
      frontmatter: {
        series: null,
        tags: [],
        title: "t",
      },
    });

    expect(output).not.toContain("series");
    expect(output).not.toContain("tags");
  });

  it("n'oublie pas un champ inconnu", () => {
    const output = serializeMdx({
      body: "corps",
      frontmatter: { inattendu: "valeur", title: "t" },
    });

    expect(matter(output).data.inattendu).toBe("valeur");
  });

  /** une chaîne qui se relirait comme autre chose doit être protégée */
  it("met des guillemets seulement quand il en faut", () => {
    const cases: [string, boolean][] = [
      ["Comment j'écris du CSS", false],
      ["Tailwind CSS pur", false],
      ["true", true],
      ["42", true],
      ["null", true],
      ["- pas une liste", true],
      ["clé: valeur", true],
      ["# pas un titre", true],
      ["  espaces  ", true],
      ["", true],
    ];

    for (const [value, quoted] of cases) {
      const output = serializeMdx({
        body: "corps",
        frontmatter: { title: value },
      });

      expect(output.includes(`title: "`), `« ${value} »`).toBe(
        quoted
      );

      if (quoted) {
        // et surtout : la relecture doit rendre la chaîne d'origine
        expect(matter(output).data.title, `« ${value} »`).toBe(value);
      }
    }
  });

  it("échappe les guillemets d'une chaîne citée", () => {
    const value = 'il a dit "bonjour"';
    const output = serializeMdx({
      body: "corps",
      frontmatter: { title: value },
    });

    expect(matter(output).data.title).toBe(value);
  });

  it("termine toujours par un saut de ligne, sans lignes vides en trop", () => {
    const output = serializeMdx({
      body: "\n\n\ncorps\n\n\n",
      frontmatter: { title: "t" },
    });

    expect(output).toBe("---\ntitle: t\n---\n\ncorps\n");
  });
});

describe("isRealDay", () => {
  it("accepte un jour réel", () => {
    expect(isRealDay("2026-03-03")).toBe(true);
    expect(isRealDay("2024-02-29")).toBe(true);
  });

  /** la leçon déjà notée dans `content.ts` : Zod glissait 2026-02-30 au 2 mars */
  it("refuse un jour qui n'existe pas", () => {
    expect(isRealDay("2026-02-30")).toBe(false);
    expect(isRealDay("2026-13-01")).toBe(false);
    expect(isRealDay("2026-00-10")).toBe(false);
    expect(isRealDay("2025-02-29")).toBe(false);
  });

  it("refuse ce qui n'a pas la forme d'un jour", () => {
    expect(isRealDay("2026-3-3")).toBe(false);
    expect(isRealDay("2026-03-03T00:00:00.000Z")).toBe(false);
    expect(isRealDay("")).toBe(false);
  });
});

describe("toDay", () => {
  /**
   * Pas `toISOString().slice(0, 10)` sur une date locale : à l'est de
   * Greenwich, un soir bascule au lendemain.
   */
  it("lit les composantes UTC, pas locales", () => {
    expect(toDay(new Date(Date.UTC(2026, 2, 4, 23, 30)))).toBe(
      "2026-03-04"
    );
    expect(toDay(new Date(Date.UTC(2026, 0, 1, 0, 0)))).toBe(
      "2026-01-01"
    );
  });

  it("tronque une chaîne déjà horodatée", () => {
    expect(toDay("2026-03-04T23:59:59.000Z")).toBe("2026-03-04");
    expect(toDay("  2026-03-04  ")).toBe("2026-03-04");
  });
});
