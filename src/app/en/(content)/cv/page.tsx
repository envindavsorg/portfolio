import type { Metadata } from "next";

import { CvPage } from "@/app/(fr)/(content)/cv/page";
import { createMetadata } from "@/lib/metadata";

const pageDescription =
  "florin cuzeac's full career: experience, education, certifications and skills, on a single printable page.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: "Résumé",
    type: "blog",
  },
  path: "/cv",
  title: "Résumé",
});

const Page = () => <CvPage locale="en" />;

export default Page;
