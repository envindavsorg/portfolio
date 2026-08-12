"use client";

import { createContext, useContext, useMemo } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { groupByWeeks } from "@/lib/commits";
import { dayjs } from "@/lib/functions";

import {
  BLOCK_MARGIN,
  BLOCK_SIZE,
  LABEL_HEIGHT,
  WEEK_START,
} from "./config";

interface GraphContextType {
  weeks: Week[];
  width: number;
  height: number;
  totalCount: number;
  year: number;
}

const GraphContext = createContext<GraphContextType | null>(null);

export const useContributionGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error("Must be used within ContributionGraph");
  }
  return context;
};

export type GraphProps = HTMLAttributes<HTMLDivElement> & {
  data: CommitActivity[];
  children: ReactNode;
};

export const Graph = ({ data, children, ...props }: GraphProps) => {
  const value = useMemo(() => {
    const weeks = groupByWeeks(data, WEEK_START);
    const year =
      data.length > 0 ? dayjs(data[0].date).year() : dayjs().year();
    const totalCount = data.reduce(
      (sum, activity) => sum + activity.count,
      0
    );
    // sans semaine (API GitHub indisponible), la soustraction de la marge
    // donnerait une largeur négative — invalide pour un <svg>
    const width = Math.max(
      0,
      weeks.length * (BLOCK_SIZE + BLOCK_MARGIN) - BLOCK_MARGIN
    );
    const height =
      LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * 7 - BLOCK_MARGIN;
    return { height, totalCount, weeks, width, year };
  }, [data]);

  return (
    <GraphContext.Provider value={value}>
      <div
        className="screen-line-before screen-line-after mx-auto flex w-max max-w-full flex-col"
        {...props}
      >
        {children}
      </div>
    </GraphContext.Provider>
  );
};
