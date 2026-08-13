import type { Metadata } from "next";

import { ProjectsIndex } from "@/app/(fr)/(content)/projects/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "florin cuzeac's projects, one by one: what they do, why they exist and what they are built with.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "Projects",
    type: "project",
  },
  path: "/projects",
  title: "Projects",
});

const Page = () => <ProjectsIndex locale="en" />;

export default Page;
