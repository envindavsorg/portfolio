import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsContentList } from "@/components/features/WritingsContentList";
import { Prose } from "@/components/primitives/Typography";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { getSeriesBySlug, getSeriesIndex } from "@/lib/series";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * Les slugs viennent du contenu français, comme pour les sujets : un slug qui
 * n'existerait que dans une locale donnerait une page sans équivalent hreflang.
 * Une série dont seule la traduction anglaise porte un nom différent reste donc
 * accessible sous le slug français, ce qui est le comportement voulu.
 */
export const generateStaticParams = () =>
  getSeriesIndex(getAllContent()).map((series) => ({
    series: series.slug,
  }));

export const buildSeriesMetadata = async ({
  locale = "fr",
  params,
}: {
  locale?: ContentLocale;
  params: Promise<{ series: string }>;
}): Promise<Metadata> => {
  const { series: slug } = await params;
  const series = getSeriesBySlug(getAllContent(locale), slug);

  if (!series) {
    return {};
  }

  const title =
    locale === "en"
      ? `Series: ${series.name}`
      : `Série : ${series.name}`;
  const description =
    locale === "en"
      ? `${series.name} — ${series.parts.length} parts, meant to be read in order.`
      : `${series.name} — ${series.parts.length} parties, à lire dans l'ordre.`;

  return createMetadata({
    description,
    locale,
    ogImageParams: { description, title, type: "blog" },
    path: `/series/${series.slug}`,
    title,
  });
};

export const generateMetadata = (props: {
  params: Promise<{ series: string }>;
}) => buildSeriesMetadata(props);

export const SeriesView = async ({
  locale = "fr",
  params,
}: {
  locale?: ContentLocale;
  params: Promise<{ series: string }>;
}) => {
  const { series: slug } = await params;
  const series = getSeriesBySlug(getAllContent(locale), slug);

  if (!series) {
    notFound();
  }

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          {
            href: localizeHref("/series"),
            label: m.writings_breadcrumb_series(),
          },
          { label: series.name },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {series.name}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>
          {m.writings_series_index_parts({
            count: series.parts.length,
          })}
        </Prose>
      </PanelContent>

      {/* l'ordre de lecture, pas l'ordre chronologique : c'est tout l'objet
          d'une série */}
      <WritingsContentList items={series.parts} />
    </div>
  );
};

const Page = (props: { params: Promise<{ series: string }> }) => (
  <SeriesView {...props} />
);

export default Page;
