import { describe, expect, it } from "vitest";

import { contrastRatio, parseColor } from "@/lib/contrast";
import {
  isPageType,
  MAX_TITLE_LENGTH,
  ogBadge,
  ogFamily,
  ogMetaParts,
  ogPalette,
  ogTitleSize,
  truncate,
} from "@/lib/og";

const TYPES: PageType[] = [
  "homepage",
  "project",
  "experience",
  "blog",
  "blogArticle",
  "components",
  "componentsArticle",
  "utils",
  "utilsArticle",
];

describe("ogFamily", () => {
  it("range chaque type de page dans une famille", () => {
    for (const type of TYPES) {
      expect(ogFamily(type), type).toBeTruthy();
    }
  });

  /**
   * L'intérêt de ce travail : deux rubriques différentes ne doivent pas produire
   * la même carte. Si toutes les familles se confondaient, on aurait juste
   * recoloré un gabarit unique.
   */
  it("distingue les rubriques les unes des autres", () => {
    expect(ogFamily("blogArticle")).not.toBe(
      ogFamily("utilsArticle")
    );
    expect(ogFamily("project")).not.toBe(ogFamily("experience"));
    expect(ogFamily("components")).not.toBe(ogFamily("blog"));
    expect(ogFamily("homepage")).not.toBe(ogFamily("project"));
  });

  it("range un index et sa fiche dans la même famille", () => {
    expect(ogFamily("blog")).toBe(ogFamily("blogArticle"));
    expect(ogFamily("utils")).toBe(ogFamily("utilsArticle"));
    expect(ogFamily("components")).toBe(
      ogFamily("componentsArticle")
    );
  });

  it("retombe sur l'accueil pour un type inconnu", () => {
    expect(ogFamily("nimportequoi" as PageType)).toBe("home");
  });
});

describe("ogPalette", () => {
  it("donne une palette complète à chaque type", () => {
    for (const type of TYPES) {
      const palette = ogPalette(type);

      for (const key of [
        "accent",
        "accentSoft",
        "canvas",
        "guide",
        "ink",
        "muted",
      ] as const) {
        expect(palette[key], `${type}.${key}`).toMatch(
          /^#[0-9a-f]{6}$/u
        );
      }
    }
  });

  /** la carte des outils est la seule sombre : c'est ce qui la rend reconnaissable */
  it("n'assombrit que la famille des outils", () => {
    expect(ogPalette("utils").canvas).toBe("#121212");
    expect(ogPalette("utilsArticle").canvas).toBe("#121212");
    expect(ogPalette("blogArticle").canvas).toBe("#faf9f6");
    expect(ogPalette("project").canvas).toBe("#faf9f6");
  });

  it("reprend la couleur de marque exacte du site", () => {
    // la valeur passée de 4,4995:1 à 4,5102:1 pour franchir le seuil WCAG
    expect(ogPalette("homepage").accent).toBe("#306fdb");
  });
});

describe("ogBadge", () => {
  it("traduit le mot de la pastille", () => {
    expect(ogBadge("blogArticle", false)).toBe("article");
    expect(ogBadge("utilsArticle", false)).toBe("outil");
    expect(ogBadge("utilsArticle", true)).toBe("tool");
    expect(ogBadge("experience", true)).toBe("experience");
  });

  it("couvre tous les types dans les deux langues", () => {
    for (const type of TYPES) {
      expect(ogBadge(type, false), type).not.toBe("");
      expect(ogBadge(type, true), type).not.toBe("");
    }
  });

  it("retombe sur un mot lisible pour un type inconnu", () => {
    expect(ogBadge("inconnu" as PageType, false)).toBe("portfolio");
  });
});

describe("isPageType", () => {
  it("accepte les types connus et rejette le reste", () => {
    expect(isPageType("blogArticle")).toBe(true);
    expect(isPageType("project")).toBe(true);
    expect(isPageType("toString")).toBe(false);
    expect(isPageType("")).toBe(false);
  });
});

describe("truncate", () => {
  it("laisse intact ce qui tient", () => {
    expect(truncate("court", 10)).toBe("court");
  });

  /** l'endpoint est public : un titre de 100 ko ne doit pas atteindre Satori */
  it("coupe et pose une ellipse au-delà du plafond", () => {
    const long = "a".repeat(MAX_TITLE_LENGTH + 50);
    const cut = truncate(long, MAX_TITLE_LENGTH);

    expect(cut).toHaveLength(MAX_TITLE_LENGTH);
    expect(cut.endsWith("…")).toBe(true);
  });

  it("ne laisse pas d'espace avant l'ellipse", () => {
    expect(truncate("mot mot mot", 8)).toBe("mot mot…");
  });
});

describe("ogTitleSize", () => {
  it("réduit la taille quand le titre s'allonge", () => {
    const court = ogTitleSize("court");
    const moyen = ogTitleSize("a".repeat(45));
    const long = ogTitleSize("a".repeat(80));

    expect(court).toBeGreaterThan(moyen);
    expect(moyen).toBeGreaterThan(long);
  });

  it("rend la même taille pour deux titres de longueur voisine", () => {
    // sinon deux cartes d'une même rubrique n'ont plus l'air d'une famille
    expect(ogTitleSize("a".repeat(20))).toBe(
      ogTitleSize("a".repeat(30))
    );
  });
});

describe("ogMetaParts", () => {
  it("découpe sur les points médians et les virgules", () => {
    expect(ogMetaParts("8 min · 12 août 2026")).toEqual([
      "8 min",
      "12 août 2026",
    ]);
    expect(ogMetaParts("React, Next.js, Vercel")).toEqual([
      "React",
      "Next.js",
      "Vercel",
    ]);
  });

  it("ignore les segments vides et l'absence de méta", () => {
    expect(ogMetaParts("a ·  · b")).toEqual(["a", "b"]);
    expect(ogMetaParts("")).toEqual([]);
    expect(ogMetaParts(null)).toEqual([]);
    expect(ogMetaParts("   ")).toEqual([]);
  });

  it("plafonne le nombre de segments", () => {
    expect(ogMetaParts("a, b, c, d, e, f")).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});

const ratio = (foreground: string, background: string): number => {
  const left = parseColor(foreground);
  const right = parseColor(background);

  if (!(left && right)) {
    throw new Error(
      `couleur illisible : ${foreground} / ${background}`
    );
  }

  return contrastRatio(left, right);
};

describe("contraste des pastilles", () => {
  /**
   * Mesuré avec `contrast.ts`, la bibliothèque qui fait tourner l'outil WCAG du
   * site — pas avec une seconde implémentation écrite pour l'occasion.
   *
   * Une carte sociale n'est pas auditée par axe : c'est justement pour cela que
   * ce test existe. Sans lui, rien ne verrait une pastille délavée, et elle est
   * lue en vignette sur un téléphone.
   */
  it("chaque pastille atteint 4,5:1", () => {
    const failures = TYPES.filter((type) => {
      const palette = ogPalette(type);
      return ratio(palette.accentInk, palette.accentSoft) < 4.5;
    }).map((type) => {
      const palette = ogPalette(type);
      return `${type}: ${ratio(palette.accentInk, palette.accentSoft).toFixed(2)}:1`;
    });

    expect(failures).toEqual([]);
  });

  it("le texte principal reste lisible sur son fond", () => {
    for (const type of TYPES) {
      const palette = ogPalette(type);

      expect(
        ratio(palette.ink, palette.canvas),
        `${type} : texte principal`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        ratio(palette.muted, palette.canvas),
        `${type} : texte secondaire`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
