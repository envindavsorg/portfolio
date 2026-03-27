import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { More } from "../motion/More";

export const Breadcrumb = ({
  className,
  ...props
}: ComponentProps<"nav">) => (
  <nav
    aria-label="breadcrumb"
    data-slot="breadcrumb"
    className={className}
    {...props}
  />
);

export const BreadcrumbList = ({
  className,
  ...props
}: ComponentProps<"ol">) => (
  <ol
    data-slot="breadcrumb-list"
    className={cn(
      "flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 wrap-break-word",
      "text-sm text-foreground",
      className
    )}
    {...props}
  />
);

export const BreadcrumbItem = ({
  className,
  ...props
}: ComponentProps<"li">) => (
  <li
    data-slot="breadcrumb-item"
    className={cn("inline-flex items-center gap-x-1.5", className)}
    {...props}
  />
);

export const BreadcrumbLink = ({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">) =>
  useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "inline-flex items-center gap-x-1.5",
          "transition-colors hover:text-foreground",
          "hover:underline underline-offset-2",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  });

export const BreadcrumbPage = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    data-slot="breadcrumb-page"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-theme", className)}
    {...props}
  />
);

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: ComponentProps<"li">) => (
  <li
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    className={className}
    {...props}
  >
    {children}
  </li>
);

export const BreadcrumbEllipsis = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    className={cn(className)}
    {...props}
  >
    <More size={22} />
    <span className="sr-only">Plus de contenu</span>
  </span>
);
