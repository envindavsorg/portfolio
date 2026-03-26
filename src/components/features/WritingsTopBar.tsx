"use client";

import { useEffect, useState } from "react";

import { WritingsShortcuts } from "@/components/features/WritingsShortcuts";
import type { Content } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/functions";

import { PanelContent } from "../primitives/Panel";
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
        reset
        className="flex items-center justify-between px-3 py-2"
      >
        <WritingsPagination
          category={category}
          next={next}
          previous={previous}
        />

        <WritingsActions
          url={absoluteUrl}
          markdownUrl={`/${category}/${item.slug}.mdx`}
        />
      </PanelContent>
    </>
  );
};
