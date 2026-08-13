import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import type { BreadcrumbEntry } from "@/lib/breadcrumb-json-ld";

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
      <section className="screen-line-after px-3 py-4">
        <h2 className="pb-2 font-semibold text-sm lowercase">
          {highlights.title}
        </h2>

        <ul className="space-y-1.5">
          {highlights.items.map((item) => (
            <li
              className="flex gap-x-2 text-muted-foreground text-sm"
              key={item}
            >
              {/* la puce est décorative : l'élément de liste porte déjà la
                  sémantique, la répéter à l'oral n'apprend rien */}
              <span aria-hidden="true" className="text-theme">
                --
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    )}

    {skills.items.length > 0 && (
      <section className="screen-line-after px-3 py-4">
        <h2 className="pb-2 font-semibold text-sm lowercase">
          {skills.title}
        </h2>

        <ul className="flex flex-wrap gap-1.5">
          {skills.items.map((skill) => (
            <li className="flex" key={skill}>
              <Tag>{skill}</Tag>
            </li>
          ))}
        </ul>
      </section>
    )}

    <div className="screen-line-before flex flex-wrap items-center gap-2 p-3">
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
        <Link href={navigation.all.href}>{navigation.all.label}</Link>
      </Button>
    </div>

    {(navigation.previous || navigation.next) && (
      <nav
        aria-label={navigation.all.label}
        className="screen-line-before flex flex-wrap items-stretch justify-between gap-2 p-3"
      >
        {/* les deux extrémités gardent leur place même quand une seule fiche
            voisine existe : sans cela, « suivant » saute à gauche sur la
            dernière fiche et le repère de position disparaît */}
        {navigation.previous ? (
          <Link
            className="group flex max-w-[48%] flex-col gap-y-0.5 rounded-xl border border-input px-3 py-2 transition-colors hover:border-theme"
            href={navigation.previous.href}
          >
            <span className="text-muted-foreground text-xs lowercase">
              {navigation.previousLabel}
            </span>
            <span className="truncate font-medium text-sm group-hover:text-theme">
              {navigation.previous.label}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {navigation.next ? (
          <Link
            className="group flex max-w-[48%] flex-col items-end gap-y-0.5 rounded-xl border border-input px-3 py-2 text-right transition-colors hover:border-theme"
            href={navigation.next.href}
          >
            <span className="text-muted-foreground text-xs lowercase">
              {navigation.nextLabel}
            </span>
            <span className="truncate font-medium text-sm group-hover:text-theme">
              {navigation.next.label}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    )}
  </div>
);
