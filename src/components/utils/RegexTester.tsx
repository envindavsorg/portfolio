"use client";

import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { Textarea } from "@/components/primitives/Textarea";
import type { RegexFlag } from "@/lib/regex-tester";
import {
  applyReplacement,
  compileRegex,
  findMatches,
  MAX_MATCHES,
  MAX_TEXT_LENGTH,
  REGEX_FLAGS,
  REGEX_PRESETS,
  toSegments,
} from "@/lib/regex-tester";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

const FLAG_LABELS: Record<RegexFlag, () => string> = {
  g: m.utils_regex_flag_g,
  i: m.utils_regex_flag_i,
  m: m.utils_regex_flag_m,
  s: m.utils_regex_flag_s,
  u: m.utils_regex_flag_u,
  y: m.utils_regex_flag_y,
};

/**
 * Couleurs alternées : deux correspondances voisines doivent rester distinctes.
 *
 * Seul le fond change, le texte garde la couleur courante. Colorer aussi le
 * texte faisait tomber le contraste à 3,63:1 et 4,44:1 sur ces fonds clairs —
 * sous le seuil AA, alors que c'est du texte de 12 px. L'alternance ne porte
 * aucun sens, elle ne sert qu'à séparer : elle n'a donc pas besoin du texte.
 */
const HIGHLIGHTS = [
  "bg-theme/25",
  "bg-emerald-500/25 dark:bg-emerald-400/25",
];

