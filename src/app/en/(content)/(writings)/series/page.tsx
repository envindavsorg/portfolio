import type { Metadata } from "next";

import { SeriesIndex } from "@/app/(fr)/(content)/(writings)/series/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "The site's series: several pieces meant to be read in order, rather than in whatever order they were published.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "The series",
    type: "blog",
  },
  path: "/series",
  title: "The series",
});

const Page = () => <SeriesIndex locale="en" />;

export default Page;
