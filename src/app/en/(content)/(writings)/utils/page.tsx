import type { Metadata } from "next";

import { UtilsIndex } from "@/app/(fr)/(content)/(writings)/utils/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "A suite of free web tools designed to optimize your workflow and boost your productivity";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "Web tools suite",
    type: "utils",
  },
  path: "/utils",
  title: "Web tools suite",
});

const Page = () => <UtilsIndex locale="en" />;

export default Page;