export const RegexTester = () => {
  const [pattern, setPattern] = useState(
    "(?<annee>\\d{4})-(?<mois>\\d{2})-(?<jour>\\d{2})"
  );
  const [flags, setFlags] = useState<string>("g");
  const [text, setText] = useState(
    "sortie le 2026-08-12, correctif le 2026-09-01"
  );
  const [replacement, setReplacement] = useState("");

  const compiled = useMemo(
    () => compileRegex(pattern, flags),
    [pattern, flags]
  );

  const run = useMemo(() => {
    if (!compiled.ok || text.length > MAX_TEXT_LENGTH) {
      return { matches: [], truncated: false };
    }
    return findMatches(compiled.regex, text);
  }, [compiled, text]);

  const segments = useMemo(
    () => toSegments(text, run.matches),
    [text, run.matches]
  );

  const replaced = useMemo(() => {
    if (!(compiled.ok && replacement)) {
      return null;
    }
    return applyReplacement(compiled.regex, text, replacement);
  }, [compiled, text, replacement]);

  const toggleFlag = useCallback((flag: RegexFlag) => {
    setFlags((current) =>
      current.includes(flag)
        ? current.replaceAll(flag, "")
        : `${current}${flag}`
    );
  }, []);

  const handlePreset = useCallback(
    (preset: { pattern: string; flags: string }) => {
      setPattern(preset.pattern);
      setFlags(preset.flags);
    },
    []
  );

  const handlePattern = (event: ChangeEvent<HTMLInputElement>) =>
    setPattern(event.target.value);
  const handleText = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setText(event.target.value);
  const handleReplacement = (event: ChangeEvent<HTMLInputElement>) =>
    setReplacement(event.target.value);

  const isTooLong = text.length > MAX_TEXT_LENGTH;

  return (
    <div
      className="flex w-full flex-col gap-y-6 py-4"
      data-slot="utils-regex-tester"
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="regex-pattern">
          {m.utils_regex_pattern_label()}
        </Label>
        <Input
          className="font-mono text-xs"
          id="regex-pattern"
          onChange={handlePattern}
          placeholder={m.utils_regex_pattern_placeholder()}
          spellCheck={false}
          value={pattern}
        />

        <div
          aria-label={m.utils_regex_flags_label()}
          className="flex flex-wrap gap-2"
          role="group"
        >
          {REGEX_FLAGS.map((flag) => (
            <Button
              aria-pressed={flags.includes(flag)}
              className={cn(
                flags.includes(flag) && "border-theme text-theme"
              )}
              key={flag}
              onClick={() => toggleFlag(flag)}
              size="sm"
              title={FLAG_LABELS[flag]()}
              variant="outline"
            >
              <span className="font-mono">{flag}</span>
            </Button>
          ))}
        </div>

        <div
          aria-label={m.utils_regex_presets_label()}
          className="flex flex-wrap gap-2"
          role="group"
        >
          {REGEX_PRESETS.map((preset) => (
            <Button
              key={preset.pattern}
              onClick={() => handlePreset(preset)}
              size="sm"
              variant="ghost"
            >
              <span className="max-w-56 truncate font-mono text-xs">
                {preset.pattern}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="regex-text">
          {m.utils_regex_text_label()}
        </Label>
        <Textarea
          className="min-h-32 font-mono text-xs"
          id="regex-text"
          onChange={handleText}
          placeholder={m.utils_regex_text_placeholder()}
          spellCheck={false}
          value={text}
        />
      </div>

      {!compiled.ok && (
        <p className="text-destructive text-sm" role="alert">
          {m.utils_regex_error({ message: compiled.message })}
        </p>
      )}

      {isTooLong && (
        <p className="text-destructive text-sm" role="alert">
          {m.utils_regex_too_long({ max: MAX_TEXT_LENGTH })}
        </p>
      )}

      {compiled.ok && !isTooLong && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="lowercase" variant="primary">
              {m.utils_regex_match_count({
                count: run.matches.length,
              })}
            </Badge>
            {run.truncated && (
              <span className="text-destructive text-xs">
                {m.utils_regex_truncated({ max: MAX_MATCHES })}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_regex_highlight_title()}</Label>
            <p className="whitespace-pre-wrap break-words rounded-md border border-input p-3 font-mono text-xs">
              {segments.map((segment, index) => {
                const key = `${index}-${segment.text}`;
                return segment.isMatch ? (
                  <mark
                    className={cn(
                      "rounded-sm px-0.5",
                      HIGHLIGHTS[(segment.matchIndex ?? 0) % 2]
                    )}
                    key={key}
                  >
                    {segment.text}
                  </mark>
                ) : (
                  <span key={key}>{segment.text}</span>
                );
              })}
            </p>
          </div>

          {run.matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {m.utils_regex_no_match()}
            </p>
          ) : (
            <div className="flex flex-col gap-y-2">
              <Label>{m.utils_regex_groups_title()}</Label>
              <ol className="flex flex-col divide-y divide-input rounded-md border border-input">
                {run.matches.map((match) => (
                  <li
                    className="flex flex-col gap-y-1 p-3"
                    key={match.index}
                  >
                    <div className="flex items-center justify-between gap-x-2">
                      <span className="break-all font-mono text-xs">
                        {match.value || "∅"}
                      </span>
                      <span className="shrink-0 text-muted-foreground text-xs">
                        {m.utils_regex_group_index({
                          index: match.index,
                        })}
                      </span>
                    </div>

                    {match.groups.length > 0 && (
                      <ol className="flex flex-wrap gap-2">
                        {match.groups.map((group, groupIndex) => (
                          <li
                            className="rounded-md border border-input px-2 py-0.5 font-mono text-xs"
                            key={`${groupIndex}-${group ?? "vide"}`}
                          >
                            <span className="text-muted-foreground">
                              ${groupIndex + 1}
                            </span>{" "}
                            {group ?? "∅"}
                          </li>
                        ))}
                      </ol>
                    )}

                    {Object.keys(match.named).length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {Object.entries(match.named).map(
                          ([name, value]) => (
                            <li
                              className="rounded-md border border-input px-2 py-0.5 font-mono text-xs"
                              key={name}
                            >
                              <span className="text-muted-foreground">
                                {name}
                              </span>{" "}
                              {value ?? "∅"}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex flex-col gap-y-2 border-input border-t pt-4">
            <Label htmlFor="regex-replacement">
              {m.utils_regex_replace_label()}
            </Label>
            <Input
              className="font-mono text-xs"
              id="regex-replacement"
              onChange={handleReplacement}
              placeholder={m.utils_regex_replace_placeholder()}
              spellCheck={false}
              value={replacement}
            />

            {replaced?.ok && (
              <>
                <Label>{m.utils_regex_replace_result()}</Label>
                <p className="whitespace-pre-wrap break-words rounded-md border border-input p-3 font-mono text-xs">
                  {replaced.result}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
