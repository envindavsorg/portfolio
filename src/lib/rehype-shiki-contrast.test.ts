import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  parseColor,
  THRESHOLDS,
} from "@/lib/contrast";
import {
  CODE_BLOCK_BACKGROUND,
  raiseStyleContrast,
  rehypeShikiContrast,
} from "@/lib/rehype-shiki-contrast";

const options = { backgrounds: CODE_BLOCK_BACKGROUND };

/** ratio d'une couleur sur le fond du thème donné, calculé indépendamment */
const ratioOn = (hex: string, theme: "light" | "dark") => {
  const foreground = parseColor(hex);
  const background = parseColor(CODE_BLOCK_BACKGROUND[theme]);

  if (!(foreground && background)) {
    throw new Error(`couleur illisible : ${hex}`);
  }

  return contrastRatio(foreground, background);
};

/** extrait la valeur d'une variable d'une déclaration `style` */
const read = (style: string, theme: "light" | "dark") =>
  new RegExp(`--shiki-${theme}\\s*:\\s*([^;]+)`, "iu").exec(
    style
  )?.[1];

describe("raiseStyleContrast", () => {
  it("laisse intacte une déclaration déjà conforme", () => {
    // #24292E sur blanc et #E1E4E8 sur #121212 passent tous deux largement
    const style = "--shiki-dark:#E1E4E8;--shiki-light:#24292E";

    // identité de référence : le plugin ne doit pas réécrire les milliers de
    // spans conformes juste pour les reformater
    expect(raiseStyleContrast(style, options)).toBe(style);
  });

  it("relève la couleur qui portait la dette", () => {
    // #E36209, jetons `constant` et `variable` de github-light
    expect(ratioOn("#E36209", "light")).toBeLessThan(
      THRESHOLDS.normalAA
    );

    const raised = read(
      raiseStyleContrast(
        "--shiki-dark:#FFAB70;--shiki-light:#E36209",
        options
      ),
      "light"
    );

    expect(raised).toBeDefined();
    expect(ratioOn(raised as string, "light")).toBeGreaterThanOrEqual(
      THRESHOLDS.normalAA
    );
  });

  it("traite chaque thème sur SON fond", () => {
    /**
     * Le même gris des deux côtés : 4,82:1 sur blanc — conforme — et 3,89:1 sur
     * #121212 — non conforme. Un plugin qui appliquerait un seul fond aux deux
     * variables casserait donc l'une ou laisserait passer l'autre.
     *
     * Les deux ratios ont été mesurés avec le module de contraste du site, et
     * non supposés : ma première version de ce test tenait pour acquis
     * l'inverse — que le clair échouait et le sombre passait.
     */
    const style = "--shiki-dark:#6A737D;--shiki-light:#6A737D";

    expect(ratioOn("#6A737D", "light")).toBeGreaterThanOrEqual(
      THRESHOLDS.normalAA
    );
    expect(ratioOn("#6A737D", "dark")).toBeLessThan(
      THRESHOLDS.normalAA
    );

    const next = raiseStyleContrast(style, options);

    expect(read(next, "light")).toBe("#6A737D");
    expect(read(next, "dark")).not.toBe("#6A737D");
    expect(
      ratioOn(read(next, "dark") as string, "dark")
    ).toBeGreaterThanOrEqual(THRESHOLDS.normalAA);
  });

  it("ne touche pas à une valeur qu'il ne sait pas lire", () => {
    const style = "--shiki-light:var(--quelque-chose)";

    // corriger au jugé une couleur illisible serait plus dangereux que de ne
    // rien faire
    expect(raiseStyleContrast(style, options)).toBe(style);
  });

  it("respecte un seuil plus exigeant quand on lui en donne un", () => {
    // #E36209 : 3,49:1 en clair, sous AA comme sous AAA
    const style = "--shiki-light:#E36209";

    const aa = read(raiseStyleContrast(style, options), "light");
    const aaa = read(
      raiseStyleContrast(style, {
        ...options,
        target: THRESHOLDS.normalAAA,
      }),
      "light"
    );

    expect(ratioOn(aaa as string, "light")).toBeGreaterThanOrEqual(
      THRESHOLDS.normalAAA
    );
    expect(ratioOn(aaa as string, "light")).toBeGreaterThan(
      ratioOn(aa as string, "light")
    );
  });
});

describe("rehypeShikiContrast", () => {
  it("corrige les spans d'un arbre et laisse le reste tranquille", () => {
    const tree = {
      children: [
        {
          properties: {
            style: "--shiki-dark:#FFAB70;--shiki-light:#E36209",
          },
          tagName: "span",
          type: "element",
        },
        {
          properties: { style: "display: grid;" },
          tagName: "code",
          type: "element",
        },
        {
          properties: {},
          tagName: "pre",
          type: "element",
        },
      ],
      type: "root",
    };

    rehypeShikiContrast(options)(tree);

    const [span, code, pre] = tree.children;

    expect(span.properties.style).not.toContain("#E36209");
    // un style sans variable Shiki n'est pas réécrit
    expect(code.properties.style).toBe("display: grid;");
    expect(pre.properties).toEqual({});
  });
});
