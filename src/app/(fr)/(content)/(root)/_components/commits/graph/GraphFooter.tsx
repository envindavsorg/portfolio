import { Counter } from "@/components/base/Counter";
import { getLocale } from "@/paraglide/runtime";

import { useContributionGraph } from "./Graph";
import { GraphLegend } from "./GraphLegend";

export const GraphFooter = () => {
  const { totalCount, year } = useContributionGraph();

  return (
    <div className="screen-line-before flex gap-y-2 px-3 py-2 max-sm:flex-col-reverse sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-xs max-sm:ms-auto sm:text-sm">
        <span className="font-medium text-theme">
          <Counter value={Number(totalCount.toLocaleString("en"))} />{" "}
          contributions
        </span>{" "}
        {getLocale() === "en" ? "made in" : "effectuées en"}{" "}
        <span className="font-medium text-theme">{year}</span>
      </p>

      <GraphLegend />
    </div>
  );
};
