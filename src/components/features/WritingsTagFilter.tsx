"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ALL_TAG, matchesTag } from "@/lib/tags";

interface TagFilterContextValue {
  activeTag: string;
  setTag: (tag: string) => void;
}

const TagFilterContext = createContext<TagFilterContextValue | null>(
  null
);

export const useTagFilter = (): TagFilterContextValue => {
  const context = useContext(TagFilterContext);
  if (!context) {
    throw new Error(
      "useTagFilter doit être utilisé dans <WritingsTagFilter>"
    );
  }
  return context;
};

interface WritingsTagFilterProps {
  children: ReactNode;
}

// îlot client : filtre par tag sans rendre la page dynamique — le HTML
// statique contient tous les items, le filtre s'applique côté client et
// l'URL (?tag=...) reste partageable via history.replaceState.
export const WritingsTagFilter = ({
  children,
}: WritingsTagFilterProps) => {
  const [activeTag, setActiveTag] = useState(ALL_TAG);

  // applique un éventuel ?tag=... présent dans l'URL (deep link)
  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get(
      "tag"
    );
    if (tag) {
      setActiveTag(tag.toLowerCase());
    }
  }, []);

  const setTag = useCallback((tag: string) => {
    const normalized = tag.toLowerCase();
    setActiveTag(normalized);

    const params = new URLSearchParams(window.location.search);
    if (normalized === ALL_TAG) {
      params.delete("tag");
    } else {
      params.set("tag", normalized);
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname
    );
  }, []);

  const value = useMemo(
    () => ({ activeTag, setTag }),
    [activeTag, setTag]
  );

  return (
    <TagFilterContext.Provider value={value}>
      {children}
    </TagFilterContext.Provider>
  );
};

interface WritingsFilterItemProps {
  children: ReactNode;
  tags: string[] | undefined;
}

export const WritingsFilterItem = ({
  children,
  tags,
}: WritingsFilterItemProps) => {
  const { activeTag } = useTagFilter();
  return matchesTag(tags, activeTag) ? children : null;
};
