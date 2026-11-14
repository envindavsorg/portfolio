import { memo } from "react";

import { CardLink } from "@/components/base/CardLink";
import { Divider } from "@/components/base/Divider";
import { DotPattern } from "@/components/blocks/DotPattern";
import { PulsatingCircle } from "@/components/primitives/PulsatingCircle";
import { Prose } from "@/components/primitives/Typography";
import type { Content } from "@/lib/content";
import { cn } from "@/lib/utils";
import { localizeHref } from "@/paraglide/runtime";

import { ROW_META, ROW_TITLE_HOVER } from "../shared/row";
import { TOOLS_ICONS } from "./content";

interface ToolItemProps {
  tool: Content;
  isLast?: boolean;
}

export const ToolItem = memo(
  ({ tool, isLast = false }: ToolItemProps) => {
    const { metadata, slug } = tool;
    const Icon = metadata.tags?.find((tag) => tag in TOOLS_ICONS)
      ? TOOLS_ICONS[
          metadata.tags.find((tag) => tag in TOOLS_ICONS) as string
        ]
      : null;

    return (
      <>
        {/* le filet haut est porté par la carte, pas par la rangée du titre :
            `screen-line-before` positionne son élément, et sur la rangée il
            aurait arrêté la zone cliquable de `CardLink` au seul titre */}
        <article className="group/row screen-line-before hover:bg-accent2">
          <div className="flex items-center">
            <div className="relative mx-3 my-4 flex size-6 shrink-0 items-center justify-center sm:size-8">
              {Icon && (
                <Icon
                  aria-hidden="true"
                  className="size-6 sm:size-8"
                />
              )}
              <DotPattern
                className="-z-10 text-theme opacity-20"
                height={8}
                width={8}
              />
            </div>
            <div className="flex flex-1 items-center justify-between gap-x-3 border-edge border-l px-3 py-4">
              <h2
                className={cn(
                  "text-start font-pixel-square text-base lowercase sm:text-xl",
                  ROW_TITLE_HOVER
                )}
              >
                <CardLink
                  href={localizeHref(`/utils/${slug}`)}
                  prefetch={false}
                >
                  {metadata.title}
                </CardLink>
              </h2>
              {metadata.isNew && <PulsatingCircle />}
            </div>
          </div>

          {/* ce que FAIT l'outil, sur le modèle des projets. La rangée portait
            « auteur », « créé » et « mis à jour » : le même nom et les deux
            mêmes dates sur les trois lignes, et pas un mot de l'outil. Les
            dates restent sur /utils et sur la page de l'outil */}
          {/* calée à gauche, sur la première ligne : ces descriptions tiennent
            sur une ou deux lignes, et réparties aux deux bords les courtes
            partaient à droite pendant que les longues restaient à gauche */}
          <div
            className={cn(ROW_META, "items-baseline justify-start")}
          >
            <span className="shrink-0 text-theme max-sm:hidden">
              ---
            </span>
            <Prose className="lowercase">
              {metadata.description}
            </Prose>
          </div>
        </article>

        {/* hors de la carte : la bande hachurée sépare deux outils, elle
            n'appartient à aucun — dedans, elle était cliquable et l'anneau
            de focus l'englobait */}
        {!isLast && (
          <Divider after={false} border={false} type="half" />
        )}
      </>
    );
  }
);
