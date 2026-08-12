import type { Metadata } from "next";
import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Badge } from "@/components/primitives/Badge";
import { Prose } from "@/components/primitives/Typography";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { getSeriesIndex } from "@/lib/series";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Les séries du site : plusieurs contenus qui se lisent dans l'ordre, plutôt qu'au hasard de la chronologie.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Les séries",
    type: "blog",
  },
  path: "/series",
  title: "Les séries",
});

export const SeriesIndex = ({
  locale = "fr",
}: Readonly<{ locale?: ContentLocale }>) => {
  const series = getSeriesIndex(getAllContent(locale));

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          { label: m.writings_breadcrumb_series() },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.writings_series_index_heading()}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{m.writings_series_index_intro()}</Prose>
        <Prose>
          {m.writings_series_index_count({ count: series.length })}
        </Prose>
      </PanelContent>

      {series.length === 0 ? (
        <p className="p-3 text-sm">
          {m.writings_series_index_empty()}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-edge">
          {series.map((entry) => (
            <li key={entry.slug}>
              <Link
                className="flex flex-col gap-y-2 px-3 py-4 transition-colors hover:bg-accent focus-visible:bg-accent"
                href={localizeHref(`/series/${entry.slug}`)}
              >
                <span className="flex items-baseline justify-between gap-x-3">
                  <span className="font-medium text-base lowercase">
                    {entry.name}
                  </span>
                  <Badge className="shrink-0 lowercase">
                    {m.writings_series_index_parts({
                      count: entry.parts.length,
                    })}
                  </Badge>
                </span>

                <span className="text-muted-foreground text-sm">
                  {entry.parts
                    .map((part) => part.metadata.title)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Page = () => <SeriesIndex />;

export default Page;
