import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  evaluateContrast,
  formatRatio,
  parseColor,
  relativeLuminance,
  suggestForeground,
  THRESHOLDS,
  toHexColor,
} from "@/lib/contrast";

const BLACK = { b: 0, g: 0, r: 0 };
const WHITE = { b: 255, g: 255, r: 255 };

describe("parseColor", () => {
  it("lit l'hexadécimal long", () => {
    expect(parseColor("#1e40af")).toEqual({
      b: 0xaf,
      g: 0x40,
      r: 0x1e,
    });
    expect(parseColor("1e40af")).toEqual({
      b: 0xaf,
      g: 0x40,
      r: 0x1e,
    });
  });

  it("développe l'hexadécimal court", () => {
    expect(parseColor("#fff")).toEqual(WHITE);
    expect(parseColor("#f00")).toEqual({ b: 0, g: 0, r: 255 });
  });

  it("accepte un canal alpha et l'ignore", () => {
    // composer une couleur transparente demanderait de connaître le fond
    expect(parseColor("#1e40af80")).toEqual({
      b: 0xaf,
      g: 0x40,
      r: 0x1e,
    });
    expect(parseColor("#fff8")).toEqual(WHITE);
  });

  it("lit la notation rgb()", () => {
    expect(parseColor("rgb(30, 64, 175)")).toEqual({
      b: 175,
      g: 64,
      r: 30,
    });
    expect(parseColor("rgba(30 64 175 / 0.5)")).toEqual({
      b: 175,
      g: 64,
      r: 30,
    });
  });

  it("refuse ce qui n'est pas une couleur", () => {
    expect(parseColor("bleu")).toBeNull();
    expect(parseColor("#12345")).toBeNull();
    expect(parseColor("rgb(300, 0, 0)")).toBeNull();
    expect(parseColor("")).toBeNull();
  });
});

describe("relativeLuminance", () => {
  // valeurs de la définition WCAG : le noir vaut 0, le blanc vaut 1
  it("borne le noir et le blanc", () => {
    expect(relativeLuminance(BLACK)).toBe(0);
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 10);
  });

  it("pondère le vert plus que le rouge et le bleu", () => {
    const green = relativeLuminance({ b: 0, g: 255, r: 0 });
    const red = relativeLuminance({ b: 0, g: 0, r: 255 });
    const blue = relativeLuminance({ b: 255, g: 0, r: 0 });

    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });
});

describe("contrastRatio", () => {
  // références calculées hors du code testé, avec la formule WCAG en Python
  const cases: [string, string, number][] = [
    ["#000000", "#ffffff", 21],
    ["#777777", "#ffffff", 4.4781],
    ["#595959", "#ffffff", 7.0047],
    ["#1e40af", "#ffffff", 8.7224],
    ["#ffffff", "#ffffff", 1],
    ["#ff0000", "#000000", 5.252],
  ];

  for (const [foreground, background, expected] of cases) {
    it(`vaut ${expected} pour ${foreground} sur ${background}`, () => {
      const fg = parseColor(foreground);
      const bg = parseColor(background);
      expect(fg).not.toBeNull();
      expect(bg).not.toBeNull();

      if (fg && bg) {
        expect(contrastRatio(fg, bg)).toBeCloseTo(expected, 3);
      }
    });
  }

  it("est symétrique", () => {
    expect(contrastRatio(BLACK, WHITE)).toBe(
      contrastRatio(WHITE, BLACK)
    );
  });
});

describe("evaluateContrast", () => {
  it("valide tous les niveaux pour noir sur blanc", () => {
    const verdict = evaluateContrast(BLACK, WHITE);

    expect(verdict.normalAA).toBe(true);
    expect(verdict.normalAAA).toBe(true);
    expect(verdict.largeAA).toBe(true);
    expect(verdict.uiComponent).toBe(true);
  });

  it("distingue texte normal et texte large", () => {
    // #777 sur blanc vaut 4.478 : sous 4.5 (AA normal), au-dessus de 3 (AA large)
    const grey = parseColor("#777777");
    expect(grey).not.toBeNull();

    if (grey) {
      const verdict = evaluateContrast(grey, WHITE);
      expect(verdict.ratio).toBeLessThan(THRESHOLDS.normalAA);
      expect(verdict.normalAA).toBe(false);
      expect(verdict.largeAA).toBe(true);
    }
  });

  it("échoue partout pour deux couleurs identiques", () => {
    const verdict = evaluateContrast(WHITE, WHITE);

    expect(verdict.ratio).toBe(1);
    expect(verdict.normalAA).toBe(false);
    expect(verdict.largeAA).toBe(false);
    expect(verdict.uiComponent).toBe(false);
  });
});

describe("formatRatio", () => {
  it("affiche deux décimales", () => {
    expect(formatRatio(21)).toBe("21.00:1");
    expect(formatRatio(4.4781)).toBe("4.48:1");
  });
});

describe("suggestForeground", () => {
  it("renvoie la couleur telle quelle si elle passe déjà", () => {
    expect(
      suggestForeground(BLACK, WHITE, THRESHOLDS.normalAA)
    ).toEqual(BLACK);
  });

  it("trouve une variante conforme", () => {
    const grey = parseColor("#777777");
    expect(grey).not.toBeNull();

    if (grey) {
      const fixed = suggestForeground(
        grey,
        WHITE,
        THRESHOLDS.normalAA
      );
      expect(fixed).not.toBeNull();

      if (fixed) {
        expect(contrastRatio(fixed, WHITE)).toBeGreaterThanOrEqual(
          THRESHOLDS.normalAA
        );
      }
    }
  });

  it("reste proche de la couleur d'origine", () => {
    const grey = parseColor("#777777");
    if (grey) {
      const fixed = suggestForeground(
        grey,
        WHITE,
        THRESHOLDS.normalAA
      );
      // une suggestion qui renverrait du noir serait inutile : on veut la
      // variante la plus proche qui atteint le seuil
      expect(fixed?.r).toBeGreaterThan(0x40);
    }
  });

  it("renvoie null quand aucun ajustement ne suffit", () => {
    // sur un fond gris moyen, aucun gris ne peut atteindre 21:1
    const mid = parseColor("#808080");
    if (mid) {
      expect(suggestForeground(mid, mid, 21)).toBeNull();
    }
  });
});

describe("toHexColor", () => {
  it("recompose un hexadécimal sur six chiffres", () => {
    expect(toHexColor({ b: 0xaf, g: 0x40, r: 0x1e })).toBe("#1e40af");
    expect(toHexColor(BLACK)).toBe("#000000");
  });
});
