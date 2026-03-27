import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  type?: "full" | "half";
  before?: boolean;
  after?: boolean;
  border?: boolean;
}

const PATTERN_CLASSES = [
  "relative flex w-full",
  "before:absolute before:-left-[100vw] before:z-[-1] before:w-[200vw]",
  "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]",
  "before:bg-[length:10px_10px]",
];

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      type = "full",
      before = true,
      after = true,
      border = true,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        before && "screen-line-before",
        after && "screen-line-after"
      )}
      {...props}
    >
      <div
        className={cn(
          PATTERN_CLASSES,
          "before:[--pattern-foreground:color-mix(in_srgb,var(--color-edge)_50%,transparent)]",
          type === "full" ? "h-8 before:h-8" : "h-4 before:h-4",
          border && "border-edge border-x",
          className
        )}
      />
    </div>
  )
);
