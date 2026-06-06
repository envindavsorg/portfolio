"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { Divider } from "@/components/base/Divider";
import { useTagFilter } from "@/components/features/WritingsTagFilter";
import { matchesTag } from "@/lib/tags";
import { m } from "@/paraglide/messages";

import { getRecentSlugs, RECENT_KEY } from "./lib";
import type { UtilsItem, UtilsSortMode } from "./types";
import { UtilsContent } from "./UtilsContent";
import { UtilsHistory } from "./UtilsHistory";
import { UtilsSearch } from "./UtilsSearch";

interface UtilsProps {
  contents: UtilsItem[];
}

export const Utils = ({ contents }: UtilsProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<UtilsSortMode>("a-z");
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const pathname = usePathname();
  const { activeTag } = useTagFilter();

  useEffect(() => {
    setRecentSlugs(getRecentSlugs());
  }, [pathname]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let items = contents.filter((item) =>
      matchesTag(item.metadata.tags, activeTag)
    );

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
  }, [query, contents, sort, activeTag]);

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

  const handleRetry = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();

    // test
    toast.info(m.utils_toast_test_title(), {
      description: m.utils_toast_test_description(),
      duration: Number.POSITIVE_INFINITY,
      id: "command-hint",
    });
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSlugs([]);
  }, []);

  return (
    <>
      <UtilsSearch
        count={filtered.length}
        inputRef={inputRef}
        onClear={handleRetry}
        onQueryChange={setQuery}
        onToggleSort={toggleSort}
        query={query}
        sort={sort}
      />

      <Divider border={false} type="half" />

      <UtilsHistory items={recentItems} onClear={clearRecent} />

      <UtilsContent
        items={filtered}
        onRetry={handleRetry}
        query={query}
      />
    </>
  );
};
