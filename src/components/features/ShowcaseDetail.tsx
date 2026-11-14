import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

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
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import type { BreadcrumbEntry } from "@/lib/breadcrumb-json-ld";
import { cn } from "@/lib/utils";

/**
 * La fiche d'une réalisation : un projet ou un poste.
 *
 * Un seul composant pour les deux, parce que les deux fiches ont la même
 * structure — un intitulé, une phrase de résumé, quelques métadonnées, des
 * puces, une stack, un lien sortant, et de quoi passer à la suivante. Écrire
 * deux fois cette mise en page reviendrait à la corriger deux fois, et une des
 * deux finirait par ne pas l'être : c'est déjà arrivé dans ce dépôt avec les
 * pages de contenu.
 *
 * Ce qui DIFFÈRE arrive en propriétés : « ce que ça fait » contre « ce que j'y
 * ai fait », un lien de projet contre un site d'entreprise, une période plutôt
 * qu'un type.
 */

interface ShowcaseLink {
  href: string;
  label: string;
}

interface ShowcaseDetailProps {
  breadcrumb: BreadcrumbEntry[];
  /** le titre de la page, et le seul h1 */
  title: string;
  /** la phrase qui dit de quoi il s'agit */
  lead: string;
  /** type, période… affichés en pastilles */
  meta?: string[];
  link?: ShowcaseLink;
  highlights: { title: string; items: string[] };
  skills: { title: string; items: string[] };
  navigation: {
    previous?: ShowcaseLink;
    next?: ShowcaseLink;
    all: ShowcaseLink;
    previousLabel: string;
    nextLabel: string;
  };
}

/**
 * Les deux moitiés du précédent / suivant, sur le modèle de celui des écrits :
 * une grille à filet plutôt que deux cartouches arrondis de la largeur de leur
 * texte, qui flottaient chacun contre un bord de la colonne.
 *
 * Le survol souligne le titre d'un filet d'accent — pas de `text-theme` : en
 * clair, le bleu sur le fond de survol est à la limite du seuil AA.
 */
const NEIGHBOUR_LINK = cn(
  "group flex flex-col gap-y-1 px-3 py-4",
  "transition-colors hover:bg-accent2 focus-visible:bg-accent2"
);

const NEIGHBOUR_TITLE = cn(
  "text-balance font-medium text-sm sm:text-base",
  "decoration-1 decoration-theme underline-offset-4 group-hover:underline"
);

export const ShowcaseDetail = ({
  breadcrumb,
  highlights,
  lead,
  link,
  meta,
  navigation,
  skills,
  title,
}: ShowcaseDetailProps) => (
  <PageColumn>
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb items={breadcrumb} />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {title}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{lead}</Prose>

        {meta && meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {meta.map((item) => (
              <Badge className="lowercase" key={item}>
                {item}
              </Badge>
            ))}
          </div>
        )}
      </PanelContent>

      {highlights.items.length > 0 && (
        <ShowcaseSection title={highlights.title}>
          <ShowcaseDashList>
            {highlights.items.map((item) => (
              <ShowcaseDashItem
                className="text-muted-foreground"
                key={item}
              >
                {item}
              </ShowcaseDashItem>
            ))}
          </ShowcaseDashList>
        </ShowcaseSection>
      )}

      {skills.items.length > 0 && (
        <ShowcaseSection title={skills.title}>
          <ul className="flex flex-wrap gap-1.5">
            {skills.items.map((skill) => (
              <li className="flex" key={skill}>
                <Tag>{skill}</Tag>
              </li>
            ))}
          </ul>
        </ShowcaseSection>
      )}

      <div className="screen-line-after flex flex-wrap items-center gap-2 p-3">
        {link && (
          <Button asChild size="sm" variant="outline">
            <a
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.label}
              <ArrowSquareOutIcon aria-hidden="true" />
            </a>
          </Button>
        )}

        <Button asChild size="sm" variant="outline">
          <Link href={navigation.all.href}>
            {navigation.all.label}
          </Link>
        </Button>
      </div>

      {(navigation.previous || navigation.next) && (
        <>
          <nav
            aria-label={navigation.all.label}
            className="screen-line-after grid sm:grid-cols-2"
          >
            {navigation.previous && (
              <Link
                className={cn(
                  NEIGHBOUR_LINK,
                  "sm:border-edge sm:border-r"
                )}
                href={navigation.previous.href}
              >
                <span className="text-muted-foreground text-xs lowercase">
                  <span aria-hidden="true">← </span>
                  {navigation.previousLabel}
                </span>
                <span className={NEIGHBOUR_TITLE}>
                  {navigation.previous.label}
                </span>
              </Link>
            )}

            {/* « suivant » garde la moitié droite même quand il est seul :
                sans cela il saute à gauche sur la première fiche et le repère
                de position disparaît */}
            {navigation.next && (
              <Link
                className={cn(
                  NEIGHBOUR_LINK,
                  "sm:col-start-2 sm:items-end sm:text-right",
                  // un seul filet entre les deux moitiés, quel que soit le
                  // lien présent : vertical dès 640 px, horizontal en dessous
                  navigation.previous
                    ? "max-sm:border-edge max-sm:border-t"
                    : "sm:border-edge sm:border-l"
                )}
                href={navigation.next.href}
              >
                <span className="text-muted-foreground text-xs lowercase">
                  {navigation.nextLabel}
                  <span aria-hidden="true"> →</span>
                </span>
                <span className={NEIGHBOUR_TITLE}>
                  {navigation.next.label}
                </span>
              </Link>
            )}
          </nav>

          <Divider before={false} border={false} type="half" />
        </>
      )}
    </div>
  </PageColumn>
);
