import type { TOCItemType } from "fumadocs-core/toc";
import { useEffect, useState } from "react";

const useActiveItem = (items: TOCItemType[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = items
      .map((item) =>
        document.querySelector<HTMLElement>(
          `[id="${item.url.replace("#", "")}"]`
        )
      )
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-128px 0px -80% 0px" }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return activeId;
};

export default useActiveItem;
