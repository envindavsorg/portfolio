"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import { ALL_TAG, isActiveTag } from "@/lib/tags";
import { cn } from "@/lib/utils";

import { Button } from "../primitives/Button";
import { Field } from "../primitives/Field";
import { PanelContent } from "../primitives/Panel";

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

export interface WritingsTagsProps {
  activeTag: string;
  tagCounts?: Record<string, number>;
  tags: string[];
}

export const WritingsTags = ({
  activeTag,
  tagCounts,
  tags,
}: WritingsTagsProps) => {
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
    <PanelContent>
      <Field className="flex flex-col md:flex-row items-center">
        <p className="text-xs sm:text-sm text-theme">
          par catégorie :
        </p>

        <div className="flex max-md:flex-wrap gap-2 sm:gap-3">
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
      </Field>
    </PanelContent>
  );
};
