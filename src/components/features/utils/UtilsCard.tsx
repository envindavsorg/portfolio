import { useCallback } from "react";

import { CardLink } from "@/components/base/CardLink";
import { Prose } from "@/components/primitives/Typography";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import { trackVisit } from "./lib";
import type { UtilsItem } from "./types";

interface UtilsCardProps {
  item: UtilsItem;
  noDescription?: boolean;
}

export const UtilsCard = ({
  item,
  noDescription,
}: UtilsCardProps) => {
  const handleClick = useCallback(() => {
    trackVisit(item.slug);
  }, [item.slug]);

  return (
    <article className="group/article relative flex select-none flex-col">
      <div className="flex w-full items-center justify-between p-3 group-hover/article:bg-accent2">
        <h2
          className={cn(
            "font-pixel-square lowercase",
            noDescription
              ? "sm:text-base text-sm text-theme"
              : "sm:text-xl text-lg transition-colors group-hover/article:text-theme"
          )}
        >
          <CardLink
            href={localizeHref(`/utils/${item.slug}`)}
            onClick={handleClick}
            prefetch={false}
          >
            {item.metadata.title}
          </CardLink>
        </h2>
        {item.metadata.isNew && (
          <div className="flex items-center gap-x-2">
            {/* Un point fixe, et non `PulsatingCircle` : neuf outils sur
                quatorze portent ce badge, donc neuf animations infinies sur
                une seule page, que `prefers-reduced-motion` n'arrêtait pas.
                Le battement reste à ce qui est « en cours » — le poste
                actuel, un test de débit qui tourne. */}
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-theme"
            />
            {/* `sr-only` et non `hidden` sous md : un point seul ne dit rien
                à un lecteur d'écran */}
            <span className="text-sm text-theme max-md:sr-only">
              {m.utils_card_new_badge()}
            </span>
          </div>
        )}
      </div>

      {!noDescription && (
        <div className="border-t border-edge px-3 py-1.5">
          <Prose className="lowercase">
            -- {item.metadata.description} --
          </Prose>
        </div>
      )}
    </article>
  );
};
