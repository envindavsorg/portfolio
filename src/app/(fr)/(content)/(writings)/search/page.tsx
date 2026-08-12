import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { SearchResults } from "@/components/features/SearchResults";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Prose } from "@/components/primitives/Typography";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { toSearchDoc } from "@/lib/search";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Cherchez dans les articles, les composants et les outils : titres, descriptions, tags, titres de sections et début du contenu.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Rechercher",
    type: "blog",
  },
  path: "/search",
  title: "Rechercher",
});

export const SearchPage = ({
  locale = "fr",
}: Readonly<{ locale?: ContentLocale }>) => {
  // même index compact que la palette ⌘K : la page est prérendue, l'index part
  // donc dans son payload une fois pour toutes
  const docs = getAllContent(locale).map(toSearchDoc);

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          { label: m.search_breadcrumb() },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.search_heading()}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{m.search_intro()}</Prose>
      </PanelContent>

      <Divider before={false} border={false} type="half" />

      <SearchResults docs={docs} />
    </div>
  );
};

const Page = () => <SearchPage />;

export default Page;
