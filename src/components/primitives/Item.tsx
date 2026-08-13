import { useRender } from "@base-ui/react/use-render";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type React from "react";

import { Separator } from "@/components/primitives/Separator";
import { cn } from "@/lib/utils";

export const ItemGroup = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("group/item-group flex flex-col", className)}
    data-slot="item-group"
    {...props}
  />
);

export const ItemSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) => (
  <Separator
    className={cn("my-0", className)}
    data-slot="item-separator"
    orientation="horizontal"
    {...props}
  />
);

const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors duration-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-accent/50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3",
      },
      variant: {
        default: "bg-transparent",
        muted: "bg-muted/50",
        outline: "border-input",
      },
    },
  }
);

export const Item = ({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  render,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & {
    asChild?: boolean;
    render?: useRender.RenderProp;
  }) => {
  // `asChild` (legacy radix API) is preserved: when true, the single child
  // element is used as the rendered element, exactly like radix `Slot`.
  // Internally we rely on Base UI's `useRender` (merges props, className,
  // style and event handlers) instead of `@radix-ui/react-slot`.
  const renderProp =
    render ??
    (asChild ? (children as useRender.RenderProp) : undefined);

  return useRender({
    defaultTagName: "div",
    props: {
      className: cn(itemVariants({ className, size, variant })),
      "data-size": size,
      "data-slot": "item",
      "data-variant": variant,
      // When not using `asChild`/`render`, render the children inside the div.
      ...(renderProp ? {} : { children }),
      ...props,
    },
    render: renderProp,
  });
};

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
      },
    },
  }
);

export const ItemMedia = ({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemMediaVariants>) => (
  <div
    className={cn(itemMediaVariants({ className, variant }))}
    data-slot="item-media"
    data-variant={variant}
    {...props}
  />
);

export const ItemContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
      className
    )}
    data-slot="item-content"
    {...props}
  />
);

export const ItemTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex w-fit items-center gap-2 font-medium text-sm leading-snug",
      className
    )}
    data-slot="item-title"
    {...props}
  />
);

export const ItemDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p
    className={cn(
      "line-clamp-2 text-balance font-normal text-muted-foreground text-sm leading-normal",
      "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
      className
    )}
    data-slot="item-description"
    {...props}
  />
);

export const ItemActions = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("flex items-center gap-2", className)}
    data-slot="item-actions"
    {...props}
  />
);

export const ItemHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex basis-full items-center justify-between gap-2",
      className
    )}
    data-slot="item-header"
    {...props}
  />
);

export const ItemFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex basis-full items-center justify-between gap-2",
      className
    )}
    data-slot="item-footer"
    {...props}
  />
);
