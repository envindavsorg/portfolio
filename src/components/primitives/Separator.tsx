"use client";

import { Separator as Primitive } from "@base-ui/react/separator";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = ComponentProps<typeof Primitive> & {
  /**
   * Kept for API compatibility with the previous radix-based separator.
   * Base UI's separator always exposes the `separator` role, so this prop
   * is accepted but has no effect on the rendered semantics.
   */
  decorative?: boolean;
};

export const Separator = ({
  className,
  orientation = "horizontal",
  // Accepted for backward compatibility; Base UI has no `decorative` prop,
  // so we strip it to avoid forwarding an invalid attribute to the DOM.
  decorative: _decorative = true,
  ...props
}: SeparatorProps) => (
  <Primitive
    className={cn(
      "shrink-0 bg-border",
      "data-[orientation=horizontal]:h-px",
      "data-[orientation=vertical]:h-full",
      "data-[orientation=horizontal]:w-full",
      "data-[orientation=vertical]:w-px",
      className
    )}
    data-slot="separator"
    orientation={orientation}
    {...props}
  />
);
