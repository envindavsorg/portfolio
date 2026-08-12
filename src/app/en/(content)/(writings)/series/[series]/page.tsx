import type { Metadata } from "next";

import {
  buildSeriesMetadata,
  SeriesView,
} from "@/app/(fr)/(content)/(writings)/series/[series]/page";

export { generateStaticParams } from "@/app/(fr)/(content)/(writings)/series/[series]/page";

export const generateMetadata = (props: {
  params: Promise<{ series: string }>;
}): Promise<Metadata> =>
  buildSeriesMetadata({ locale: "en", ...props });

const Page = (props: { params: Promise<{ series: string }> }) => (
  <SeriesView locale="en" {...props} />
);

export default Page;
