import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import {
  BLOCK_MARGIN,
  BLOCK_RADIUS,
  BLOCK_SIZE,
  LABEL_HEIGHT,
  LEVEL_FILLS,
} from "./config";

type GraphBlockProps = HTMLAttributes<SVGRectElement> & {
  activity: CommitActivity;
  dayIndex: number;
  weekIndex: number;
};

export const GraphBlock = ({
  activity,
  dayIndex,
  weekIndex,
  className,
  ...props
}: GraphBlockProps) => (
  <rect
    className={cn(LEVEL_FILLS[activity.level], className)}
    data-count={activity.count}
    data-date={activity.date}
    data-level={activity.level}
    height={BLOCK_SIZE}
    rx={BLOCK_RADIUS}
    ry={BLOCK_RADIUS}
    width={BLOCK_SIZE}
    x={(BLOCK_SIZE + BLOCK_MARGIN) * weekIndex}
    y={LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * dayIndex}
    {...props}
  />
);
