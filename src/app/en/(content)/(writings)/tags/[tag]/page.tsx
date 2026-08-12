import type { Metadata } from "next";

import {
  buildTagMetadata,
  tagStaticParams,
  TagView,
} from "@/app/(fr)/(content)/(writings)/tags/[tag]/page";

// et NON un ré-export de celui du FR : le vocabulaire de tags diverge entre les
// locales, donc réutiliser l'index français prérendait /en/tags/carriere en 404
// et laissait /en/tags/career hors du build
export const generateStaticParams = () => tagStaticParams("en");

export const generateMetadata = (props: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> => buildTagMetadata({ locale: "en", ...props });

const Page = (props: { params: Promise<{ tag: string }> }) => (
  <TagView locale="en" {...props} />
);

export default Page;
