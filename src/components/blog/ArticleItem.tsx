import Link from "next/link";

import { accessibleName } from "@/lib/accessible-name";
import type { ContentLocale } from "@/lib/content";
import { formatDate } from "@/lib/functions";
import { toPlainText } from "@/lib/search";
import { tagLabel } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import { CardLink } from "../base/CardLink";
import { Divider } from "../base/Divider";
import { Button } from "../primitives/Button";
import {
  Portal,
  PortalDialog,
  PortalDialogClose,
  PortalDialogContent,
  PortalDialogDiv,
  PortalDialogOverlay,
  PortalDialogTitle,
  PortalImage,
  PortalImageWrapper,
  PortalTrigger,
} from "../primitives/Portal";
import { Prose } from "../primitives/Typography";

/** les dix fichiers de `public/images/articles` font tous 6016 × 3388 */
const BANNER_WIDTH = 6016;
const BANNER_HEIGHT = 3388;

const EXCERPT_LENGTH = 300;
const FENCED_CODE = /```[\s\S]*?```/gu;
const INLINE_CODE = /`([^`\n]+)`/gu;
const TRAILING_FRAGMENT = /\s+\S*$/u;

/**
 * L'extrait garde le TEXTE du code en ligne.
 *
 * `toPlainText` le remplace par une espace : c'est ce qu'il faut à l'index de
 * recherche, mais l'aperçu lisait « du nesting, de , des container queries ».
 * Les blocs clôturés, eux, restent écartés. La coupe se fait sur une espace
 * pour ne pas finir au milieu d'un mot.
 */
const toExcerpt = (mdx: string): string => {
  const text = toPlainText(
    mdx.replace(FENCED_CODE, " ").replace(INLINE_CODE, "$1")
  );

  return text.length > EXCERPT_LENGTH
    ? `${text.slice(0, EXCERPT_LENGTH).replace(TRAILING_FRAGMENT, "")}…`
    : text;
};

interface ArticleItemProps {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  cover?: string;
  category?: string;
  reading: {
    time: string;
    words: number;
  };
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[] | undefined;
  content: string;
  /** locale de la PAGE : libellés des sujets et choix de la vignette */
  locale?: ContentLocale;
  /** vrai pour le PREMIER élément de la liste : candidat LCP de la page */
  priority?: boolean;
}

export const ArticleItem = ({
  slug,
  title,
  description,
  image,
  cover,
  category,
  reading,
  author,
  createdAt,
  updatedAt,
  tags,
  content,
  locale = "fr",
  priority = false,
}: ArticleItemProps) => {
  // next/image exige une source définie, là où un <img> acceptait `undefined` et
  // rendait simplement une image cassée. Le repli sur l'autre champ évite de
  // perdre la vignette quand un seul des deux est renseigné.
  //
  // `image` porte le titre et la date de l'article EN PIXELS, et en français :
  // /en/articles affichait donc une liste anglaise titrée « -- écrire du CSS --,
  // 3 mars 2026 ». En anglais la carte prend `cover`, la même photo sans texte ;
  // le titre, lui, est désormais écrit dessous dans la langue de la page.
  const banner =
    locale === "en" ? (cover ?? image) : (image ?? cover);
  const href = localizeHref(`/${category}/${slug}`);

  return (
    <>
      <article>
        {banner && (
          <Portal>
            <PortalTrigger>
              <PortalImageWrapper isBanner layoutId="116">
                <PortalImage
                  // décorative : le titre est écrit juste dessous, et l'image
                  // n'est pas dans le lien — un `alt` égal au titre le ferait
                  // annoncer deux fois de suite
                  alt=""
                  // les dimensions RÉELLES du fichier. Le couple 2800 × 1280
                  // (2,19:1) réservait une boîte trop basse pour une image en
                  // 1,78:1 : la première carte descendait de 78 px au
                  // chargement.
                  height={BANNER_HEIGHT}
                  // seule la première vignette : elle est au-dessus de la ligne
                  // de flottaison et c'est très probablement l'élément LCP.
                  // react-dom refuse de hoister un préchargement tant que
                  // `loading="lazy"` est posé — et un `eager` inconditionnel
                  // retéléchargerait les cinq vignettes d'emblée, régression
                  // que le commentaire de Portal.tsx documente déjà.
                  priority={priority}
                  src={banner}
                  whileHover={{ scale: 1.05 }}
                  width={BANNER_WIDTH}
                />
              </PortalImageWrapper>
            </PortalTrigger>

            <PortalDialog>
              <PortalDialogContent>
                <PortalDialogClose />

                <PortalImageWrapper isGradient layoutId="116">
                  <PortalImage
                    alt=""
                    height={BANNER_HEIGHT}
                    // l'image du dialogue est un élément DISTINCT de la
                    // vignette, rendu à 920 px de large : le `sizes` par défaut
                    // plafonne à 768 px, donc le navigateur retenait un
                    // candidat trop petit et suréchantillonnait la couverture
                    sizes="(max-width: 768px) 96vw, 920px"
                    src={cover ?? banner}
                    width={BANNER_WIDTH}
                  />
                </PortalImageWrapper>

                <PortalDialogDiv
                  className={cn(
                    "absolute inset-0 z-10 h-130",
                    "data-[open=true]:opacity-100",
                    "data-[open=true]:delay-(--dialog-duration)",
                    "data-[open=true]:duration-(--dialog-duration-40)",
                    "data-[open=false]:opacity-0",
                    "data-[open=false]:duration-(--dialog-duration-50)"
                  )}
                >
                  <PortalDialogTitle
                    className="max-sm:hidden"
                    description={description}
                    title={title}
                  />
                </PortalDialogDiv>

                {/* `lowercase` : le dialogue est porté dans <body>, hors du
                    <main class="lowercase"> — l'auteur et l'extrait gardaient
                    leurs capitales sous un titre en minuscules */}
                <PortalDialogDiv
                  className={cn(
                    "w-full p-4 pt-4 lowercase sm:p-8",
                    "data-[open=true]:opacity-100",
                    "data-[open=true]:delay-(--dialog-duration-80)",
                    "data-[open=true]:duration-(--dialog-duration-40)",
                    "data-[open=false]:opacity-0",
                    "data-[open=false]:duration-(--dialog-duration-80)"
                  )}
                >
                  <PortalDialogTitle
                    className="pt-3 sm:hidden"
                    description={description}
                    title={title}
                  />

                  <div className="mt-6 flex items-start justify-between gap-y-4 max-sm:flex-col">
                    <div className="flex flex-col gap-y-1 max-sm:w-full">
                      <p className="font-medium text-foreground text-sm sm:text-base">
                        {author}
                      </p>
                      <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                        {m.writings_article_written_on({
                          date: formatDate(
                            createdAt,
                            "dddd, DD MMMM YYYY"
                          ),
                        })}
                      </p>

                      {/* Le lien vers l'article, plein, sous la signature :
                          visible sans défiler à 1440 × 900 comme à 390. Il
                          flottait en `absolute top-4 right-55`, petit bouton à
                          filet posé sur la photo — dans le coin haut gauche sur
                          mobile — à côté d'un second bouton qui ne faisait que
                          fermer, comme la croix. */}
                      <Button asChild className="mt-3 sm:w-fit">
                        <Link
                          aria-label={accessibleName(
                            m.writings_article_read_link(),
                            title
                          )}
                          href={href}
                          prefetch
                        >
                          {m.writings_article_read_link()}
                        </Link>
                      </Button>
                    </div>

                    <div className="flex w-fit flex-col gap-y-2 text-foreground text-xs sm:text-sm">
                      <p className="text-theme">
                        <span className="mr-1 text-muted-foreground">
                          {m.writings_article_updated_label()}
                        </span>
                        {formatDate(updatedAt, "dddd, DD MMMM YYYY")}
                      </p>
                      <p className="text-theme">
                        <span className="mr-1 text-muted-foreground">
                          {m.writings_article_reading_time_label()}
                        </span>
                        {reading.time}
                      </p>
                      <p className="text-theme">
                        <span className="mr-1 text-muted-foreground">
                          {m.writings_article_words_label()}
                        </span>
                        {m.writings_article_words_count({
                          words: reading.words,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 [&_.prose]:m-0! [&_.prose]:p-0!">
                    {/* un extrait de 300 caracteres ne justifie pas de compiler
                    tout le pipeline MDX par article : le texte brut suffit et
                    n'entraine pas le graphe client de MDX dans la page de liste */}
                    <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                      {toExcerpt(content)}
                    </p>

                    <div className="space-y-2 border-t pt-3">
                      <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                        {m.writings_article_tags_label()}
                      </p>
                      <div className="flex flex-wrap gap-x-3 text-muted-foreground text-sm sm:gap-x-6">
                        {tags?.map((tag) => (
                          <span
                            className="font-medium text-foreground"
                            key={tag}
                          >
                            #{tagLabel(tag, locale)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </PortalDialogDiv>
              </PortalDialogContent>
              <PortalDialogOverlay />
            </PortalDialog>
          </Portal>
        )}

        {/* Le texte de la carte, rendu côté serveur. La liste n'exposait que des
            images : ni titre HTML, ni lien, ni rien d'atteignable au clavier —
            le titre et la date n'existaient qu'en pixels dans la vignette. Le
            lien ne couvre que CE bloc : la vignette garde son aperçu. */}
        <div className="group/card relative flex flex-col gap-y-1.5 px-3 pb-4">
          <h2 className="text-balance text-lg sm:text-xl">
            <CardLink
              className="transition-colors group-hover/card:text-theme"
              href={href}
            >
              {title}
            </CardLink>
          </h2>

          {description && <Prose>-- {description} --</Prose>}

          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
            <time dateTime={new Date(createdAt).toISOString()}>
              {formatDate(createdAt, "LL")}
            </time>
            <span aria-hidden="true">·</span>
            <span>{reading.time}</span>
            {tags?.map((tag) => (
              <span key={tag}>#{tagLabel(tag, locale)}</span>
            ))}
          </p>
        </div>
      </article>

      <Divider border={false} type="half" />
    </>
  );
};
