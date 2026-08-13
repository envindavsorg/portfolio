import type { Metadata } from "next";

import { WeightPage } from "@/app/(fr)/(content)/weight/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "The real weight of every page type on this site, measured in a real browser: JavaScript, fonts, CSS, images and document.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "How much this site weighs",
    type: "blog",
  },
  path: "/weight",
  title: "How much this site weighs",
});

const Page = () => <WeightPage locale="en" />;

export default Page;
