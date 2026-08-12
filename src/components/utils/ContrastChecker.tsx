"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import type { ContrastVerdict } from "@/lib/contrast";
import {
  evaluateContrast,
  formatRatio,
  parseColor,
  suggestForeground,
  THRESHOLDS,
  toHexColor,
} from "@/lib/contrast";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

type LevelKey = keyof Omit<ContrastVerdict, "ratio">;

const LEVELS: { key: LevelKey; label: () => string }[] = [
  { key: "normalAA", label: m.utils_contrast_level_normal_aa },
  { key: "normalAAA", label: m.utils_contrast_level_normal_aaa },
  { key: "largeAA", label: m.utils_contrast_level_large_aa },
  { key: "largeAAA", label: m.utils_contrast_level_large_aaa },
  { key: "uiComponent", label: m.utils_contrast_level_ui },
];

export const ContrastChecker = () => {
  const [foreground, setForeground] = useState("#777777");
  const [background, setBackground] = useState("#ffffff");

  const parsed = useMemo(
    () => ({
      background: parseColor(background),
      foreground: parseColor(foreground),
    }),
    [foreground, background]
  );

  const verdict = useMemo(
    () =>
      parsed.foreground && parsed.background
        ? evaluateContrast(parsed.foreground, parsed.background)
        : null,
    [parsed]
  );

  const suggestion = useMemo(() => {
    if (
      !(parsed.foreground && parsed.background) ||
      verdict?.normalAA
    ) {
      return null;
    }
    return suggestForeground(
      parsed.foreground,
      parsed.background,
      THRESHOLDS.normalAA
    );
  }, [parsed, verdict]);

  const handleForeground = (event: ChangeEvent<HTMLInputElement>) =>
    setForeground(event.target.value);
  const handleBackground = (event: ChangeEvent<HTMLInputElement>) =>
    setBackground(event.target.value);

  const handleSwap = useCallback(() => {
    setForeground(background);
    setBackground(foreground);
  }, [foreground, background]);

  const handleApply = useCallback(() => {
    if (suggestion) {
      setForeground(toHexColor(suggestion));
    }
  }, [suggestion]);

  const preview =
    parsed.foreground && parsed.background
      ? {
          backgroundColor: toHexColor(parsed.background),
          color: toHexColor(parsed.foreground),
        }
      : undefined;

  return (
    <div
      className="flex w-full flex-col gap-y-6 py-4"
      data-slot="utils-contrast-checker"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="contrast-foreground">
            {m.utils_contrast_foreground_label()}
          </Label>
          <Input
            className="font-mono text-xs"
            id="contrast-foreground"
            onChange={handleForeground}
            spellCheck={false}
            value={foreground}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="contrast-background">
            {m.utils_contrast_background_label()}
          </Label>
          <Input
            className="font-mono text-xs"
            id="contrast-background"
            onChange={handleBackground}
            spellCheck={false}
            value={background}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleSwap} size="sm" variant="outline">
          {m.utils_contrast_swap()}
        </Button>
        <p className="text-muted-foreground text-xs">
          {m.utils_contrast_alpha_notice()}
        </p>
      </div>

      {verdict ? (
        <>
          <div className="flex items-baseline gap-x-3">
            <span className="text-muted-foreground text-xs">
              {m.utils_contrast_ratio()}
            </span>
            <span className="font-mono text-2xl">
              {formatRatio(verdict.ratio)}
            </span>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_contrast_preview_title()}</Label>
            <div
              className="flex flex-col gap-y-2 rounded-md border border-input p-4"
              style={preview}
            >
              <p className="text-base">
                {m.utils_contrast_preview_normal()}
              </p>
              <p className="font-bold text-2xl">
                {m.utils_contrast_preview_large()}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_contrast_levels_title()}</Label>
            <ul className="flex flex-col divide-y divide-input rounded-md border border-input">
              {LEVELS.map(({ key, label }) => (
                <li
                  className="flex items-center justify-between gap-x-3 p-3"
                  key={key}
                >
                  <span className="text-xs">{label()}</span>
                  <Badge
                    className={cn(
                      "lowercase",
                      verdict[key] ? "text-theme" : "text-destructive"
                    )}
                    variant={verdict[key] ? "primary" : "default"}
                  >
                    {verdict[key]
                      ? m.utils_contrast_pass()
                      : m.utils_contrast_fail()}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

          {!verdict.normalAA && (
            <div className="flex flex-col gap-y-2 border-input border-t pt-4">
              <Label>{m.utils_contrast_suggestion_title()}</Label>

              {suggestion ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm">
                    {m.utils_contrast_suggestion_body({
                      color: toHexColor(suggestion),
                      target: THRESHOLDS.normalAA,
                    })}
                  </p>
                  <span
                    aria-hidden="true"
                    className="size-6 rounded-full border border-input"
                    style={{
                      backgroundColor: toHexColor(suggestion),
                    }}
                  />
                  <Button
                    onClick={handleApply}
                    size="sm"
                    variant="outline"
                  >
                    {m.utils_contrast_suggestion_apply()}
                  </Button>
                </div>
              ) : (
                <p className="text-sm">
                  {m.utils_contrast_suggestion_none()}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-destructive text-sm" role="alert">
          {m.utils_contrast_invalid()}
        </p>
      )}
    </div>
  );
};
