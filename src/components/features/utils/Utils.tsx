"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Divider } from "@/components/primitives/Divider";

import { getRecentSlugs, RECENT_KEY } from "./lib";
import type { UtilsItem, UtilsSortMode } from "./types";
import { UtilsContent } from "./UtilsContent";
import { UtilsHistory } from "./UtilsHistory";
import { UtilsSearch } from "./UtilsSearch";

interface UtilsProps {
  contents: UtilsItem[];
}

export const Utils = ({ contents }: UtilsProps) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<UtilsSortMode>("a-z");
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setRecentSlugs(getRecentSlugs());
  }, [pathname]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let items = contents;

    if (q) {
      items = items.filter(
        (item) =>
          item.metadata.title.toLowerCase().includes(q) ||
          item.metadata.description.toLowerCase().includes(q)
      );
    }

    items = [...items].toSorted((a, b) =>
      sort === "a-z"
        ? a.metadata.title.localeCompare(b.metadata.title, "fr")
        : b.metadata.title.localeCompare(a.metadata.title, "fr")
    );

    return items;
  }, [query, contents, sort]);

  const recentItems = useMemo(() => {
    if (query || recentSlugs.length === 0) {
      return [];
    }
    const slugSet = new Set(contents.map((c) => c.slug));
    return recentSlugs
      .filter((s) => slugSet.has(s))
      .flatMap((s) => {
        const item = contents.find((c) => c.slug === s);
        return item ? [item] : [];
      });
  }, [recentSlugs, contents, query]);

  const toggleSort = useCallback(() => {
    setSort((prev) => (prev === "a-z" ? "z-a" : "a-z"));
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSlugs([]);
  }, []);

  return (
    <>
      <UtilsSearch
        count={filtered.length}
        onClear={clearQuery}
        onQueryChange={setQuery}
        onToggleSort={toggleSort}
        query={query}
        sort={sort}
      />

      <Divider border={false} type="half" />

      <UtilsHistory items={recentItems} onClear={clearRecent} />

      <UtilsContent items={filtered} query={query} />
    </>
  );
};
