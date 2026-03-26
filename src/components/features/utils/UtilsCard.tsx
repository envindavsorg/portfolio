import Link from "next/link";
import { useCallback } from "react";

import { PulsatingCircle } from "@/components/primitives/PulsatingCircle";
import { Prose } from "@/components/primitives/Typography";
import { cn } from "@/lib/utils";

import { trackVisit } from "./lib";
import type { UtilsItem } from "./types";

interface UtilsCardProps {
  item: UtilsItem;
  noDescription?: boolean;
}

export const UtilsCard = ({
  item,
  noDescription,
}: UtilsCardProps) => {
  const handleClick = useCallback(() => {
    trackVisit(item.slug);
  }, [item.slug]);

  return (
    <Link
      aria-label={item.metadata.title}
      href={`/utils/${item.slug}`}
      onClick={handleClick}
      prefetch={false}
    >
      <article className="group/article flex cursor-pointer select-none flex-col">
        <div className="flex w-full items-center justify-between p-3 group-hover/article:bg-accent2">
          <h2
            className={cn(
              "font-pixel-square lowercase",
              noDescription
                ? "sm:text-base text-sm text-theme"
                : "sm:text-xl text-lg transition-colors group-hover/article:text-theme"
            )}
          >
            {item.metadata.title}
          </h2>
          {item.metadata.isNew && (
            <div className="flex items-center gap-x-2">
              <PulsatingCircle />
              <span className="text-sm text-theme max-md:hidden">
                Nouveau
              </span>
            </div>
          )}
        </div>

        {!noDescription && (
          <div className="border-t border-edge px-3 py-1.5">
            <Prose className="lowercase">
              -- {item.metadata.description} --
            </Prose>
          </div>
        )}
      </article>
    </Link>
  );
};
