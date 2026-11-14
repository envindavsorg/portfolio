import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type {
  ProfilePage as PageSchema,
  WithContext,
} from "schema-dts";

import { Articles } from "@/app/(fr)/(content)/(root)/_components/articles/Articles";
import { Branding } from "@/app/(fr)/(content)/(root)/_components/branding/Branding";
import { Certs } from "@/app/(fr)/(content)/(root)/_components/certs/Certs";
import { Commits } from "@/app/(fr)/(content)/(root)/_components/commits/Commits";
import { Cover } from "@/app/(fr)/(content)/(root)/_components/cover/Cover";
import { Cv } from "@/app/(fr)/(content)/(root)/_components/cv/Cv";
import { Experiences } from "@/app/(fr)/(content)/(root)/_components/experiences/Experiences";
import { Header } from "@/app/(fr)/(content)/(root)/_components/header/Header";
import { Overview } from "@/app/(fr)/(content)/(root)/_components/overview/Overview";
import { Projects } from "@/app/(fr)/(content)/(root)/_components/projects/Projects";
import { Repos } from "@/app/(fr)/(content)/(root)/_components/repos/Repos";
import { TechStack } from "@/app/(fr)/(content)/(root)/_components/stack/Stack";
import { Tools } from "@/app/(fr)/(content)/(root)/_components/tools/Tools";
import { Divider } from "@/components/base/Divider";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import GLOBAL_DATA from "@/data/global";
import { getAllContent } from "@/lib/content";
import { latestUpdate } from "@/lib/content-dates";
import { dayjs } from "@/lib/functions";
import { PERSON_ID } from "@/lib/json-ld";
import { createMetadata, homeIdentity } from "@/lib/metadata";

const About = dynamic(async () => {
  const mod = await import(
    "@/app/(fr)/(content)/(root)/_components/about/About"
  );
  return mod.About;
});

export const revalidate = 3600;

const home = homeIdentity(
  GLOBAL_DATA.WORK.title,
  GLOBAL_DATA.USER.bio
);

export const metadata: Metadata = createMetadata({
  absoluteTitle: home.title,
  description: home.description,
  ogImageParams: {
    // la carte garde l'accroche seule : son pied porte déjà le métier
    description: GLOBAL_DATA.USER.bio,
    title: GLOBAL_DATA.USER.fullName,
    type: "homepage",
  },
  path: "/",
  title: GLOBAL_DATA.USER.fullName,
});

const getPageJsonLd = (): WithContext<PageSchema> => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  dateCreated: dayjs("2025-09-01").toISOString(),
  // La date du contenu le plus récemment mis à jour : celle que le sitemap
  // donne à cette URL. `dayjs()` lisait l'horloge au rendu, donc la page se
  // déclarait modifiée à chaque revalidation horaire, sans rien de changé.
  dateModified: latestUpdate(getAllContent()),
  // référence au nœud Person du graphe racine, au lieu d'une TROISIÈME personne
  // anonyme nommée « florin » — le graphe en déclarait déjà deux différentes
  mainEntity: { "@id": PERSON_ID },
});

const Page = () => (
  <>
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getPageJsonLd()).replaceAll(
          "<",
          "\\u003c"
        ),
      }}
      type="application/ld+json"
    />

    <div className="relative mx-auto md:max-w-3xl">
      <Cover />
      <Divider />
      <Header />
      <Divider />
      <Overview />
      {/* pas de séparateur ici : les deux boutons du CV ferment le bloc de
        contact. Le panneau complet, avec son titre, est en bas de page */}
      <Cv compact />
      <Divider />
      <About />
      <Divider />
      {/* PAS de `<Suspense>` autour des deux sections GitHub. La page est
        statique : leur contenu est déjà dans le HTML, mais React sort du flux
        toute frontière de plus de 500 octets une fois la page au-delà de
        12,8 Ko, puis ne la révèle que 300 ms après la première image. Les
        deux sections arrivaient donc APRÈS le premier rendu et poussaient
        tout ce qui suit de 554 px (656 sur téléphone) : un lien vers
        `/#my-experiences` sautait une à cinq fois sur dix selon le réseau et
        la machine (CLS 0,25 à 0,78). La frontière ne protégeait rien en
        échange — une section qui jette pendant le prérendu fait échouer le
        build, avec ou sans elle. */}
      <SectionBoundary>
        <Commits />
      </SectionBoundary>
      <Divider />
      {/* juste après les statistiques : les deux sections lisent la même
        réponse GitHub, et les lire d'affilée évite au lecteur de revenir en
        arrière pour relier un graphe de contributions à ce qui l'a produit */}
      <SectionBoundary>
        <Repos />
      </SectionBoundary>
      <Divider />
      <TechStack />
      <Divider />
      <Articles />
      <Divider />
      <Certs />
      <Divider />
      <Tools />
      <Divider />
      <Experiences />
      <Divider />
      <Projects />
      <Divider />
      <Branding />
      <Divider />
      <Cv />
      <Divider />
    </div>
  </>
);

export default Page;
