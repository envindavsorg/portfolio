import type { Metadata } from "next";

import { ArticlesIndex } from "@/app/(fr)/(content)/(writings)/articles/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "All my blog articles where I share my experience in web development.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "My blog articles",
    type: "blog",
  },
  path: "/articles",
  title: "My blog articles",
});

const Page = () => <ArticlesIndex locale="en" />;

export default Page;
