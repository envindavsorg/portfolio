import type { Metadata } from "next";

import { TagsIndex } from "@/app/(fr)/(content)/(writings)/tags/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "Every topic covered on the site: each tag gathers the articles, components and tools that touch it.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "All topics",
    type: "blog",
  },
  path: "/tags",
  title: "All topics",
});

const Page = () => <TagsIndex locale="en" />;

export default Page;
