"use client";

import { useEffect, useState } from "react";

import { WritingsShortcuts } from "@/components/features/WritingsShortcuts";
import type { Content } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/functions";
import { localizeHref } from "@/paraglide/runtime";

import { PanelContent } from "../base/Panel";
import { WritingsActions } from "./WritingsActions";
import { WritingsPagination } from "./WritingsPagination";

interface WritingsTopBarProps {
  item: Content;
  items: Content[];
  slug: string;
}

export const WritingsTopBar = ({
  item,
  items,
  slug,
}: WritingsTopBarProps) => {
  const currentIndex = items.findIndex((i) => i.slug === slug);
  const previous = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next =
    currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  const { category } = item.metadata;

  const path = `/${category}/${item.slug}`;
  const serverUrl = getAbsoluteUrl(path);
  const [absoluteUrl, setAbsoluteUrl] = useState(serverUrl);

  useEffect(() => {
    setAbsoluteUrl(new URL(path, window.location.origin).toString());
  }, [path]);

  return (
    <>
      <WritingsShortcuts
        basePath={`/${category}`}
        next={next}
        previous={previous}
      />

      <PanelContent
        data-print="hide"
        reset
        // `justify-between` et un `gap` à toutes les largeurs : sous 768 px
        // les deux groupes se suivaient sans écart, la flèche « suivant »
        // collée à « copier le lien » (0 px, contre 12 entre tous les autres)
        className="flex items-center justify-between gap-x-2 px-3 py-2"
      >
        <WritingsPagination
          category={category}
          next={next}
          previous={previous}
        />

        <WritingsActions
          isComponent={category === "components"}
          url={absoluteUrl}
          markdownUrl={localizeHref(`/${category}/${item.slug}.mdx`)}
        />
      </PanelContent>
    </>
  );
};
