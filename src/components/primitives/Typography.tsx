import { Slot as SlotPrimitive } from "radix-ui";
import type React from "react";

import { cn } from "@/lib/utils";

const { Slot } = SlotPrimitive;

export const Prose = ({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "prose prose-sm prose-zinc dark:prose-invert max-w-none",
        // headings
        "prose-headings:text-balance prose-headings:font-pixel-square prose-headings:font-semibold prose-headings:text-foreground",
        "prose-h1:mt-10 prose-h1:mb-4 prose-h1:text-xl",
        "prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-lg",
        "prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-base",
        "prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-sm",
        // body text
        "prose-p:my-3 prose-p:leading-relaxed",
        "prose-lead:text-base prose-lead:text-muted-foreground",
        // lists
        "prose-li:my-1 prose-ol:my-3 prose-ul:my-3",
        // blockquote
        "prose-blockquote:my-4 prose-blockquote:border-theme prose-blockquote:font-normal prose-blockquote:not-italic",
        // links
        "prose-a:wrap-break-word prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4",
        // inline code
        "prose-code:rounded-md prose-code:border prose-code:bg-muted/50 prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-normal prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        // strong & emphasis
        "prose-strong:font-semibold prose-strong:text-foreground",
        // images
        "prose-img:my-4 prose-img:rounded-lg",
        // hr
        "prose-hr:my-8 prose-hr:border-edge",
        className
      )}
      data-slot="prose"
      {...props}
    />
  );
};

export const Code = ({
  className,
  ...props
}: React.ComponentProps<"code">) => {
  const isCodeBlock = "data-language" in props;

  return (
    <code
      className={cn(
        !isCodeBlock &&
          "not-prose rounded-md border bg-muted/50 px-[0.3rem] py-[0.2rem] text-sm",
        className
      )}
      data-slot={isCodeBlock ? "code-block" : "code-inline"}
      {...props}
    />
  );
};

type HeadingTypes = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingProps<T extends HeadingTypes> =
  React.ComponentProps<T> & {
    as?: T;
  };

export const Heading = <T extends HeadingTypes = "h1">({
  as,
  className,
  ...props
}: HeadingProps<T>): React.ReactElement => {
  const Comp = as ?? "h1";

  if (!props.id) {
    return <Comp className={className} {...props} />;
  }

  return (
    <Comp className={className} {...props}>
      {props.children}
    </Comp>
  );
};
