import Link from "next/link";

import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/base/Panel";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import type { Content } from "@/lib/content";
import { getSeriesNavigation } from "@/lib/series";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

interface WritingsSeriesProps {
  current: Content;
  /** ensemble des contenus de la locale courante */
  all: Content[];
}

/**
 * Situe un contenu dans sa série et donne le sommaire complet.
 *
 * Placé en haut de la page, avant le corps : entrer au milieu d'une suite sans le
 * savoir est exactement ce que ce panneau doit éviter, et l'information arrive
 * trop tard si elle est en pied de page.
 *
 * Les flèches ←/→ restent chronologiques et ne suivent PAS la série : ce sont
 * deux ordres différents, et détourner un raccourci déjà documenté serait plus
 * déroutant qu'utile. La navigation dans la série est explicite, ici.
 */
export const WritingsSeries = ({
  current,
  all,
}: WritingsSeriesProps) => {
  const navigation = getSeriesNavigation(all, current);

  if (!navigation) {
    return null;
  }

  const { series, position, total, previous, next } = navigation;

  return (
    <Panel>
      <PanelHeader
        title={m.writings_series_title({ name: series.name })}
      />

      <PanelContent reset>
        <p className="px-3 py-2 text-muted-foreground text-sm">
          {m.writings_series_position({ position, total })}
        </p>

        <ol className="divide-y divide-edge border-edge border-t">
          {series.parts.map((part, index) => {
            const isCurrent =
              part.slug === current.slug &&
              part.metadata.category === current.metadata.category;
            const href = localizeHref(
              `/${part.metadata.category}/${part.slug}`
            );

            return (
              <li key={`${part.metadata.category}/${part.slug}`}>
                {isCurrent ? (
                  <div className="flex items-baseline justify-between gap-x-3 bg-accent px-3 py-2">
                    <span className="font-medium text-sm lowercase text-theme">
                      {index + 1}. {part.metadata.title}
                    </span>
                    <Badge className="shrink-0 lowercase">
                      {m.writings_series_current()}
                    </Badge>
                  </div>
                ) : (
                  <Link
                    aria-label={m.writings_series_part_aria({
                      position: index + 1,
                      title: part.metadata.title,
                    })}
                    className={cn(
                      "flex items-baseline justify-between gap-x-3 px-3 py-2",
                      "transition-colors hover:bg-accent focus-visible:bg-accent"
                    )}
                    href={href}
                  >
                    <span className="text-sm lowercase">
                      {index + 1}. {part.metadata.title}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-2 border-edge border-t px-3 py-2">
          {previous && (
            <Button asChild size="sm" variant="outline">
              <Link
                href={localizeHref(
                  `/${previous.metadata.category}/${previous.slug}`
                )}
              >
                ← {m.writings_series_previous()}
              </Link>
            </Button>
          )}

          {next && (
            <Button asChild size="sm" variant="outline">
              <Link
                href={localizeHref(
                  `/${next.metadata.category}/${next.slug}`
                )}
              >
                {m.writings_series_next()} →
              </Link>
            </Button>
          )}

          <Button asChild size="sm" variant="ghost">
            <Link
              className="ms-auto"
              // `series.slug` est déjà dérivé de la CLÉ de série. Recalculer un
              // slug depuis `series.name` — le libellé TRADUIT — produisait
              // /series/mon-parcours et /en/series/my-journey, deux 404, alors
              // que la seule route prérendue est /series/parcours. C'est
              // exactement le piège que la clé partagée existe pour éviter.
              href={localizeHref(`/series/${series.slug}`)}
            >
              {m.writings_series_all()}
            </Link>
          </Button>
        </div>
      </PanelContent>
    </Panel>
  );
};
