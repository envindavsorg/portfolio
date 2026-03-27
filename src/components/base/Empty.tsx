import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Empty = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="empty"
    className={cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-6",
      "text-balance rounded-md border-dashed px-6 py-8 text-center",
      className
    )}
    {...props}
  />
);

export const EmptyHeader = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="empty-header"
    className={cn(
      "flex max-w-sm flex-col items-center gap-1 text-center",
      className
    )}
    {...props}
  />
);

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "border-destructive border-2 text-destructive flex size-10 shrink-0 items-center justify-center rounded-md [&_svg:not([class*='size-'])]:size-6",
      },
    },
  }
);

export const EmptyMedia = ({
  className,
  variant = "default",
  ...props
}: ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants>) => (
  <div
    data-slot="empty-icon"
    data-variant={variant}
    className={cn(emptyMediaVariants({ className, variant }))}
    {...props}
  />
);

export const EmptyTitle = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="empty-title"
    className={cn(
      "text-lg tracking-tight text-destructive",
      className
    )}
    {...props}
  />
);

export const EmptyDescription = ({
  className,
  ...props
}: ComponentProps<"p">) => (
  <div
    data-slot="empty-description"
    className={cn(
      "text-muted-foreground text-sm/relaxed [&_span]:text-theme",
      className
    )}
    {...props}
  />
);

export const EmptyContent = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="empty-content"
    className={cn(
      "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm -mt-2",
      className
    )}
    {...props}
  />
);
