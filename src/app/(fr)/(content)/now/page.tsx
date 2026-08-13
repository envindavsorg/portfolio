import type { Metadata } from "next";
import Link from "next/link";

import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Badge } from "@/components/primitives/Badge";
import { Prose } from "@/components/primitives/Typography";
import { getContentByCategory, toContentLocale } from "@/lib/content";
import { toExperienceEntry } from "@/lib/cv";
import { formatDate } from "@/lib/functions";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * « En ce moment ».
 *
 * Une page /now se périme par nature : c'est son défaut congénital, et la
 * plupart de celles qu'on croise datent de trois ans en annonçant le présent.
 *
 * Celle-ci est donc DÉRIVÉE du dépôt — poste en cours, trois derniers textes
 * publiés, dernière certification — et sa date « à jour au » est calculée sur ces
 * mêmes sources, jamais écrite à la main. Elle ne peut donc pas mentir sans que le
 * contenu du site change en même temps.
 *
 * C'est aussi la raison pour laquelle on n'y trouve pas de section « ce que
 * j'apprends » remplie : rien dans le dépôt ne le prouve, et l'inventer donnerait
 * précisément la page fausse que ce choix évite.
 */

const pageDescription =
  "Ce sur quoi florin cuzeac travaille en ce moment : poste en cours, derniers écrits et dernière certification.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "En ce moment",
    type: "blog",
  },
  path: "/now",
  title: "En ce moment",
});

const NOW_ARTICLE_COUNT = 3;

export const NowPage = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;
  const contentLocale = toContentLocale(locale);

  const current = EXPERIENCES.find(
    (experience) => experience.isCurrentEmployer
  );
  const role = current
    ? toExperienceEntry(
        current,
        locale,
        m.cv_present(undefined, options)
      )
    : null;

  const articles = getContentByCategory(
    "articles",
    contentLocale
  ).slice(0, NOW_ARTICLE_COUNT);

  const [latestCert] = CERTS.toSorted(
    (left, right) =>
      new Date(right.issueDate).getTime() -
      new Date(left.issueDate).getTime()
  );

  /**
   * La date de fraîcheur est la plus récente des sources affichées, pas
   * `dayjs()` : une page qui se déclare à jour le jour où on la charge ne dit
   * rien, alors que celle-ci dit quand son contenu a bougé pour la dernière fois.
   */
  const freshness = Math.max(
    ...articles.map((article) =>
      new Date(article.metadata.updatedAt).getTime()
    ),
    ...(latestCert ? [new Date(latestCert.issueDate).getTime()] : [])
  );

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(undefined, options),
          },
          { label: m.now_breadcrumb(undefined, options) },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.now_heading(undefined, options)}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{m.now_intro(undefined, options)}</Prose>
        <Prose>{m.now_derived_note(undefined, options)}</Prose>
        <div className="pt-1">
          <Badge className="lowercase" variant="primary">
            {m.now_updated_on(
              { date: formatDate(freshness, "LL") },
              options
            )}
          </Badge>
        </div>
      </PanelContent>

      {role && (
        <section className="screen-line-after px-3 py-4">
          <h2 className="pb-2 font-semibold text-sm lowercase">
            {m.now_section_work(undefined, options)}
          </h2>

          <p className="text-muted-foreground text-sm">
            {m.now_current_role(
              {
                company: role.company,
                start: role.period.split(" — ")[0],
                title: role.title,
              },
              options
            )}
          </p>

          <p className="pt-2 text-sm">
            <Link
              className="underline decoration-dotted underline-offset-4 transition-colors hover:text-theme"
              href={localizeHref(`/experience/${role.id}`)}
            >
              {m.showcase_all_experience(undefined, options)}
            </Link>
          </p>
        </section>
      )}

      {articles.length > 0 && (
        <section className="screen-line-after px-3 py-4">
          <h2 className="pb-2 font-semibold text-sm lowercase">
            {m.now_section_building(undefined, options)}
          </h2>

          <p className="pb-2 text-muted-foreground text-sm">
            {m.now_latest_articles(undefined, options)}
          </p>

          <ul className="flex flex-col gap-y-1.5">
            {articles.map((article) => (
              <li
                className="flex items-baseline gap-x-2 text-sm"
                key={article.slug}
              >
                <span aria-hidden="true" className="text-theme">
                  --
                </span>

                <Link
                  className="underline decoration-dotted underline-offset-4 transition-colors hover:text-theme"
                  href={localizeHref(`/articles/${article.slug}`)}
                >
                  {article.metadata.title}
                </Link>

                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatDate(article.metadata.createdAt, "LL")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {latestCert && (
        <section className="screen-line-after px-3 py-4">
          <h2 className="pb-2 font-semibold text-sm lowercase">
            {m.now_section_learning(undefined, options)}
          </h2>

          <p className="text-muted-foreground text-sm">
            {m.now_latest_cert(
              {
                date: formatDate(latestCert.issueDate, "LL"),
                issuer: latestCert.issuer,
                name: latestCert.title,
              },
              options
            )}
          </p>
        </section>
      )}
    </div>
  );
};

const Page = () => <NowPage />;

export default Page;
