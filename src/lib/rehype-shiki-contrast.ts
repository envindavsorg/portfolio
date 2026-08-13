import { visit } from "unist-util-visit";

import {
  contrastRatio,
  parseColor,
  suggestForeground,
  THRESHOLDS,
  toHexColor,
} from "./contrast";

/**
 * Relève les jetons de coloration qui n'atteignent pas le seuil AA.
 *
 * Le thème `github-light` de Shiki contient une couleur — #E36209, les jetons
 * `constant` et `variable` — mesurée à 3,49:1 sur fond blanc là où WCAG 1.4.3 AA
 * exige 4,5. Ce n'est pas un effet de `keepBackground: false` : #E36209 échoue
 * aussi sur le fond d'origine de GitHub. La palette n'a simplement jamais visé AA.
 *
 * C'était la dernière dette de contraste assumée du site, et la seule qu'on ne
 * pouvait pas fermer en changeant un jeton : elle vient d'un thème tiers, appliqué
 * en style en ligne sur des milliers de spans.
 *
 * Le plugin s'insère APRÈS `rehype-pretty-code`, qui écrit
 * `--shiki-dark:#…;--shiki-light:#…` dans l'attribut `style` de chaque
 * `<span>` enfant d'un `<span data-line>`, et que `globals.css` consomme via
 * `text-(--shiki-light) dark:text-(--shiki-dark)`.
 *
 * Le fond est un PARAMÈTRE OBLIGATOIRE, sans valeur par défaut. Deviner le fond
 * est exactement ce qui produit ce genre de dette : ici les jetons sont peints
 * sur le canevas de la page, parce que `keepBackground: false` retire le fond
 * propre du thème.
 */

export interface ShikiBackgrounds {
  light: string;
  dark: string;
}

export interface RehypeShikiContrastOptions {
  backgrounds: ShikiBackgrounds;
  /** seuil visé ; AA pour du texte normal par défaut */
  target?: number;
}

/**
 * Le fond réellement peint derrière un bloc de code, mesuré dans le navigateur.
 *
 * `keepBackground: false` retire le fond du thème Shiki, donc les jetons sont
 * peints sur le canevas — le jeton `--canvas` de `globals.css`. Vérifié en
 * remontant les ancêtres d'un span jusqu'au premier fond non transparent :
 * rgb(255,255,255) en clair, rgb(18,18,18) en sombre.
 *
 * Un test de bout en bout compare ces constantes à ce que le navigateur résout
 * réellement : sans cela, « paramètre explicite » ne serait qu'une devinette
 * mieux rangée, et un changement de `--canvas` rendrait le site non conforme
 * sans qu'aucun test ne bronche.
 */
export const CODE_BLOCK_BACKGROUND: ShikiBackgrounds = {
  dark: "#121212",
  light: "#ffffff",
};

/** `--shiki-dark:#F97583;--shiki-light:#D73A49` — deux thèmes, toujours ensemble */
const SHIKI_VARIABLE = /--shiki-(light|dark)\s*:\s*([^;]+)/giu;

/**
 * Relève les couleurs d'une déclaration `style`, thème par thème.
 *
 * Renvoie la chaîne d'ORIGINE, à l'identique, quand rien n'est à corriger : le
 * plugin ne doit pas réécrire les milliers de spans déjà conformes, et l'identité
 * de référence rend ce contrat vérifiable dans un test.
 */
export const raiseStyleContrast = (
  style: string,
  {
    backgrounds,
    target = THRESHOLDS.normalAA,
  }: RehypeShikiContrastOptions
): string => {
  const parsedBackgrounds = {
    dark: parseColor(backgrounds.dark),
    light: parseColor(backgrounds.light),
  };

  let changed = false;

  const next = style.replace(
    SHIKI_VARIABLE,
    (match, theme: string, value: string) => {
      const background =
        parsedBackgrounds[
          theme.toLowerCase() as keyof ShikiBackgrounds
        ];
      const foreground = parseColor(value.trim());

      if (!(background && foreground)) {
        // une couleur illisible est laissée telle quelle : la corriger au
        // jugé serait plus dangereux que de ne rien faire
        return match;
      }

      if (contrastRatio(foreground, background) >= target) {
        return match;
      }

      const raised = suggestForeground(
        foreground,
        background,
        target
      );
      if (!raised) {
        return match;
      }

      changed = true;
      return `--shiki-${theme}:${toHexColor(raised)}`;
    }
  );

  return changed ? next : style;
};

/**
 * Le plugin rehype.
 *
 * `properties.style` est une CHAÎNE à ce stade du pipeline, pas un objet : c'est
 * React qui la convertit en objet plus tard, bien après rehype.
 */
export const rehypeShikiContrast =
  (options: RehypeShikiContrastOptions) =>
  (tree: unknown): void => {
    visit(
      tree as never,
      "element",
      (node: { properties?: { style?: unknown } }) => {
        const style = node.properties?.style;

        if (
          typeof style !== "string" ||
          !style.includes("--shiki-")
        ) {
          return;
        }

        node.properties = {
          ...node.properties,
          style: raiseStyleContrast(style, options),
        };
      }
    );
  };
