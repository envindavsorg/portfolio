import Link from "next/link";

import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Badge } from "@/components/primitives/Badge";
import type { Content } from "@/lib/content";
import { getRelatedContent } from "@/lib/related";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

interface WritingsRelatedProps {
  current: Content;
  /** ensemble des contenus de la locale courante, toutes catégories */
  all: Content[];
}

export const WritingsRelated = ({
  current,
  all,
}: WritingsRelatedProps) => {
  const related = getRelatedContent(current, all);

  // rien de proche : on n'affiche pas une section vide
  if (related.length === 0) {
    return null;
  }

  return (
    <Panel>
      <PanelHeader title={m.writings_related_title()} />

      <PanelContent reset>
        <ul className="divide-y divide-edge">
          {related.map(({ content, shared }) => {
            const { category, title, description, tags } =
              content.metadata;

            return (
              <li key={`${category}/${content.slug}`}>
                <Link
                  className="flex flex-col gap-y-1 px-3 py-3 transition-colors hover:bg-accent focus-visible:bg-accent"
                  href={localizeHref(`/${category}/${content.slug}`)}
                >
                  <span className="flex items-baseline justify-between gap-x-3">
                    <span className="font-medium text-sm lowercase">
                      {title}
                    </span>
                    <Badge className="shrink-0 lowercase">
                      {category}
                    </Badge>
                  </span>

                  <span className="line-clamp-2 text-muted-foreground text-xs">
                    {description}
                  </span>

                  <span className="sr-only">
                    {m.writings_related_shared_tags({
                      count: shared,
                      tags: (tags ?? [])
                        .filter((tag) =>
                          (current.metadata.tags ?? []).some(
                            (own) =>
                              own.toLowerCase() === tag.toLowerCase()
                          )
                        )
                        .join(", "),
                    })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </PanelContent>
    </Panel>
  );
};
