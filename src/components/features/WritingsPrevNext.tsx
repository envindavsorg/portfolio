import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import type { Content } from "@/lib/content";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

interface WritingsPrevNextProps {
  item: Content;
  /** les contenus de la même catégorie, dans l'ordre de la liste */
  items: Content[];
}

const LINK_CLASSNAME = cn(
  "group flex flex-col gap-y-1 px-3 py-4",
  "transition-colors hover:bg-accent2 focus-visible:bg-accent2"
);

const TITLE_CLASSNAME = cn(
  "text-balance font-medium text-sm sm:text-base",
  "transition-colors group-hover:text-theme"
);

/**
 * Précédent / suivant, en fin de contenu.
 *
 * Les deux flèches de la barre du haut étaient la seule pagination : arrivé au
 * bas d'un article de 4 000 px, il fallait remonter pour passer au suivant. Et
 * leur destination n'existe que dans une infobulle — donc jamais au doigt.
 *
 * Même ordre que ces flèches et que ←/→ (`WritingsTopBar`) : celui de la liste,
 * où « précédent » est le contenu plus récent. Deux sens différents pour la
 * même paire de mots, sur la même page, seraient pires qu'aucun lien.
 */
export const WritingsPrevNext = ({
  item,
  items,
}: WritingsPrevNextProps) => {
  const index = items.findIndex(({ slug }) => slug === item.slug);

  if (index === -1) {
    return null;
  }

  const previous = items[index - 1];
  const next = items[index + 1];

  if (!(previous || next)) {
    return null;
  }

  const { category } = item.metadata;

  return (
    <>
      <nav
        aria-label={m.writings_pagination_nav_aria()}
        className="grid sm:grid-cols-2"
        data-print="hide"
      >
        {previous && (
          <Link
            className={cn(
              LINK_CLASSNAME,
              "sm:border-edge sm:border-r"
            )}
            href={localizeHref(`/${category}/${previous.slug}`)}
          >
            <span className="text-muted-foreground text-xs">
              <span aria-hidden="true">← </span>
              {m.writings_pagination_previous_sr()}
            </span>
            <span className={TITLE_CLASSNAME}>
              {previous.metadata.title}
            </span>
          </Link>
        )}

        {next && (
          <Link
            className={cn(
              LINK_CLASSNAME,
              "sm:col-start-2 sm:items-end sm:text-right",
              // un seul filet entre les deux moitiés, quel que soit le lien
              // présent : vertical dès 640 px, horizontal en dessous
              previous
                ? "max-sm:border-edge max-sm:border-t"
                : "sm:border-edge sm:border-l"
            )}
            href={localizeHref(`/${category}/${next.slug}`)}
          >
            <span className="text-muted-foreground text-xs">
              {m.writings_pagination_next_sr()}
              <span aria-hidden="true"> →</span>
            </span>
            <span className={TITLE_CLASSNAME}>
              {next.metadata.title}
            </span>
          </Link>
        )}
      </nav>

      <Divider border={false} type="half" />
    </>
  );
};
