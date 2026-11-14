import type { Metadata } from "next";
import Link from "next/link";

import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import {
  ShowcaseDashItem,
  ShowcaseDashList,
} from "@/components/features/ShowcaseDashList";
import { ShowcaseSection } from "@/components/features/ShowcaseSection";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { PageColumn } from "@/components/layout/PageColumn";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import GLOBAL_DATA from "@/data/global";
import type { CvEntry } from "@/lib/cv";
import { buildCv } from "@/lib/cv";
import { formatDate } from "@/lib/functions";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import * as m from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Le parcours complet de florin cuzeac : expérience, formation, certifications et compétences, sur une seule page imprimable.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "CV",
    type: "page",
  },
  path: "/cv",
  title: "CV",
});

/**
 * `Tag` a un fond (zinc-900 en sombre) que la feuille d'impression ne connaît
 * pas : imprimé avec les arrière-plans, le texte — passé en noir par
 * `@media print` — s'y retrouverait noir sur noir. Le filet suffit sur papier.
 */
const PRINTABLE_TAG = "print:bg-transparent";

const Entry = ({ entry }: { entry: CvEntry }) => (
  <article
    // `break-inside-avoid` : à l'impression, une expérience coupée en deux
    // pages est exactement ce qu'un recruteur ne doit pas avoir sous les yeux
    className="break-inside-avoid space-y-1 py-3"
    data-slot="cv-entry"
  >
    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
      <h3 className="font-semibold text-base">{entry.title}</h3>
      <span className="text-muted-foreground text-xs tabular-nums">
        {entry.period}
      </span>
    </div>

    <p className="text-muted-foreground text-sm">
      {entry.company}
      {entry.type ? ` · ${entry.type}` : null}
      {entry.link ? (
        <>
          {" · "}
          {/* l'URL est développée à l'impression : un lien cliquable ne veut
              plus rien dire sur du papier (voir la règle @media print) */}
          <a
            className="underline underline-offset-4"
            data-slot="cv-link"
            href={entry.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {m.cv_website()}
          </a>
        </>
      ) : null}
    </p>

    {entry.highlights.length > 0 && (
      <ShowcaseDashList className="space-y-0.5 pt-1">
        {entry.highlights.map((line) => (
          <ShowcaseDashItem key={line}>{line}</ShowcaseDashItem>
        ))}
      </ShowcaseDashList>
    )}

    {entry.skills.length > 0 && (
      <ul className="flex flex-wrap gap-1.5 pt-1.5">
        {entry.skills.map((skill) => (
          <li className="flex" key={skill}>
            <Tag className={PRINTABLE_TAG}>{skill}</Tag>
          </li>
        ))}
      </ul>
    )}
  </article>
);

/**
 * Le CV, sur le domaine et dans les deux langues.
 *
 * `GLOBAL_DATA.CV.url` pointe vers un blob hors domaine, en une seule langue et
 * absent du sitemap : le parcours n'était donc consultable ni par un moteur, ni
 * par quelqu'un qui ne télécharge pas de PDF. Toutes les données affichées ici
 * existaient déjà dans le dépôt — rien n'est inventé.
 *
 * Le lien de téléchargement du PDF reste : consulter en ligne et garder un
 * fichier sont deux intentions différentes.
 */
export const CvPage = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const cv = buildCv({
    certs: CERTS,
    experiences: EXPERIENCES,
    locale,
    presentLabel: m.cv_present(),
  });

  return (
    <PageColumn>
      {/* hors de `data-slot="cv"` : le fil d'Ariane embarque un script JSON-LD,
          et `e2e/cv.spec.ts` lit le texte du CV en comptant qu'il n'en contient
          aucun. Masqué à l'impression avec son cadre — la règle d'impression
          ne retire que le `<nav>`, et il resterait une bande vide. */}
      <div className="print:hidden">
        <WritingsBreadcrumb
          items={[
            {
              href: localizeHref("/"),
              label: m.writings_breadcrumb_home(),
            },
            { label: m.cv_title() },
          ]}
        />
      </div>

      <div className="screen-line-after min-h-svh" data-slot="cv">
        <Divider before={false} border={false} type="half" />

        <div className="flex w-full items-center justify-between gap-x-3 px-3">
          <PixelHeading
            autoPlay
            className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
            mode="multi"
          >
            {m.cv_heading()}
          </PixelHeading>
        </div>

        <PanelContent className="screen-line-after screen-line-before">
          <Prose>{m.cv_intro()}</Prose>

          <div
            className="flex flex-wrap items-center gap-2 pt-2 print:hidden"
            data-slot="cv-actions"
          >
            <Button asChild size="sm" variant="outline">
              <a
                download={GLOBAL_DATA.CV.name}
                href={GLOBAL_DATA.CV.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {m.cv_action_download()}
              </a>
            </Button>
          </div>
        </PanelContent>

        <ShowcaseSection title={m.cv_section_contact()}>
          <ul className="space-y-1 text-sm">
            {/* rendus cliquables : ils étaient inertes dans un paragraphe */}
            <li>
              <a
                className="underline underline-offset-4"
                href={`mailto:${GLOBAL_DATA.USER.emailAddress}`}
              >
                {GLOBAL_DATA.USER.emailAddress}
              </a>
            </li>
            <li>
              <a
                className="underline underline-offset-4"
                href={`tel:${GLOBAL_DATA.USER.phoneNumber.replaceAll(" ", "")}`}
              >
                {GLOBAL_DATA.USER.phoneNumber}
              </a>
            </li>
            <li>{GLOBAL_DATA.USER.location.city}</li>
            <li>
              <a
                className="underline underline-offset-4"
                href={GLOBAL_DATA.SOCIAL.linkedin}
                rel="noopener noreferrer"
                target="_blank"
              >
                linkedin
              </a>
              {" · "}
              <a
                className="underline underline-offset-4"
                href={GLOBAL_DATA.SOCIAL.github}
                rel="noopener noreferrer"
                target="_blank"
              >
                github
              </a>
            </li>
          </ul>
        </ShowcaseSection>

        <ShowcaseSection title={m.cv_section_experience()}>
          {cv.jobs.map((entry) => (
            <Entry entry={entry} key={entry.id} />
          ))}
        </ShowcaseSection>

        <ShowcaseSection title={m.cv_section_education()}>
          {cv.education.map((entry) => (
            <Entry entry={entry} key={entry.id} />
          ))}
        </ShowcaseSection>

        <ShowcaseSection title={m.cv_section_certifications()}>
          <ul className="space-y-3">
            {cv.credentials.map((credential) => (
              <li
                className="break-inside-avoid space-y-0.5"
                key={credential.credentialId}
              >
                <p className="font-semibold text-base">
                  {credential.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {credential.issuer} · {m.cv_issued_on()}{" "}
                  <time dateTime={credential.issueDate}>
                    {formatDate(credential.issueDate, "LL")}
                  </time>
                </p>
                <p className="text-muted-foreground text-xs">
                  {m.cv_credential_id()} {credential.credentialId}
                  {" · "}
                  <a
                    className="underline underline-offset-4"
                    data-slot="cv-link"
                    href={credential.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {m.cv_credential_verify()}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </ShowcaseSection>

        <ShowcaseSection title={m.cv_section_skills()}>
          <ul className="flex flex-wrap gap-1.5">
            {cv.skills.map((skill) => (
              <li className="flex" key={skill}>
                <Tag className={PRINTABLE_TAG}>{skill}</Tag>
              </li>
            ))}
          </ul>
        </ShowcaseSection>

        <div className="flex flex-wrap items-center gap-2 p-3 print:hidden">
          <Button asChild size="sm" variant="outline">
            {/* `localizeHref` : sur /en/cv, le bouton renvoyait vers
                l'accueil français */}
            <Link href={localizeHref("/")}>
              {m.writings_breadcrumb_home()}
            </Link>
          </Button>
        </div>
      </div>
    </PageColumn>
  );
};

const Page = () => <CvPage />;

export default Page;
