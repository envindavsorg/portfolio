import type { Metadata } from "next";

import {
  buildExperienceMetadata,
  experienceStaticParams,
  ExperienceView,
} from "@/app/(fr)/(content)/experience/[slug]/page";

// mêmes slugs que l'arbre français : l'`id` d'un poste ne se traduit pas
export const generateStaticParams = () => experienceStaticParams();

export const generateMetadata = (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> =>
  buildExperienceMetadata({ locale: "en", ...props });

const Page = (props: { params: Promise<{ slug: string }> }) => (
  <ExperienceView locale="en" {...props} />
);

export default Page;
