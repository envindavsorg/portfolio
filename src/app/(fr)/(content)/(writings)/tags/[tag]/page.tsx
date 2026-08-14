import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsContentList } from "@/components/features/WritingsContentList";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Prose } from "@/components/primitives/Typography";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import {
  getContentByTagSlug,
  getTagBySlug,
  getTagIndex,
} from "@/lib/tags";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * Les slugs d'une locale sont calculés depuis le contenu de CETTE locale.
 *
 * Une version antérieure dérivait les deux arbres du seul index français, sur la
 * foi d'un commentaire qui affirmait que « le frontmatter anglais reprend les
 * tags FR ». C'était faux : le frontmatter EN traduisait une partie de ses tags.
 * Les deux sujets FR sans équivalent — `carriere` et `retour-d-experience` —
 * étaient PRÉRENDUS EN 404 sous /en tout en étant annoncés au sitemap, et les
 * quatre slugs EN réellement liés depuis les articles anglais (`career`,
 * `lessons-learned`, `text`, `colors`) n'étaient prérendus nulle part.
 *
 * La migration annoncée ici est faite : un tag est désormais une CLÉ partagée,
 * doublée d'un libellé traduit — le motif de `series` / `seriesName`. Les deux
 * arbres produisent donc les mêmes slugs, chaque sujet a son équivalent
 * hreflang, et une URL de sujet partagée retombe sur le même contenu dans les
 * deux langues.
 *
 * Le calcul par locale reste néanmoins juste, et pas seulement par prudence : les
 * COMPTES et les catégories d'un sujet dépendent du contenu de la locale servie.
 */
export const tagStaticParams = (locale: ContentLocale) =>
  getTagIndex(getAllContent(locale), locale).map((tag) => ({
    tag: tag.slug,
  }));

export const generateStaticParams = () => tagStaticParams("fr");

export const buildTagMetadata = async ({
  locale = "fr",
  params,
}: {
  locale?: ContentLocale;
  params: Promise<{ tag: string }>;
}): Promise<Metadata> => {
  const { tag: slug } = await params;
  const tag = getTagBySlug(getAllContent(locale), slug, locale);

  if (!tag) {
    return {};
  }

  const title =
    locale === "en" ? `Topic: ${tag.label}` : `Sujet : ${tag.label}`;
  const description =
    locale === "en"
      ? `Every article, component and tool tagged ${tag.label} — ${tag.count} in total.`
      : `Tous les articles, composants et outils portant le tag ${tag.label} — ${tag.count} au total.`;

  return createMetadata({
    description,
    locale,
    ogImageParams: { description, title, type: "blog" },
    path: `/tags/${tag.slug}`,
    title,
  });
};

export const generateMetadata = (props: {
  params: Promise<{ tag: string }>;
}) => buildTagMetadata(props);

export const TagView = async ({
  locale = "fr",
  params,
}: {
  locale?: ContentLocale;
  params: Promise<{ tag: string }>;
}) => {
  const { tag: slug } = await params;
  const contents = getAllContent(locale);
  const tag = getTagBySlug(contents, slug, locale);

  if (!tag) {
    notFound();
  }

  const items = getContentByTagSlug(contents, slug);

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          {
            href: localizeHref("/tags"),
            label: m.writings_breadcrumb_tags(),
          },
          { label: tag.label },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.writings_tag_heading({ tag: tag.label })}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>
          {m.writings_tag_content_count({ count: tag.count })}
        </Prose>

        {/* deux orthographes peuvent produire le même slug ; le dire évite de
            laisser croire à une coquille dans le contenu */}
        {tag.variants.length > 1 && (
          <Prose>
            {m.writings_tag_variants({
              variants: tag.variants.join(", "),
            })}
          </Prose>
        )}

        {/*
          Une LISTE, pas un `role="group"`. Ce sont des rubriques énumérées, pas
          un groupe de contrôles : un lecteur d'écran annonce ainsi leur nombre
          et permet de les parcourir, ce qu'un groupe ne fait pas.
        */}
        <ul
          aria-label={m.writings_tag_categories_aria()}
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          {tag.categories.map((category) => (
            <li key={category}>
              <Badge className="lowercase">{category}</Badge>
            </li>
          ))}
        </ul>
      </PanelContent>

      <WritingsContentList items={items} />

      <div className="screen-line-before flex flex-wrap items-center gap-2 p-3">
        <Button asChild size="sm" variant="outline">
          <Link href={localizeHref("/tags")}>
            {m.writings_tag_all_topics()}
          </Link>
        </Button>

        <Button asChild size="sm" variant="outline">
          <Link
            aria-label={m.writings_tag_feed_aria({ tag: tag.label })}
            href={`/api/rss/tag/${tag.slug}`}
          >
            {m.writings_tag_feed()}
          </Link>
        </Button>
      </div>
    </div>
  );
};

const TagPage = (props: { params: Promise<{ tag: string }> }) => (
  <TagView {...props} />
);

export default TagPage;
