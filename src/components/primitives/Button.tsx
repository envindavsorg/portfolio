"use client";

import { useRender } from "@base-ui/react/use-render";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Check } from "@/components/motion/Check";
import { Copy } from "@/components/motion/Copy";
import { X } from "@/components/motion/X";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0 gap-2 rounded-none font-medium text-sm",
    // pas de classe de focus : l'anneau vient de la règle `:focus-visible` de
    // globals.css. L'ancien `ring-offset-background` posait un liseré beige
    // autour du bouton sur le canevas blanc.
    "cursor-pointer select-none whitespace-nowrap transition-colors duration-200",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    // un bouton est une pièce du plan : coins vifs, équerres aux quatre coins
    // (`corner-brackets`, globals.css)
    "corner-brackets",
    // le reflet du survol : une bande inclinée, rangée hors du bouton à
    // gauche, qui le traverse une fois. Elle ne revient pas — la transition
    // n'existe que pendant le survol — et ne bouge pas si le visiteur a
    // demandé moins de mouvement. Seul `translate` est animé.
    "relative overflow-hidden",
    "after:pointer-events-none after:absolute after:-inset-y-1/2 after:left-0 after:w-1/2",
    "after:-translate-x-[220%] after:skew-x-[-20deg]",
    // 12 %, pas 20 : la bande est de la couleur du libellé, et au plus fort de
    // son passage un libellé coloré (destructif, bascule enfoncée) tombait à
    // 2,86:1 en thème clair
    "after:bg-linear-to-r after:from-transparent after:via-current/12 after:to-transparent",
    "motion-safe:hover:after:translate-x-[320%] motion-safe:hover:after:transition-transform motion-safe:hover:after:duration-500",
    // un bouton désactivé ne répond plus au pointeur : sans cela le fond de
    // survol ET le reflet jouaient sur un contrôle qui ne peut rien faire
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-8 px-4",
        icon: "size-8",
        sm: "h-6 px-2 text-xs [--bracket:5px]",
      },
      variant: {
        // plein, aux couleurs inversées du thème ; ses équerres sont celles
        // du texte, à mi-force, pour marquer les coins sans les découper
        default: [
          "bg-foreground text-background hover:bg-foreground/85",
          "[--bracket-color:color-mix(in_oklab,currentColor_55%,transparent)]",
        ],
        destructive: [
          // filet à pleine force : à 50 % il tombait de 4,76:1 à 2,56:1 en clair.
          // Les pointillés suffisent à porter le nouveau dessin.
          "border border-destructive border-dashed",
          "text-destructive",
          "bg-transparent hover:bg-destructive/10",
        ],
        // sans filet : les équerres n'apparaissent qu'au survol
        ghost: [
          "[--bracket-color:transparent]",
          "hover:bg-accent hover:text-accent-foreground hover:[--bracket-color:currentColor]",
          // couleurs forcées : les images de fond tombent, donc les équerres
          // aussi, et le fond de survol devient celui de la page. Sans filet
          // il ne restait qu'une icône nue, au repos comme au survol.
          "forced-colors:border",
        ],
        // un lien n'est pas une pièce : ni équerres (`bg-none` les retire), ni
        // reflet
        link: "bg-none text-foreground underline-offset-2 after:hidden hover:bg-transparent hover:text-theme hover:underline",
        // `hover:bg-accent/40` seul était imperceptible : 1,03:1 contre le
        // canevas en clair, 1,08:1 en sombre. Le fond plein (1,10 / 1,26) ne
        // suffit toujours pas en clair, d'où le filet qui passe de 1,98:1 à
        // 4,82:1 — c'est lui qui porte le survol, avec les équerres qui
        // prennent la couleur du thème.
        outline: [
          "border border-foreground/30 border-dashed",
          "text-foreground",
          "bg-transparent hover:border-foreground/60 hover:bg-accent",
          "hover:[--bracket-color:var(--color-theme)]",
          // bascule enfoncée : un cadre PLEIN et doublé, dans la couleur du
          // thème, avec son libellé. En pointillés d'un pixel, elle était la
          // boîte la plus faible de sa rangée, à côté d'équerres à pleine
          // force. Pas de fond teinté : le libellé du thème y tombe à 4,17:1.
          "aria-pressed:border-theme aria-pressed:border-solid aria-pressed:text-theme",
          "aria-pressed:inset-ring-1 aria-pressed:inset-ring-theme",
        ],
      },
    },
  }
);

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const element = useRender({
    defaultTagName: "button",
    props: {
      className: cn(
        buttonVariants({ className, size, variant }),
        "font-pixel-square"
      ),
      "data-slot": "button",
      // When `asChild`, the rendered element carries its own children, so we
      // must not also pass them here (it would override the child's content).
      ...(asChild ? {} : { children }),
      ...props,
    },
    render: asChild ? (children as ReactElement) : undefined,
  });

  return element;
};

type CopyState = "idle" | "success" | "fail";

const ICONS = {
  fail: X,
  idle: Copy,
  success: Check,
} as const;

interface CopyButtonProps
  extends Omit<ComponentProps<"button">, "size"> {
  value?: string;
  getValueAction?: () => Promise<string>;
  variant?: "default" | "outline" | "link" | "ghost";
  size?: "default" | "icon";
  label?: string;
  timeout?: number;
}

export const CopyButton = ({
  value,
  getValueAction,
  variant = "outline",
  size = "icon",
  className,
  label,
  timeout = 2000,
  ...props
}: CopyButtonProps) => {
  const [state, setState] = useState<CopyState>("idle");
  const iconRef = useRef<AnimatedIconHandle>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const handleCopy = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      const text = getValueAction
        ? await getValueAction()
        : (value ?? "");
      await navigator.clipboard.writeText(text);
      setState("success");
    } catch {
      setState("fail");
    }

    timeoutRef.current = setTimeout(() => setState("idle"), timeout);
  }, [value, getValueAction, timeout]);

  const handleMouseEnter = useCallback(() => {
    iconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    iconRef.current?.stopAnimation();
  }, []);

  const Icon = ICONS[state];

  return (
    <Button
      {...props}
      aria-label={label ?? m.copy_button_default_aria()}
      className={cn(
        className,
        variant === "ghost" && "hover:bg-background!"
      )}
      onClick={handleCopy}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      size={size}
      variant={variant}
    >
      <Icon ref={iconRef} size={22} />
      {/* le changement d'icône est purement visuel : sans région live, un
          lecteur d'écran n'apprend jamais si la copie a réussi */}
      <span aria-live="polite" className="sr-only" role="status">
        {state === "success" && m.copy_button_success()}
        {state === "fail" && m.copy_button_failure()}
      </span>
    </Button>
  );
};
