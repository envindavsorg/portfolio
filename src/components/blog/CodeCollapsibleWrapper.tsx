"use client";

import type { ComponentProps, ReactNode } from "react";

import type { Collapsible } from "@/components/base/Collapsible";
import {
  CollapsibleChevronsIcon,
  CollapsibleTrigger,
  CollapsibleWithContext,
  useCollapsible,
} from "@/components/base/Collapsible";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

// le contenu reste toujours monté : fermé = clippé en hauteur avec un
// dégradé "tout afficher", ouvert = hauteur libre
const ClippedContent = ({ children }: { children: ReactNode }) => {
  const { open } = useCollapsible();

  return (
    <div
      className={cn(
        "overflow-hidden [&>figure]:my-0",
        !open && "max-h-80 rounded-b-lg"
      )}
      data-state={open ? "open" : "closed"}
    >
      {children}
    </div>
  );
};

export const CodeCollapsibleWrapper = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Collapsible>) => (
  <CollapsibleWithContext
    className={cn(
      "group/collapsible not-prose relative mt-6",
      className
    )}
    {...props}
  >
    {/* un <button> et non un <div> : Base UI pose type, tabindex, aria-expanded
        et aria-disabled sur l'élément rendu, or aria-expanded n'est pas permis
        sur un élément générique. Le contrôle était donc focusable, sans rôle et
        sans nom — un lecteur d'écran l'atteignait et n'annonçait rien. */}
    <CollapsibleTrigger asChild>
      <button
        aria-label={m.writings_code_collapsible_toggle()}
        className="absolute top-2.25 right-10 z-10 cursor-pointer"
        type="button"
      >
        <CollapsibleChevronsIcon />
      </button>
    </CollapsibleTrigger>
    <ClippedContent>{children}</ClippedContent>
    <CollapsibleTrigger className="absolute inset-x-0 bottom-0 flex h-30 cursor-pointer items-end justify-center bg-linear-to-t from-25% from-code to-transparent pb-4 text-foreground text-sm underline underline-offset-2 group-data-[state=open]/collapsible:hidden">
      {m.writings_code_collapsible_show_all()}
    </CollapsibleTrigger>
  </CollapsibleWithContext>
);
