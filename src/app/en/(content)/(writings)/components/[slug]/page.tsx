import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ComponentView,
  generateStaticParams,
} from "@/app/(fr)/(content)/(writings)/components/[slug]/page";
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
  const component = getContentBySlug(slug, "components", "en");
  if (!component) {
    return notFound();
  }

  const { title, description, category } = component.metadata;
  return createMetadata({
    description,
    locale: "en",
    ogImageParams: {
      description,
      title,
      type: "componentsArticle",
    },
    path: `/${category}/${slug}`,
    title,
  });
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ComponentView locale="en" slug={slug} />;
};

export default Page;
