"use client";

import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Check } from "@/components/motion/Check";
import { Copy } from "@/components/motion/Copy";
import { X } from "@/components/motion/X";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0 gap-2 rounded-full font-medium text-sm",
    "cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        sm: "h-6 px-2 text-xs",
      },
      variant: {
        default: [
          "bg-linear-to-b",
          "text-shadow-xs text-white",
          "from-zinc-700 dark:from-zinc-600",
          "to-zinc-800 dark:to-zinc-700",
          "hover:to-zinc-700 dark:hover:to-zinc-600",
          "dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/20",
        ],
        destructive: [
          "border border-destructive",
          "text-destructive",
          "bg-background hover:bg-destructive/10",
          "dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-destructive/20",
        ],
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-foreground underline-offset-2 transition-colors hover:bg-transparent hover:text-theme hover:underline",
        outline: [
          "border border-foreground/30",
          "text-foreground",
          "bg-transparent hover:bg-accent/40",
          "dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15",
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
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        buttonVariants({ className, size, variant }),
        "font-pixel-square"
      )}
      data-slot="button"
      {...props}
    />
  );
};

type CopyState = "idle" | "success" | "fail";

const ICONS = {
  fail: X,
  idle: Copy,
  success: Check,
} as const;

interface CopyButtonProps extends Omit<
  ComponentProps<"button">,
  "size"
> {
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
  label = "copier le texte dans le presse-papier",
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
      aria-label={label}
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
    </Button>
  );
};
