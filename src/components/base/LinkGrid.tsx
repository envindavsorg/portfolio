import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export interface LinkGridItem {
  /** adresse FINALE : l'appelant a déjà appliqué `localizeHref` */
  href: string;
  label: string;
  /**
   * `page` profite du préchargement de Next ; `resource` (flux, `mailto:`)
   * est un lien nu ; `external` ouvre un nouvel onglet et le signale.
   */
  kind: "page" | "resource" | "external";
}

interface LinkGridProps extends ComponentProps<"nav"> {
  items: LinkGridItem[];
  /**
   * De quel côté des lignes passent les filets d'écran. `after` quand
   * l'élément qui précède trace déjà le haut de la grille, `before` quand c'est
   * celui qui suit qui en trace le bas — sinon deux filets se superposent.
   */
  lines?: "before" | "after";
}

/**
 * Les filets, par position dans une ligne de quatre.
 *
 * Écrits à la main plutôt qu'avec `divide-x` : dans une grille à plusieurs
 * lignes, `divide-x` borde aussi la première cellule de chaque ligne, qui
 * double alors le filet du cadre. La troisième cellule ouvre la seconde ligne
 * sur mobile, où la grille se replie en deux colonnes — d'où son filet d'écran
 * là, et son filet gauche au-delà.
 */
const CELL_LINES = {
  after: [
    "screen-line-after",
    "border-l",
    "max-sm:screen-line-after sm:border-l",
    "border-l",
  ],
  before: [
    "screen-line-before",
    "border-l",
    "max-sm:screen-line-before sm:border-l",
    "border-l",
  ],
};

const COLUMNS = 4;

const LINK_CLASSES =
  "flex items-center gap-x-1 px-3 py-2.5 text-sm transition-colors hover:bg-accent2 hover:text-theme";

const LinkGridAnchor = ({ href, kind, label }: LinkGridItem) => {
  if (kind === "page") {
    return (
      <Link className={LINK_CLASSES} href={href}>
        {label}
      </Link>
    );
  }

  if (kind === "external") {
    return (
      <a
        className={LINK_CLASSES}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
        <ArrowUpRightIcon
          aria-hidden="true"
          className="size-3 text-muted-foreground"
        />
      </a>
    );
  }

  return (
    <a className={LINK_CLASSES} href={href}>
      {label}
    </a>
  );
};

/**
 * Une grille de liens dans le langage du plan : quatre cellules par ligne,
 * séparées par les mêmes filets que le reste de la page.
 *
 * `aria-label` est attendu de l'appelant : une page porte déjà la navigation
 * principale, et deux `<nav>` sans nom sont indiscernables au lecteur d'écran.
 */
export const LinkGrid = ({
  items,
  lines = "after",
  className,
  ...props
}: LinkGridProps) => (
  <nav className={cn("border-edge border-x", className)} {...props}>
    <ul className="grid grid-cols-2 sm:grid-cols-4">
      {items.map((item, index) => (
        <li
          className={cn(
            "border-edge",
            CELL_LINES[lines][index % COLUMNS]
          )}
          key={item.href}
        >
          <LinkGridAnchor {...item} />
        </li>
      ))}
    </ul>
  </nav>
);
