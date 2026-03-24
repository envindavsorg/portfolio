"use client";

import { getTableOfContents } from "fumadocs-core/content/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useCallback, useRef } from "react";

import { GalleryHorizontalEnd } from "@/components/motion/GalleryHorizontalEnd";
import type { Collapsible } from "@/components/primitives/Collapsible";
import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
  useCollapsible,
} from "@/components/primitives/Collapsible";
import useActiveItem from "@/hooks/useActiveItem";
import type { TocGroup } from "@/lib/toc";
import { groupTocItems } from "@/lib/toc";
import { cn } from "@/lib/utils";

interface ConnectorProps {
  direction: "up" | "down";
}

const Connector = ({ direction }: ConnectorProps) => (
  <div
    className={cn(
      "h-3 w-4 border-input border-b",
      direction === "down"
        ? "rounded-bl-xl border-l"
        : "rounded-br-xl border-r"
    )}
  />
);

interface ItemProps {
  item: TOCItemType;
  isActive: boolean;
  onNavigate: () => void;
}

const Item = ({ item, isActive, onNavigate }: ItemProps) => (
  <div
    className={cn(
      "border-l py-1.5 transition-colors",
      isActive ? "border-theme" : "border-input"
    )}
  >
    <Link
      className={cn(
        "block pl-3 text-sm lowercase underline-offset-4 transition-colors",
        isActive ? "font-medium text-theme" : "text-foreground/60",
        "hover:text-theme hover:underline"
      )}
      href={item.url}
      onClick={onNavigate}
    >
      {item.title}
    </Link>
  </div>
);

interface ContentProps {
  groups: TocGroup[];
  activeUrl: string | null;
}

const Content = ({ groups, activeUrl }: ContentProps) => {
  const { setOpen } = useCollapsible();

  const handleNavigate = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <div className="flex flex-col px-3 pt-1 pb-3">
      {groups.map((group, groupIndex) => {
        const isParentActive = group.parent.url === activeUrl;
        const hasChildren = group.children.length > 0;
        const isLastGroup = groupIndex === groups.length - 1;
        return (
          <div key={group.parent.url}>
            <Item
              isActive={isParentActive}
              item={group.parent}
              onNavigate={handleNavigate}
            />

            {hasChildren && (
              <>
                <Connector direction="down" />

                <div className="ml-[15.5px]">
                  {group.children.map((child) => (
                    <Item
                      isActive={child.url === activeUrl}
                      item={child}
                      key={child.url}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>

                {!isLastGroup && <Connector direction="up" />}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

type PageToCProps = ComponentProps<typeof Collapsible> & {
  content: string;
};

export const PageToC = ({ content, ...props }: PageToCProps) => {
  const iconGalleryRef = useRef<AnimatedIconHandle>(null);
  const iconChevronRef = useRef<AnimatedIconHandle>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const items = getTableOfContents(content);
  const activeId = useActiveItem(items);

  const startAnimations = useCallback(() => {
    iconGalleryRef.current?.startAnimation();
    iconChevronRef.current?.startAnimation();
  }, []);

  const stopAnimations = useCallback(() => {
    iconGalleryRef.current?.stopAnimation();
    iconChevronRef.current?.stopAnimation();
  }, []);

  const handleTriggerClick = useCallback(() => {
    startAnimations();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(stopAnimations, 600);
  }, [startAnimations, stopAnimations]);

  const groups = groupTocItems(items);
  const activeUrl = activeId ? `#${activeId}` : null;

  return (
    <CollapsibleWithContext {...props}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full cursor-pointer items-center gap-x-3",
          "p-3 [&_svg]:size-4",
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
        <Content activeUrl={activeUrl} groups={groups} />
      </CollapsibleContent>
    </CollapsibleWithContext>
  );
};
