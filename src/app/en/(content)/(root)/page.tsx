import type { Metadata } from "next";

import HomePage from "@/app/(fr)/(content)/(root)/page";
import GLOBAL_DATA from "@/data/global";
import { createMetadata, homeIdentity } from "@/lib/metadata";
import * as m from "@/paraglide/messages";

export const revalidate = 3600;

// La locale est passée explicitement : `metadata` est évalué au chargement du
// module, avant que le layout ait posé celle de la requête. L'accroche était
// écrite en dur ici (« the little details matter ») et s'écartait d'un mot du
// message que la page affiche (« the small details matter »).
const bio = m.user_bio(undefined, { locale: "en" });
const home = homeIdentity(
  m.user_job_title(undefined, { locale: "en" }),
  bio
);

export const metadata: Metadata = createMetadata({
  absoluteTitle: home.title,
  description: home.description,
  locale: "en",
  ogImageParams: {
    description: bio,
    title: GLOBAL_DATA.USER.fullName,
    type: "homepage",
  },
  path: "/",
  title: GLOBAL_DATA.USER.fullName,
});

const Page = () => <HomePage />;

export default Page;
