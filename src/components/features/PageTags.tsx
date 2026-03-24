"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { ALL_TAG, isActiveTag } from "@/lib/tags";
import { cn } from "@/lib/utils";

import { Button } from "../primitives/Button";

interface TagButtonProps {
  count?: number;
  isActive: boolean;
  onTagClick: (tag: string) => void;
  tag: string;
}

const TagButton = ({
  count,
  isActive,
  onTagClick,
  tag,
}: TagButtonProps) => {
  const handleClick = useCallback(
    () => onTagClick(tag),
    [onTagClick, tag]
  );

  return (
    <Button
      className={cn(
        "flex items-center gap-x-1",
        "rounded-md bg-transparent px-2",
        "hover:bg-transparent hover:text-foreground",
        isActive && "border-theme text-theme hover:text-theme"
      )}
      onClick={handleClick}
      size="sm"
      variant="outline"
    >
      {tag}
      {count !== undefined && count > 0 && (
        <span className="font-medium text-xs">({count})</span>
      )}
    </Button>
  );
};

export interface PageTagsProps {
  activeTag: string;
  tagCounts?: Record<string, number>;
  tags: string[];
}

export const PageTags = ({
  activeTag,
  tagCounts,
  tags,
}: PageTagsProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTagClick = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(window.location.search);
      if (tag === ALL_TAG) {
        params.delete("tag");
      } else {
        params.set("tag", tag.toLowerCase());
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router]
  );

  if (tags.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-muted-foreground text-xs sm:text-sm">
        consulter par catégorie :
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tags.map((tag) => (
          <TagButton
            count={tagCounts?.[tag]}
            isActive={isActiveTag(tag, activeTag)}
            key={tag}
            onTagClick={handleTagClick}
            tag={tag}
          />
        ))}
      </div>
    </div>
  );
};
