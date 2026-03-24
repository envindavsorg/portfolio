"use client";

import type { TOCItemType } from "fumadocs-core/toc";
import { useRef } from "react";
import type { ComponentProps } from "react";

import { GalleryHorizontalEnd } from "@/components/motion/GalleryHorizontalEnd";
import type { Collapsible } from "@/components/primitives/Collapsible";
import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
} from "@/components/primitives/Collapsible";
import { Divider } from "@/components/primitives/Divider";
import useActiveItem from "@/hooks/useActiveItem";
import { cn } from "@/lib/utils";

import { groupTocItems } from "./groupTocItems";
import { TocContent } from "./TocContent";

type TableOfContentsProps = ComponentProps<typeof Collapsible> & {
  items: TOCItemType[];
  after?: boolean;
};

export const TableOfContents = ({
  items,
  after = true,
  ...props
}: TableOfContentsProps) => {
  const iconGalleryRef = useRef<AnimatedIconHandle>(null);
  const iconChevronRef = useRef<AnimatedIconHandle>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const activeId = useActiveItem(items);

  const startAnimations = () => {
    iconGalleryRef.current?.startAnimation();
    iconChevronRef.current?.startAnimation();
  };

  const stopAnimations = () => {
    iconGalleryRef.current?.stopAnimation();
    iconChevronRef.current?.stopAnimation();
  };

  const handleTriggerClick = () => {
    startAnimations();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(stopAnimations, 600);
  };

  const groups = groupTocItems(items);
  const activeUrl = activeId ? `#${activeId}` : null;

  return (
    <>
      <Divider before={false} border={false} type="half" />
      <CollapsibleWithContext
        {...props}
        className={cn(
          "sticky top-14 bg-background",
          after && "screen-line-after"
        )}
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full cursor-pointer items-center gap-x-3",
            "px-2 py-3 sm:px-4 [&_svg]:size-4 sm:[&_svg]:size-5",
            "data-[state=open]:text-theme [&_svg]:text-current",
            "[&>*:last-child]:ms-auto [&_p]:text-sm [&_p]:sm:text-base"
          )}
          onClick={handleTriggerClick}
          onMouseEnter={startAnimations}
          onMouseLeave={stopAnimations}
        >
          <GalleryHorizontalEnd ref={iconGalleryRef} />
          <p>points importants sur cette page</p>
          <CollapsibleChevronsIcon ref={iconChevronRef} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <TocContent activeUrl={activeUrl} groups={groups} />
        </CollapsibleContent>
      </CollapsibleWithContext>
    </>
  );
};
