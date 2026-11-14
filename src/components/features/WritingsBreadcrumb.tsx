"use client";

import { Fragment, useCallback, useRef } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/base/Breadcrumb";
import type { BreadcrumbEntry } from "@/lib/breadcrumb-json-ld";
import {
  breadcrumbHref,
  getBreadcrumbJsonLd,
} from "@/lib/breadcrumb-json-ld";
import { cn } from "@/lib/utils";
import { localizeHref } from "@/paraglide/runtime";

import { ChevronRight } from "../motion/ChevronRight";

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
      {/* le fil d'Ariane était rendu à l'écran sans son équivalent structuré :
          un moteur ne voyait donc pas la hiérarchie du site, alors que la liste
          est déjà là. Les href sont localisés comme ceux des liens visibles. */}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd(
              items.map((item) => ({
                ...item,
                ...(item.href && { href: localizeHref(item.href) }),
              }))
            )
          ).replaceAll("<", "\\u003c"),
        }}
        type="application/ld+json"
      />

      <Breadcrumb>
        {/* Une seule ligne. La liste passait à la ligne : sur une page de
            détail à 390 px, le titre tombait seul sous un chevron orphelin.
            Les liens gardent leur largeur ; c'est la page courante — répétée
            en h1 juste dessous — qui se tronque. */}
        <BreadcrumbList className="flex-nowrap">
          {items.map(({ label, href }, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <Fragment key={label}>
                <BreadcrumbItem
                  className={isLast ? "min-w-0" : "shrink-0"}
                >
                  {isLast ? (
                    <BreadcrumbPage className="truncate">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={
                        href
                          ? breadcrumbHref(localizeHref(href))
                          : href
                      }
                      aria-label={label}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator className="shrink-0">
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
