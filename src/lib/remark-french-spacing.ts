import { CONTINUE, SKIP, visit } from "unist-util-visit";

/**
 * Les espaces insécables de la typographie française.
 *
 * Les articles sont écrits avec une espace ordinaire devant « ? », « ! »,
 * « : » et « ; », et à l'intérieur des guillemets. Le navigateur a donc le
 * droit de couper la ligne à cet endroit : sur /articles/how-i-write-css, une
 * question se terminait par « styles » et la ligne suivante commençait par un
 * « ? » seul.
 *
 * Corrigé au rendu et non dans les sources : les fichiers restent tapables au
 * clavier et lisibles dans un diff, et le miroir texte (`/articles/<slug>.mdx`),
 * l'index de recherche et le temps de lecture — qui lisent tous la SOURCE — ne
 * bougent pas.
 *
 * Seuls les nœuds `text` sont touchés. Le code (`code`, `inlineCode`), les URL
 * des liens et les expressions MDX portent leur valeur ailleurs que dans un
 * nœud `text` : ils sont hors d'atteinte par construction.
 */

/** espace fine insécable : devant « ? », « ! » et « ; » */
export const NARROW_NO_BREAK_SPACE = "\u202F";

/** espace insécable : devant « : » et à l'intérieur des guillemets */
export const NO_BREAK_SPACE = "\u00A0";

const AFTER_OPENING_QUOTE = /(?<=«) /gu;
const BEFORE_CLOSING_QUOTE = / (?=»)/gu;

/**
 * L'espace qui précède une ponctuation haute — à condition que celle-ci ne
 * soit collée ni à une lettre ni à un chiffre.
 *
 * C'est ce qui laisse intacts `:hover`, `!important`, `?param=1` ou `:smile:`
 * quand ils sont écrits dans une phrase sans être balisés comme du code. Le
 * premier signe de la suite est capturé : « ?! » suit la règle du « ? ».
 */
const BEFORE_HIGH_PUNCTUATION =
  / (?=([?!;:])[?!;:]*(?![?!;:\p{L}\p{N}]))/gu;

export const frenchSpacing = (text: string): string =>
  text
    .replaceAll(AFTER_OPENING_QUOTE, NO_BREAK_SPACE)
    .replaceAll(BEFORE_CLOSING_QUOTE, NO_BREAK_SPACE)
    .replaceAll(BEFORE_HIGH_PUNCTUATION, (_space, first: string) =>
      first === ":" ? NO_BREAK_SPACE : NARROW_NO_BREAK_SPACE
    );

interface SpacingNode {
  type: string;
  value?: string;
}

/**
 * À enregistrer pour le contenu FRANÇAIS uniquement : en anglais, « : » et
 * « ? » se collent au mot et la règle n'a pas de sens.
 *
 * Les titres sont laissés tels quels, et ce n'est pas un oubli. Leur ancre est
 * calculée à partir de leur texte, deux fois : par `rehype-slug` au rendu et
 * par fumadocs pour le sommaire, qui lit la source. github-slugger change une
 * espace en tiret mais SUPPRIME une insécable — « Pourquoi ? » donne
 * `pourquoi-`, « Pourquoi\u202F? » donne `pourquoi`. Toucher aux titres
 * casserait donc chaque lien du sommaire, et chaque ancre déjà partagée.
 */
export const remarkFrenchSpacing =
  () =>
  (tree: unknown): void => {
    visit(tree as never, (node: SpacingNode) => {
      if (node.type === "heading") {
        return SKIP;
      }

      if (node.type === "text" && node.value) {
        node.value = frenchSpacing(node.value);
      }

      return CONTINUE;
    });
  };
