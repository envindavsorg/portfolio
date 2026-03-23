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
import { Home } from "../motion/Home";

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface NavigationBreadcrumbProps {
  items: BreadcrumbEntry[];
}

export const NavBreadcrumb = ({ items }: NavigationBreadcrumbProps) => {
  const iconHouseRef = useRef<AnimatedIconHandle>(null);
  const iconChevronRef = useRef<AnimatedIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    iconHouseRef.current?.startAnimation();
    iconChevronRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    iconHouseRef.current?.stopAnimation();
    iconChevronRef.current?.stopAnimation();
  }, []);

  return (
    <div className="screen-line-after px-3 py-1">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map(({ label, href }, idx: number) => {
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
                      <Home ref={iconHouseRef} />
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight
                      className={cn(
                        "[&>svg]:size-3 sm:[&>svg]:size-4",
                        !isLast && "text-theme"
                      )}
                      ref={iconChevronRef}
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
