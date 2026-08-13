import { useRender } from "@base-ui/react/use-render";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "@/lib/utils";

const variants = cva(
  [
    "inline-flex items-center justify-center gap-x-1 align-middle",
    "w-fit shrink-0 overflow-hidden rounded-full border border-input px-2 py-1",
    "whitespace-nowrap text-[10px] transition-[color,box-shadow] sm:text-xs",
    "font-pixel-square [&>span]:font-pixel-square [&>span]:text-theme",
    "[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0",
  ],
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-background text-muted-foreground",
        primary: "border-theme text-theme",
        secondary:
          "bg-zinc-50 text-muted-foreground dark:bg-zinc-900",
        transparent:
          "border-foreground bg-transparent text-foreground",
      },
    },
  }
);

type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof variants> & {
    asChild?: boolean;
  };

export const Badge = ({
  className,
  variant,
  asChild = false,
  children,
  ...props
}: BadgeProps) =>
  useRender({
    defaultTagName: "span",
    props: {
      className: cn(variants({ variant }), className),
      "data-slot": "badge",
      // In `asChild` mode the rendered element supplies its own children;
      // merging `children` here would be overridden by `render.props.children`.
      ...(asChild ? {} : { children }),
      ...props,
    },
    render: asChild ? (children as ReactElement) : undefined,
  });
