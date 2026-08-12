import type { Metadata } from "next";

import {
  buildTagMetadata,
  TagView,
} from "@/app/(fr)/(content)/(writings)/tags/[tag]/page";

export { generateStaticParams } from "@/app/(fr)/(content)/(writings)/tags/[tag]/page";

export const generateMetadata = (props: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> => buildTagMetadata({ locale: "en", ...props });

const Page = (props: { params: Promise<{ tag: string }> }) => (
  <TagView locale="en" {...props} />
);

export default Page;
