import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { SearchResults } from "@/components/features/SearchResults";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Prose } from "@/components/primitives/Typography";
import { createMetadata } from "@/lib/metadata";
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

/**
 * La page ne prend plus de locale côté serveur : l'index n'est plus construit
 * ici, il est chargé par le client, qui connaît déjà la sienne. Les deux arbres
 * rendent donc exactement la même vue.
 */
export const SearchPage = () => (
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

    <SearchResults />
  </div>
);

const Page = () => <SearchPage />;

export default Page;
