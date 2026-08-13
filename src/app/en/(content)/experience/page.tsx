import type { Metadata } from "next";

import { ExperienceIndex } from "@/app/(fr)/(content)/experience/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "florin cuzeac's career, role by role: the context, the responsibilities and the stack of each one.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "Experience",
    type: "experience",
  },
  path: "/experience",
  title: "Experience",
});

const Page = () => <ExperienceIndex locale="en" />;

export default Page;
