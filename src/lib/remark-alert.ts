import { visit } from "unist-util-visit";

/**
 * Les encarts d'avertissement, en syntaxe d'alertes GitHub.
 *
 * `remark-gfm` ne transforme PAS `> [!NOTE]` : il rend un blockquote contenant
 * le texte littéral `[!NOTE]`. Les mises en garde durement acquises des articles
 * — ne jamais utiliser @apply, le compromis nonce/CSP, le piège Zod jitless — se
 * lisaient donc comme des paragraphes ordinaires, à côté du reste.
 *
 * La syntaxe est celle de GitHub à dessein : le contenu reste lisible tel quel
 * dans le miroir /llms.txt et sur GitHub, où ces fichiers sont aussi consultés.
 * Un composant MDX maison n'aurait ce rendu que sur le site.
 *
 * Le plugin ne construit pas de nœud JSX : il repose le blockquote en élément
 * `Callout` via `data.hName`, que la table de composants MDX résout. C'est le
 * mécanisme prévu par mdast-util-to-hast, et il évite de manipuler un AST MDX.
 */

export const ALERT_KINDS = [
  "note",
  "tip",
  "important",
  "warning",
  "caution",
] as const;

export type AlertKind = (typeof ALERT_KINDS)[number];

/** `[!NOTE]` en tête du premier paragraphe, insensible à la casse comme GitHub */
const MARKER = /^\[!(note|tip|important|warning|caution)\]\s*/iu;

interface TextNode {
  type: "text";
  value: string;
}

interface ParentNode {
  type: string;
  children?: (ParentNode | TextNode)[];
  data?: {
    hName?: string;
    hProperties?: Record<string, string>;
  };
}

const isText = (node: ParentNode | TextNode): node is TextNode =>
  node.type === "text";

/**
 * Reconnaît un blockquote d'alerte et renvoie son genre.
 *
 * Exporté pour être testable seul : c'est la seule partie du plugin qui décide
 * quelque chose, et un test sur l'arbre entier dirait mal ce qui a échoué.
 */
export const readAlertKind = (
  blockquote: ParentNode
): AlertKind | null => {
  const [paragraph] = blockquote.children ?? [];

  // `paragraph?.type` vaut `undefined` sur un tableau vide, donc la
  // comparaison couvre l'absence comme le mauvais type
  if (paragraph?.type !== "paragraph") {
    return null;
  }

  const [first] = (paragraph as ParentNode).children ?? [];

  if (!(first && isText(first))) {
    return null;
  }

  const match = MARKER.exec(first.value);

  return match ? (match[1].toLowerCase() as AlertKind) : null;
};

export const remarkAlert =
  () =>
  (tree: unknown): void => {
    visit(tree as never, "blockquote", (node: ParentNode) => {
      const kind = readAlertKind(node);

      if (!kind) {
        return;
      }

      const [paragraph] = node.children ?? [];
      const children = (paragraph as ParentNode).children ?? [];
      const [first] = children;

      if (first && isText(first)) {
        // retirer le marqueur, et le paragraphe entier s'il ne contenait que
        // lui — sinon l'encart s'ouvrirait sur une ligne vide
        first.value = first.value.replace(MARKER, "");

        if (first.value === "" && children.length === 1) {
          node.children = (node.children ?? []).slice(1);
        }
      }

      node.data = {
        ...node.data,
        hName: "Callout",
        hProperties: { kind },
      };
    });
  };
