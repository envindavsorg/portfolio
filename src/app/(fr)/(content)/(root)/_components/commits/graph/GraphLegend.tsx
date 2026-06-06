import type { HTMLAttributes } from "react";

import { m } from "@/paraglide/messages";

import {
  BLOCK_RADIUS,
  BLOCK_SIZE,
  LEVEL_FILLS,
  MAX_LEVEL,
} from "./config";

export const GraphLegend = (
  props: HTMLAttributes<HTMLDivElement>
) => (
  <div className="flex items-center gap-x-2" {...props}>
    <span className="font-medium text-muted-foreground text-xs sm:text-sm">
      {m.home_commits_legend_less()}
    </span>
    <div className="flex items-center gap-x-1">
      {Array.from({ length: MAX_LEVEL + 1 }, (_, level) => (
        <svg height={BLOCK_SIZE} key={level} width={BLOCK_SIZE}>
          <rect
            className={LEVEL_FILLS[level]}
            height={BLOCK_SIZE}
            rx={BLOCK_RADIUS}
            ry={BLOCK_RADIUS}
            width={BLOCK_SIZE}
          />
        </svg>
      ))}
    </div>
    <span className="font-medium text-muted-foreground text-xs sm:text-sm">
      {m.home_commits_legend_more()}
    </span>
  </div>
);
