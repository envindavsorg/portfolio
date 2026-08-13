import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
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
import { dayjs } from "@/lib/functions";
import { PERSON_ID } from "@/lib/json-ld";
import { createMetadata } from "@/lib/metadata";

const About = dynamic(async () => {
  const mod =
    await import("@/app/(fr)/(content)/(root)/_components/about/About");
  return mod.About;
});

export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
  description: GLOBAL_DATA.USER.bio,
  ogImageParams: {
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
  dateModified: dayjs().toISOString(),
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
      <Divider />
      <Cv />
      <Divider />
      <About />
      <Divider />
      <SectionBoundary>
        <Suspense>
          <Commits />
        </Suspense>
      </SectionBoundary>
      <Divider />
      {/* juste après les statistiques : les deux sections lisent la même
        réponse GitHub, et les lire d'affilée évite au lecteur de revenir en
        arrière pour relier un graphe de contributions à ce qui l'a produit */}
      <SectionBoundary>
        <Suspense>
          <Repos />
        </Suspense>
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
