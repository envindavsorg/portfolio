"use client";

import type { ComponentProps } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { TextAnimate } from "@/components/blocks/TextAnimate";
import { cn } from "@/lib/utils";

export const Panel = ({
  className,
  ...props
}: ComponentProps<"section">) => (
  <section
    className={cn("border-edge border-x", className)}
    data-slot="panel"
    {...props}
  />
);

export const PanelTitle = ({
  className,
  ...props
}: ComponentProps<"h2">) => (
  <h2
    className={cn("text-2xl sm:text-3xl", className)}
    data-slot="panel-title"
    {...props}
  />
);

interface PanelHeaderProps extends ComponentProps<"div"> {
  sticky?: boolean;
  title?: string;
}

export const PanelHeader = forwardRef<
  HTMLDivElement,
  PanelHeaderProps
>(({ className, sticky, title, ...props }, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useImperativeHandle(
    forwardedRef,
    () => internalRef.current as HTMLDivElement
  );

  const setRef = useCallback((element: HTMLDivElement | null) => {
    internalRef.current = element;
  }, []);

  useEffect(() => {
    if (!(sticky && sentinelRef.current)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: "-57px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sticky]);

  if (!sticky) {
    return (
      <div
        className={cn("screen-line-after px-3", className)}
        data-slot="panel-header"
        ref={setRef}
        {...props}
      />
    );
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none invisible -mt-px h-px w-full"
        ref={sentinelRef}
      />
      <div
        className={cn(
          "screen-line-after sticky top-14 z-20 px-3 transition-colors duration-300",
          isStuck
            ? "bg-background text-theme"
            : "bg-background text-foreground",
          className
        )}
        data-slot="panel-header"
        ref={setRef}
        {...props}
      >
        <PanelTitle
          className={cn(isStuck && "text-center text-xl sm:text-2xl")}
        >
          {isStuck ? (
            <TextAnimate animation="slideLeft" by="character">
              {`-- ${title} --`}
            </TextAnimate>
          ) : (
            <TextAnimate
              animation="slideLeft"
              by="character"
              delay={0.2}
            >
              {title ?? ""}
            </TextAnimate>
          )}
        </PanelTitle>
      </div>
    </>
  );
});

export const PanelContent = ({
  className,
  reset = false,
  ...props
}: ComponentProps<"div"> & { reset?: boolean }) => (
  <div
    className={cn(
      reset ? "space-y-0 p-0" : "space-y-1.5 p-3",
      className
    )}
    data-slot="panel-body"
    {...props}
  />
);

export const PanelFooter = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      "screen-line-before flex justify-between gap-3 px-3 py-2 max-sm:flex-col sm:justify-end",
      className
    )}
    data-slot="panel-footer"
    {...props}
  />
);
