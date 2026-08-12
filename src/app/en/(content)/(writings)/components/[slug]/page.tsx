import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ComponentView,
  generateStaticParams,
} from "@/app/(fr)/(content)/(writings)/components/[slug]/page";
import { getContentBySlug } from "@/lib/content";
import { createContentMetadata } from "@/lib/metadata";

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

  return createContentMetadata(component, "en");
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ComponentView locale="en" slug={slug} />;
};

export default Page;
