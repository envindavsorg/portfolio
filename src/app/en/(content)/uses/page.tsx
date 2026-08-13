import type { Metadata } from "next";

import { UsesPage } from "@/app/(fr)/(content)/uses/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "The tools florin cuzeac works with: this site's stack, the languages, the tooling and the services it depends on.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "What I use",
    type: "blog",
  },
  path: "/uses",
  title: "What I use",
});

const Page = () => <UsesPage locale="en" />;

export default Page;
