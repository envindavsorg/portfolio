import type { Metadata } from "next";

import { SearchPage } from "@/app/(fr)/(content)/(writings)/search/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "Search the articles, components and tools: titles, descriptions, tags, section headings and the start of the content.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "Search",
    type: "blog",
  },
  path: "/search",
  title: "Search",
});

const Page = () => <SearchPage />;

export default Page;
