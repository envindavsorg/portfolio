import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  generateStaticParams,
  UtilView,
} from "@/app/(fr)/(content)/(writings)/utils/[slug]/page";
import { getContentBySlug } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export { generateStaticParams };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const util = getContentBySlug(slug, "utils", "en");
  if (!util) {
    return notFound();
  }

  const { title, description, category } = util.metadata;
  return createMetadata({
    description,
    locale: "en",
    ogImageParams: { description, title, type: "utilsArticle" },
    path: `/${category}/${slug}`,
    title,
  });
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <UtilView locale="en" slug={slug} />;
};

export default Page;
