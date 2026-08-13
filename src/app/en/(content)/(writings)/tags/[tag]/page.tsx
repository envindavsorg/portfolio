import type { Metadata } from "next";

import {
  buildTagMetadata,
  TagView,
  tagStaticParams,
} from "@/app/(fr)/(content)/(writings)/tags/[tag]/page";

// calculé sur le contenu ANGLAIS. Le vocabulaire est désormais partagé — un tag
// est une clé, seul son libellé est traduit — donc les deux jeux de slugs
// coïncident. Ce qui ne coïncide pas, et justifie l'appel séparé, c'est le
// CONTENU derrière chaque sujet : un article sans traduction retombe sur le FR,
// et l'index anglais doit compter ce qu'il sert vraiment.
export const generateStaticParams = () => tagStaticParams("en");

export const generateMetadata = (props: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> => buildTagMetadata({ locale: "en", ...props });

const Page = (props: { params: Promise<{ tag: string }> }) => (
  <TagView locale="en" {...props} />
);

export default Page;
