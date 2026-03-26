"use client";

import { Fragment, useCallback, useRef } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/primitives/Breadcrumb";
import { cn } from "@/lib/utils";

import { ChevronRight } from "../motion/ChevronRight";

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface WritingsBreadcrumbProps {
  items: BreadcrumbEntry[];
}

export const WritingsBreadcrumb = ({
  items,
}: WritingsBreadcrumbProps) => {
  const iconRef = useRef<AnimatedIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    iconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    iconRef.current?.stopAnimation();
  }, []);

  return (
    <div className="screen-line-after px-3 py-1">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map(({ label, href }, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <Fragment key={label}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={href}
                      aria-label={label}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight
                      className={cn(!isLast && "text-theme")}
                      ref={iconRef}
                      size={16}
                    />
                  </BreadcrumbSeparator>
                )}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
