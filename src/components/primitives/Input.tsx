"use client";

import type { ComponentProps, ElementType, Ref } from "react";
import { forwardRef, useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends ComponentProps<"input"> {
  icon?: ElementType<{
    ref: Ref<AnimatedIconHandle>;
    size: number;
    className?: string;
  }>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon: Icon, ...props }, ref) => {
    const iconRef = useRef<AnimatedIconHandle>(null);

    const handleMouseEnter = useCallback(() => {
      iconRef.current?.startAnimation();
    }, []);

    const handleMouseLeave = useCallback(() => {
      iconRef.current?.stopAnimation();
    }, []);

    return (
      <div
        className="relative flex-1"
        onMouseEnter={Icon ? handleMouseEnter : undefined}
        onMouseLeave={Icon ? handleMouseLeave : undefined}
      >
        {Icon && (
          <Icon
            ref={iconRef}
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2"
          />
        )}
        <input
          className={cn(
            "flex h-10 w-full px-3 py-2",
            Icon && "pl-9",
            // aucune classe d'outline : `outline-none` posait
            // `--tw-outline-style: none`, que `focus-visible:outline-2` relit —
            // le champ n'avait donc AUCUN indicateur de focus (calculé :
            // `outline: none 2px`). L'anneau vient de globals.css.
            "rounded-md border border-input bg-transparent",
            "font-pixel-square lowercase",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
            "text-sm placeholder:text-muted-foreground",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            className
          )}
          ref={ref}
          type={type}
          {...props}
        />
      </div>
    );
  }
);
