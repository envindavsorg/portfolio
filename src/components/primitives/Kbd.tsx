import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Kbd = ({
  className,
  ...props
}: ComponentProps<"kbd">) => (
  <kbd
    className={cn(
      "inline-flex items-center justify-center gap-1",
      "pointer-events-none h-5 w-fit min-w-5 select-none rounded-sm bg-muted px-1",
      // `text-foreground` et non `text-muted-foreground` : ce dernier donne
      // 2,76:1 sur `bg-muted`, sous les 4,5 exigés. La paire n'existe que dans
      // la palette et la feuille de raccourcis — deux surfaces qu'axe ne voyait
      // jamais, parce qu'un composant fermé n'est pas rendu.
      "font-medium text-foreground text-sm [&_svg:not([class*='size-'])]:size-3",
      "in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10",
      className
    )}
    data-slot="kbd"
    {...props}
  />
);

export const KbdGroup = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <kbd
    className={cn("inline-flex items-center gap-x-2", className)}
    data-slot="kbd-group"
    {...props}
  />
);
