import type { Metadata } from "next";

import HomePage from "@/app/(fr)/(content)/(root)/page";
import GLOBAL_DATA from "@/data/global";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 3600;

const pageDescription =
  "creates, codes, innovates. the little details matter.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  locale: "en",
  ogImageParams: {
    description: pageDescription,
    title: GLOBAL_DATA.USER.fullName,
    type: "homepage",
  },
  path: "/",
  title: GLOBAL_DATA.USER.fullName,
});

const Page = () => <HomePage />;

export default Page;
