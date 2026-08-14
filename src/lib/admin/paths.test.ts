import { describe, expect, it } from "vitest";

import {
  contentFilePath,
  contentPublicPath,
  isSafeSlug,
  locationKey,
  parseLocationKey,
} from "@/lib/admin/paths";

/**
 * Le chemin qui part dans un commit.
 *
 * Comme pour `access.ts`, ces tests sont écrits à l'envers : ce qui compte n'est
 * pas que le bon chemin soit calculé, c'est qu'aucun mauvais ne le soit. Le slug
 * vient d'une URL, et le résultat sert à écrire dans le dépôt.
 */

describe("contentFilePath", () => {
  it("place le français à la racine de sa catégorie", () => {
    expect(
      contentFilePath({
        category: "articles",
        locale: "fr",
        slug: "how-i-write-css",
      })
    ).toBe("src/content/articles/how-i-write-css.mdx");
  });

  it("place l'anglais dans le sous-dossier en/", () => {
    expect(
      contentFilePath({
        category: "utils",
        locale: "en",
        slug: "regex-tester",
      })
    ).toBe("src/content/utils/en/regex-tester.mdx");
  });

  /**
   * LE test de ce fichier.
   *
   * Un slug `../../../.github/workflows/ci` transformerait « enregistrer un
   * article » en « réécrire la CI ». On refuse, on ne nettoie pas : nettoyer
   * laisse toujours une variante non prévue.
   */
  it("refuse tout ce qui pourrait sortir de src/content", () => {
    const attacks = [
      "../../../.github/workflows/ci",
      "..",
      "../secrets",
      "a/../../b",
      "a/b",
      "./a",
      "/etc/passwd",
      "a\\b",
      "a%2F..%2Fb",
      "a\0b",
      "…/évasion",
    ];

    for (const slug of attacks) {
      expect(
        contentFilePath({
          category: "articles",
          locale: "fr",
          slug,
        }),
        `« ${slug} » ne doit produire aucun chemin`
      ).toBeNull();
    }
  });

  it("refuse une catégorie inconnue", () => {
    for (const category of [
      "secrets",
      "../src",
      "",
      "Articles",
    ] as never[]) {
      expect(
        contentFilePath({ category, locale: "fr", slug: "ok" })
      ).toBeNull();
    }
  });

  it("refuse une locale inconnue", () => {
    for (const locale of ["de", "", "FR", "../en"] as never[]) {
      expect(
        contentFilePath({
          category: "articles",
          locale,
          slug: "ok",
        })
      ).toBeNull();
    }
  });

  it("reste dans src/content pour toute entrée acceptée", () => {
    for (const category of [
      "articles",
      "components",
      "utils",
    ] as const) {
      for (const locale of ["fr", "en"] as const) {
        const path = contentFilePath({
          category,
          locale,
          slug: "un-slug-valide",
        });

        expect(path).not.toBeNull();
        expect(path?.startsWith("src/content/")).toBe(true);
        expect(path).not.toContain("..");
      }
    }
  });
});

describe("isSafeSlug", () => {
  it("accepte un slug en minuscules à tirets", () => {
    expect(isSafeSlug("how-i-write-css")).toBe(true);
    expect(isSafeSlug("base64")).toBe(true);
    expect(isSafeSlug("a")).toBe(true);
  });

  it("refuse ce qui n'est pas un segment simple", () => {
    for (const bad of [
      "",
      "-debut",
      "fin-",
      "double--tiret",
      "MAJUSCULE",
      "avec espace",
      "accentué",
      "point.point",
      "slash/slash",
      "under_score",
    ]) {
      expect(isSafeSlug(bad), bad).toBe(false);
    }
  });
});

describe("contentPublicPath", () => {
  it("rend l'adresse publique du contenu", () => {
    expect(
      contentPublicPath({
        category: "articles",
        locale: "fr",
        slug: "mon-article",
      })
    ).toBe("/articles/mon-article");

    expect(
      contentPublicPath({
        category: "articles",
        locale: "en",
        slug: "mon-article",
      })
    ).toBe("/en/articles/mon-article");
  });

  it("ne rend rien pour une localisation refusée", () => {
    expect(
      contentPublicPath({
        category: "articles",
        locale: "fr",
        slug: "../evasion",
      })
    ).toBeNull();
  });
});

describe("parseLocationKey", () => {
  it("relit une clé qu'il a produite", () => {
    const location = {
      category: "components" as const,
      locale: "en" as const,
      slug: "flip-sentences-component",
    };

    expect(
      parseLocationKey(locationKey(location).split("/"))
    ).toEqual(location);
  });

  it("refuse un nombre de segments inattendu", () => {
    expect(parseLocationKey([])).toBeNull();
    expect(parseLocationKey(["fr"])).toBeNull();
    expect(parseLocationKey(["fr", "articles"])).toBeNull();
    expect(parseLocationKey(["fr", "articles", "a", "b"])).toBeNull();
  });

  it("refuse un segment hostile", () => {
    expect(
      parseLocationKey(["fr", "articles", "../../secrets"])
    ).toBeNull();
    expect(parseLocationKey(["fr", "..", "slug"])).toBeNull();
    expect(parseLocationKey(["..", "articles", "slug"])).toBeNull();
  });
});
