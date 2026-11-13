import Image from "next/image";
import Link from "next/link";

import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
} from "@/components/base/Collapsible";
import { Divider } from "@/components/base/Divider";
import { DotPattern } from "@/components/blocks/DotPattern";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { accessibleName } from "@/lib/accessible-name";
import { formatDate } from "@/lib/functions";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import {
  ROW_CHEVRON,
  ROW_META,
  ROW_TITLE_HOVER,
} from "../shared/row";
import type { Cert } from "./content";

interface CertItemProps {
  cert: Cert;
  isLast?: boolean;
}

export const CertItem = ({ cert, isLast = false }: CertItemProps) => {
  const {
    credentialURL,
    title,
    issuer,
    issueDate,
    coverImageURL,
    icon: Icon,
  } = cert;

  return (
    <CollapsibleWithContext>
      <article className="group/row screen-line-before flex items-center hover:bg-accent2">
        <CollapsibleTrigger className="flex w-full flex-1 cursor-pointer items-center -outline-offset-2">
          <div className="pointer-events-none relative mx-3 my-4 flex size-6 shrink-0 items-center justify-center sm:size-8">
            {Icon && (
              <Icon aria-hidden="true" className="size-6 sm:size-8" />
            )}
            <DotPattern
              className="-z-10 text-theme opacity-20"
              height={8}
              width={8}
            />
          </div>
          <div className="flex-1 border-edge border-x px-3 py-4">
            <h2
              className={cn(
                "text-start font-pixel-square text-base lowercase sm:text-xl",
                ROW_TITLE_HOVER
              )}
            >
              {title}
            </h2>
          </div>
          {/* visible à toutes les largeurs : masqué sous `sm`, il laissait les
            certifications sans aucun signe qu'elles se déplient, alors que les
            expériences et les projets, juste dessous, en montrent un */}
          <div className={ROW_CHEVRON}>
            <CollapsibleChevronsIcon />
          </div>
        </CollapsibleTrigger>
      </article>

      {/* AVANT le contenu déplié, comme pour les expériences et les projets :
        après lui, l'organisme et la date se retrouvaient à 480 px du titre
        qu'ils décrivent dès qu'on ouvrait la certification */}
      <div className={ROW_META}>
        <span className="shrink-0 text-theme max-sm:hidden">---</span>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-x-4">
          <Badge className="lowercase">
            {getLocale() === "en" ? "issuer:" : "organisme:"}{" "}
            <span>{issuer}</span>
          </Badge>
          <Badge className="lowercase">
            {getLocale() === "en" ? "issued:" : "obtenu:"}{" "}
            <span>{formatDate(issueDate, "ddd DD MMMM YYYY")}</span>
          </Badge>
        </div>
      </div>

      <CollapsibleContent className="group overflow-hidden duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {/* 16 px et non 12 : l'anneau de l'image déborde de 4 px
          (`ring-offset-3` + `ring-1`), c'est LUI qui tombe sur le rail */}
        <div className="border-edge border-t p-4 duration-300 group-data-[state=closed]:animate-fade-out group-data-[state=open]:animate-fade-in">
          <Image
            alt={title}
            className={cn(
              "aspect-video h-full w-full object-cover object-center",
              "select-none rounded-md ring-1 ring-border ring-offset-3 ring-offset-background"
            )}
            height={1826}
            // sans sizes, le navigateur retient le plus grand candidat du srcset
            sizes="(max-width: 768px) 100vw, 768px"
            src={coverImageURL}
            width={3000}
          />
        </div>
        <div className="screen-line-before flex justify-between gap-3 px-3 py-2 max-sm:flex-col sm:justify-end">
          <Button asChild variant="outline">
            <Link
              // le titre reste dans le nom : tous ces liens affichent le même
              // texte et mènent chacun à une certification différente
              aria-label={accessibleName(
                m.home_certs_item_view_button(),
                title
              )}
              href={credentialURL}
              rel="noopener"
              target="_blank"
            >
              {m.home_certs_item_view_button()}
            </Link>
          </Button>
        </div>
      </CollapsibleContent>

      {!isLast && (
        <Divider after={false} border={false} type="half" />
      )}
    </CollapsibleWithContext>
  );
};
