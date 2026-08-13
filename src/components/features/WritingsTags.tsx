"use client";

import { useCallback } from "react";

import { ALL_TAG, isActiveTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

import { PanelContent } from "../base/Panel";
import { Button } from "../primitives/Button";
import { Field } from "../primitives/Field";
import { useTagFilter } from "./WritingsTagFilter";

interface TagButtonProps {
  count?: number;
  isActive: boolean;
  label?: string;
  onTagClick: (tag: string) => void;
  tag: string;
}

const TagButton = ({
  count,
  isActive,
  label,
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
      {/* ALL_TAG reste la valeur interne (clé de comptage et état d'URL) :
          seul son libellé visible est traduit. Il en va de même des sujets — le
          bouton porte la clé, l'utilisateur lit le libellé de sa langue. */}
      {tag === ALL_TAG ? m.writings_tags_all() : (label ?? tag)}
      {count !== undefined && count > 0 && (
        <span className="font-medium text-xs">({count})</span>
      )}
    </Button>
  );
};

export interface WritingsTagsProps {
  /** libellé affiché par tag ; la clé sert de repli */
  labels?: Record<string, string>;
  tagCounts?: Record<string, number>;
  tags: string[];
}

export const WritingsTags = ({
  labels,
  tagCounts,
  tags,
}: WritingsTagsProps) => {
  const { activeTag, setTag } = useTagFilter();

  const handleTagClick = useCallback(
    (tag: string) => {
      setTag(tag);
    },
    [setTag]
  );

  if (tags.length <= 1) {
    return null;
  }

  return (
    <PanelContent>
      <Field className="flex flex-col md:flex-row items-center">
        <p className="text-xs sm:text-sm text-theme">
          {m.writings_tags_by_category()}
        </p>

        <div className="flex max-md:flex-wrap gap-2 sm:gap-3">
          {tags.map((tag) => (
            <TagButton
              count={tagCounts?.[tag]}
              isActive={isActiveTag(tag, activeTag)}
              key={tag}
              label={labels?.[tag]}
              onTagClick={handleTagClick}
              tag={tag}
            />
          ))}
        </div>
      </Field>
    </PanelContent>
  );
};
