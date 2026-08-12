import Link from "next/link";

import { Badge } from "@/components/primitives/Badge";
import type { Content } from "@/lib/content";
import { formatDate } from "@/lib/functions";
import { cn } from "@/lib/utils";
import { localizeHref } from "@/paraglide/runtime";

interface WritingsContentListProps {
  items: Content[];
  className?: string;
}

/**
 * Liste compacte de contenus, toutes catégories mélangées.
 *
 * Les index de catégorie utilisent `ArticleItem`, qui suppose un article et
 * embarque son portail d'image. Une page de sujet mélange articles, composants
 * et outils : le badge de catégorie devient l'information utile, et une liste
 * légère vaut mieux qu'un portail par ligne.
 */
export const WritingsContentList = ({
  items,
  className,
}: WritingsContentListProps) => (
  <ul className={cn("flex flex-col divide-y divide-edge", className)}>
    {items.map(({ metadata, slug, reading }) => {
      const { category, title, description, createdAt } = metadata;

      return (
        <li key={`${category}/${slug}`}>
          <Link
            className="flex flex-col gap-y-1.5 px-3 py-4 transition-colors hover:bg-accent focus-visible:bg-accent"
            href={localizeHref(`/${category}/${slug}`)}
          >
            <span className="flex items-baseline justify-between gap-x-3">
              <span className="font-medium text-base lowercase">
                {title}
              </span>
              <Badge className="shrink-0 lowercase">{category}</Badge>
            </span>

            <span className="text-muted-foreground text-sm">
              {description}
            </span>

            <span className="flex items-center gap-x-2 text-muted-foreground text-xs">
              <time dateTime={new Date(createdAt).toISOString()}>
                {formatDate(createdAt, "DD MMMM YYYY")}
              </time>
              <span aria-hidden="true">·</span>
              <span>{reading.time}</span>
            </span>
          </Link>
        </li>
      );
    })}
  </ul>
);
