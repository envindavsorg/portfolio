import { Slot } from "@radix-ui/react-slot";
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Breadcrumb = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"nav"> & {
    separator?: ReactNode;
  }
>(({ ...props }, ref) => (
  <nav
    aria-label="breadcrumb"
    className="lowercase"
    ref={ref}
    {...props}
  />
));

export const BreadcrumbList = forwardRef<
  HTMLOListElement,
  ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    className={cn(
      "flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 wrap-break-word",
      "text-sm text-foreground",
      className
    )}
    ref={ref}
    {...props}
  />
));

export const BreadcrumbItem = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    className={cn("inline-flex items-center gap-x-1.5", className)}
    ref={ref}
    {...props}
  />
));

export const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "inline-flex items-center gap-x-1.5",
        "transition-colors hover:text-foreground",
        "hover:underline underline-offset-2",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export const BreadcrumbPage = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    aria-current="page"
    aria-disabled="true"
    className={cn("font-medium text-theme", className)}
    ref={ref}
    {...props}
  />
));

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: ComponentProps<"li">) => (
  <li
    aria-hidden="true"
    className={className}
    role="presentation"
    {...props}
  >
    {children}
  </li>
);
