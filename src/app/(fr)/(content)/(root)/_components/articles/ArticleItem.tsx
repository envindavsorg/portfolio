import Image from "next/image";

import { CardLink } from "@/components/base/CardLink";
import { Badge } from "@/components/primitives/Badge";
import { Separator } from "@/components/primitives/Separator";
import { Prose } from "@/components/primitives/Typography";
import type { Content } from "@/lib/content";
import { formatDate } from "@/lib/functions";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import { ROW_TITLE_HOVER } from "../shared/row";

interface ArticleItemProps {
  article: Content;
  noTitle?: boolean;
  noMetadata?: boolean;
}

/**
 * Les bannières animées contournent l'optimiseur d'images.
 *
 * Les quatre démos étaient des GIF non optimisés : 2 827 351 octets à eux seuls
 * sur la page qui vitrine le registre, et les DEUX variantes de thème sont dans
 * le DOM (`hidden [html.light_&]:block`), donc la seconde moitié se télécharge au
 * premier basculement. En WebP animé — même durée, mêmes dimensions, images
 * identiques dédupliquées — les quatre pèsent 204 866 octets, soit −92,8 %.
 *
 * `unoptimized` reste posé : l'optimiseur rendrait une image FIXE d'un fichier
 * animé, remplaçant la démo par sa première image. Le gain vient du format, pas
 * du redimensionnement, et il est déjà entièrement acquis.
 *
 * Le test porte sur le DOSSIER, pas sur l'extension : les bannières d'articles
 * sont aussi des .webp, mais fixes, et les exclure de l'optimiseur leur ferait
 * perdre leur srcset. C'est le script de capture qui écrit dans `*-demo/`.
 */
const ANIMATED_BANNER = /-demo\/[^/]+\.(?:gif|webp)$/u;

const isAnimated = (src: string): boolean =>
  ANIMATED_BANNER.test(src);

/**
 * Deux cartes par rangée dans une colonne plafonnée à 768 px : la bannière ne
 * dépasse jamais 372 px (343 mesurés), quelle que soit la fenêtre. `50vw`
 * faisait choisir la variante de 1920 px sur un écran de 1440 px en DPR 2, là
 * où 686 px suffisent — 15 à 17 Ko par carte au lieu de 6.
 */
const CARD_SIZES = "(max-width: 640px) 100vw, 372px";

/**
 * Les dimensions RÉELLES des bannières d'articles, comme la carte de /articles
 * (`blog/ArticleItem.tsx`). Le couple 2800 × 1280 (2,19:1) réservait ici aussi
 * une boîte trop basse pour une image en 1,78:1 : chaque rangée de cartes
 * grandissait de 33 px à l'arrivée de ses images, tardives par construction
 * (`loading="lazy"`) — sur un lien direct vers `/#my-experiences`, 66 px de
 * décalage après le défilement, une fois sur trois.
 */
const BANNER_WIDTH = 6016;
const BANNER_HEIGHT = 3388;

/** l'anneau de la bannière prend l'accent quand la carte est survolée */
const BANNER_RING =
  "ring-1 ring-border ring-offset-3 ring-offset-background transition-shadow group-hover/row:ring-theme/60";

export const ArticleItem = ({
  article,
  noTitle = false,
  noMetadata = false,
}: ArticleItemProps) => {
  const { slug, metadata, reading } = article;
  const href = localizeHref(`/${metadata.category}/${slug}`);

  return (
    <article
      className={cn(
        "group/row relative flex flex-col hover:bg-accent2",
        "max-sm:screen-line-before max-sm:screen-line-after",
        "sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after"
      )}
    >
      {/* `alt=""` sur les trois bannières : elles illustrent un titre écrit
          juste dessous, et ne sont plus DANS le lien — un `alt` égal au titre
          le ferait annoncer deux fois de suite */}
      {/* 16 px ici, 12 px pour le texte : l'anneau de l'image déborde de 4 px
          (`ring-offset-3` + `ring-1`), c'est lui qui s'aligne sur le rail */}
      <div className="p-4">
        {metadata.image && (
          <Image
            alt=""
            className={cn(
              "w-full rounded-md object-cover object-center sm:min-h-40",
              BANNER_RING
            )}
            height={BANNER_HEIGHT}
            quality={90}
            // pas de `priority` : ces cartes sont sous la ligne de flottaison,
            // et cinq preloads prioritaires concurrents retardaient le LCP
            sizes={CARD_SIZES}
            src={metadata.image}
            width={BANNER_WIDTH}
          />
        )}

        {metadata.bannerLight && (
          <Image
            alt=""
            className={cn(
              "hidden [html.light_&]:block",
              "w-full rounded-md object-cover object-center sm:aspect-video",
              BANNER_RING
            )}
            height={630}
            quality={75}
            sizes={CARD_SIZES}
            src={metadata.bannerLight}
            unoptimized={isAnimated(metadata.bannerLight)}
            width={1200}
          />
        )}

        {metadata.bannerDark && (
          <Image
            alt=""
            className={cn(
              "hidden [html.dark_&]:block",
              "w-full rounded-md object-cover object-center sm:aspect-video",
              BANNER_RING
            )}
            height={630}
            quality={75}
            sizes={CARD_SIZES}
            src={metadata.bannerDark}
            unoptimized={isAnimated(metadata.bannerDark)}
            width={1200}
          />
        )}
      </div>

      <Separator />

      <div className="flex-1 px-3 py-4">
        {noTitle ? (
          <h2
            className={cn(
              "text-balance text-sm lowercase sm:text-base",
              ROW_TITLE_HOVER
            )}
          >
            <CardLink href={href}>{metadata.description}</CardLink>
          </h2>
        ) : (
          <div className="flex flex-col gap-y-1">
            <h2
              className={cn(
                "text-base lowercase sm:text-xl",
                ROW_TITLE_HOVER
              )}
            >
              <CardLink href={href}>{metadata.title}</CardLink>
            </h2>
            <Prose className="lowercase">
              -- {metadata.description} --
            </Prose>
          </div>
        )}

        {!noMetadata && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-edge border-t pt-4 sm:gap-x-4">
            {/* l'accent ne marque que la date. Les trois badges étaient en
              variante `primary` — douze pastilles d'accent sur la section —
              alors que partout ailleurs sur la page un badge est neutre et
              seule sa valeur est colorée */}
            <Badge>
              <span>
                {formatDate(metadata.createdAt, "ddd DD MMM")}
              </span>
            </Badge>
            <Badge>{reading?.time}</Badge>
            <Badge>
              {m.home_articles_item_words({ words: reading?.words })}
            </Badge>
          </div>
        )}
      </div>
    </article>
  );
};
