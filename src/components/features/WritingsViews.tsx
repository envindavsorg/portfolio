"use client";

import { useEffect, useState } from "react";

import { trackViewAction } from "@/actions/views.action";
import type { ContentCategory } from "@/lib/content";
import { m } from "@/paraglide/messages";

interface WritingsViewsProps {
  category: ContentCategory;
  slug: string;
}

export const WritingsViews = ({
  category,
  slug,
}: WritingsViewsProps) => {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const storageKey = `viewed:${category}/${slug}`;
    let cancelled = false;

    // une seule vue comptée par session de navigation
    const alreadyViewed = sessionStorage.getItem(storageKey) === "1";

    const track = async () => {
      try {
        const result = await trackViewAction({
          category,
          increment: !alreadyViewed,
          slug,
        });
        if (cancelled) {
          return;
        }

        const count = result?.data?.views;
        if (typeof count === "number") {
          sessionStorage.setItem(storageKey, "1");
          setViews(count);
        }
      } catch {
        // le compteur reste masqué si le suivi échoue
      }
    };

    track();

    return () => {
      cancelled = true;
    };
  }, [category, slug]);

  if (views === null) {
    return null;
  }

  return (
    <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
      {m.writings_views_count({
        plural: views > 1 ? "s" : "",
        views,
      })}
    </span>
  );
};
