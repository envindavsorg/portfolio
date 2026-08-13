import type { Metadata } from "next";

import { NowPage } from "@/app/(fr)/(content)/now/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "What florin cuzeac is working on right now: current role, latest writing and latest certification.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "Right now",
    type: "blog",
  },
  path: "/now",
  title: "Right now",
});

const Page = () => <NowPage locale="en" />;

export default Page;
