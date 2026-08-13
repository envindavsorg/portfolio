import type { Metadata } from "next";

import {
  buildProjectMetadata,
  ProjectView,
  projectStaticParams,
} from "@/app/(fr)/(content)/projects/[slug]/page";

// le slug est l'`id` du projet, identique dans les deux langues : les paramètres
// statiques sont donc bien les mêmes qu'en français, et c'est ce qui permet au
// sitemap de déclarer une paire hreflang par projet
export const generateStaticParams = () => projectStaticParams();

export const generateMetadata = (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> =>
  buildProjectMetadata({ locale: "en", ...props });

const Page = (props: { params: Promise<{ slug: string }> }) => (
  <ProjectView locale="en" {...props} />
);

export default Page;
