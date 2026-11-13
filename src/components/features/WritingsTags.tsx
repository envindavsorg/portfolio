"use client";

import { useCallback, useId } from "react";

import { ALL_TAG, isActiveTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

import { PanelContent } from "../base/Panel";
import { Button } from "../primitives/Button";
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
      // l'état actif n'était porté que par la couleur
      aria-pressed={isActive}
      className={cn(
        "flex items-center gap-x-1",
        "bg-transparent px-2.5 transition-colors",
        "hover:border-foreground/60 hover:bg-transparent",
        isActive &&
          "border-theme text-theme hover:border-theme hover:text-theme"
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
  const labelId = useId();

  const handleTagClick = useCallback(
    (tag: string) => {
      setTag(tag);
    },
    [setTag]
  );

  // Un sujet porté par TOUS les contenus ne filtre rien : sur /components,
  // « react (3) » à côté de « tout (3) » proposait deux fois la même liste.
  // La rangée n'apparaît que si au moins un sujet réduit la sélection.
  const total = tagCounts?.[ALL_TAG];
  const narrows = tags.some(
    (tag) =>
      tag !== ALL_TAG &&
      (total === undefined || (tagCounts?.[tag] ?? 0) < total)
  );

  if (!narrows) {
    return null;
  }

  return (
    <PanelContent>
      {/* `Field` imposait `w-full` à ses deux enfants : le libellé tombait à sa
          largeur minimale (trois lignes) et les pastilles, sans retour à la
          ligne dès 768 px, sortaient de la colonne — sept sujets de /utils
          étaient hors écran à 1440 px, dans un `main` qui ne défile pas. */}
      <div
        aria-labelledby={labelId}
        className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-3"
        role="group"
      >
        <p
          className="shrink-0 whitespace-nowrap text-theme text-xs sm:text-sm"
          id={labelId}
        >
          {m.writings_tags_by_category()}
        </p>

        <div className="flex flex-wrap gap-2">
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
      </div>
    </PanelContent>
  );
};
