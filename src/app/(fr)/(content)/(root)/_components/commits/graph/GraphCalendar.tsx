"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Fragment, useCallback, useRef, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/Tooltip";
import { getMonthLabels } from "@/lib/commits";
import { formatDate } from "@/lib/functions";
import { m } from "@/paraglide/messages";

import { BLOCK_MARGIN, BLOCK_SIZE } from "./config";
import { useContributionGraph } from "./Graph";

interface HoveredBlock {
  activity: CommitActivity;
}

type GraphCalendarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: (props: {
    activity: CommitActivity;
    dayIndex: number;
    weekIndex: number;
  }) => ReactNode;
};

const formatContribution = (count: number, date: string) => {
  const label =
    count === 0
      ? m.home_commits_tooltip_no_contribution()
      : m.home_commits_tooltip_contribution_count({
          count,
          plural: count > 1 ? "s" : "",
        });
  return m.home_commits_tooltip_full({
    date: formatDate(date, "ddd DD MMM"),
    label,
  });
};

export const GraphCalendar = ({
  children,
  ...props
}: GraphCalendarProps) => {
  const { weeks, width, height } = useContributionGraph();
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HoveredBlock | null>(null);
  const monthLabels = getMonthLabels(weeks);

  const handleMouseOver = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as SVGRectElement;
      if (target.tagName !== "rect" || !target.dataset.date) {
        return;
      }

      const containerBounds =
        containerRef.current?.getBoundingClientRect();
      if (!containerBounds) {
        return;
      }

      const rectBounds = target.getBoundingClientRect();

      if (anchorRef.current) {
        anchorRef.current.style.cssText = `
				top: ${rectBounds.top - containerBounds.top}px;
				left: ${rectBounds.left - containerBounds.left}px;
				width: ${rectBounds.width}px;
				height: ${rectBounds.height}px;
			`;
      }

      setHovered({
        activity: {
          count: Number(target.dataset.count),
          date: target.dataset.date,
          level: Number(
            target.dataset.level
          ) as CommitActivity["level"],
        },
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  return (
    <div className="relative p-3" ref={containerRef} {...props}>
      <div className="no-scrollbar max-w-full overflow-x-auto overflow-y-hidden">
        <svg
          className="block overflow-visible"
          height={height}
          onMouseLeave={handleMouseLeave}
          onMouseOver={handleMouseOver}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <g className="fill-current selection:fill-selection-foreground">
            {monthLabels.map(({ weekIndex, label }) => (
              <text
                className="text-muted-foreground text-xs lowercase"
                dominantBaseline="hanging"
                key={weekIndex}
                x={(BLOCK_SIZE + BLOCK_MARGIN) * weekIndex}
              >
                {label}
              </text>
            ))}
          </g>
          {weeks.map((week, weekIndex) =>
            week.map((activity, dayIndex) => {
              if (!activity) {
                return null;
              }
              return (
                <Fragment key={`${weekIndex}-${dayIndex}`}>
                  {children({ activity, dayIndex, weekIndex })}
                </Fragment>
              );
            })
          )}
        </svg>
      </div>
      <Tooltip open={!!hovered}>
        <TooltipTrigger
          render={
            <div
              className="pointer-events-none absolute"
              ref={anchorRef}
            />
          }
        />
        <TooltipContent side="top" sideOffset={4}>
          {hovered &&
            formatContribution(
              hovered.activity.count,
              hovered.activity.date
            )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
