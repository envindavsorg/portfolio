"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Textarea } from "@/components/primitives/Textarea";
import type { DiffLine } from "@/lib/diff";
import { diffLines, MAX_LINES } from "@/lib/diff";
import { m } from "@/paraglide/messages";

const ROW_STYLES: Record<DiffLine["type"], string> = {
  added: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  equal: "",
  removed: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const ROW_SIGNS: Record<DiffLine["type"], string> = {
  added: "+",
  equal: " ",
  removed: "-",
};

export const DiffViewer = () => {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const result = useMemo(() => diffLines(left, right), [left, right]);

  const handleLeft = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setLeft(event.target.value);
  const handleRight = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setRight(event.target.value);

  const hasInput = left.length > 0 || right.length > 0;

  return (
    <div className="flex w-full flex-col gap-y-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="diff-left">
            {m.utils_diff_left_label()}
          </Label>
          <Textarea
            className="min-h-40 font-mono text-xs"
            id="diff-left"
            onChange={handleLeft}
            placeholder={m.utils_diff_left_placeholder()}
            spellCheck={false}
            value={left}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="diff-right">
            {m.utils_diff_right_label()}
          </Label>
          <Textarea
            className="min-h-40 font-mono text-xs"
            id="diff-right"
            onChange={handleRight}
            placeholder={m.utils_diff_right_placeholder()}
            spellCheck={false}
            value={right}
          />
        </div>
      </div>

      {hasInput && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="lowercase" variant="primary">
            {m.utils_diff_stat_added({ count: result.stats.added })}
          </Badge>
          <Badge className="lowercase">
            {m.utils_diff_stat_removed({
              count: result.stats.removed,
            })}
          </Badge>
          <Badge className="lowercase">
            {m.utils_diff_stat_unchanged({
              count: result.stats.unchanged,
            })}
          </Badge>

          <Button
            className="ms-auto"
            onClick={() => {
              setLeft("");
              setRight("");
            }}
            size="sm"
            variant="outline"
          >
            {m.utils_diff_clear()}
          </Button>
        </div>
      )}

      {result.truncated && (
        <p className="text-destructive text-sm" role="alert">
          {m.utils_diff_too_large({ max: MAX_LINES })}
        </p>
      )}

      {result.lines.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-input">
          {/* un tableau : chaque ligne porte ses deux numéros de ligne */}
          <table className="w-full border-collapse font-mono text-xs">
            <caption className="sr-only">
              {m.utils_diff_table_caption()}
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">{m.utils_diff_col_left()}</th>
                <th scope="col">{m.utils_diff_col_right()}</th>
                <th scope="col">{m.utils_diff_col_content()}</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((line, index) => (
                <tr
                  className={ROW_STYLES[line.type]}
                  key={`${line.type}-${line.leftLine}-${line.rightLine}-${index}`}
                >
                  <td className="w-10 select-none border-input border-r px-2 py-0.5 text-right text-muted-foreground">
                    {line.leftLine ?? ""}
                  </td>
                  <td className="w-10 select-none border-input border-r px-2 py-0.5 text-right text-muted-foreground">
                    {line.rightLine ?? ""}
                  </td>
                  <td className="whitespace-pre px-2 py-0.5">
                    <span aria-hidden="true" className="select-none">
                      {ROW_SIGNS[line.type]}{" "}
                    </span>
                    {line.type !== "equal" && (
                      <span className="sr-only">
                        {line.type === "added"
                          ? m.utils_diff_sr_added()
                          : m.utils_diff_sr_removed()}{" "}
                      </span>
                    )}
                    {line.text || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
