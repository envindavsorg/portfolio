import type { Metadata } from "next";

import { ComponentsIndex } from "@/app/(fr)/(content)/(writings)/components/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "My collection of reusable React snippets for all your projects.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "React components",
    type: "components",
  },
  path: "/components",
  title: "React components",
});

const Page = () => <ComponentsIndex locale="en" />;

export default Page;
