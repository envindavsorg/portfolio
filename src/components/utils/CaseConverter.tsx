"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import { Label } from "@/components/base/Label";
import { CopyButton } from "@/components/primitives/Button";
import { Textarea } from "@/components/primitives/Textarea";
import type { CaseFormat } from "@/lib/case";
import { CASE_FORMATS, convertLines } from "@/lib/case";
import { m } from "@/paraglide/messages";

const FORMAT_LABELS: Record<CaseFormat, () => string> = {
  camel: m.utils_case_format_camel,
  constant: m.utils_case_format_constant,
  kebab: m.utils_case_format_kebab,
  lower: m.utils_case_format_lower,
  pascal: m.utils_case_format_pascal,
  sentence: m.utils_case_format_sentence,
  slug: m.utils_case_format_slug,
  snake: m.utils_case_format_snake,
  title: m.utils_case_format_title,
  upper: m.utils_case_format_upper,
};

export const CaseConverter = () => {
  const [text, setText] = useState("");

  const results = useMemo(
    () =>
      CASE_FORMATS.map((format) => ({
        format,
        value: convertLines(text, format),
      })),
    [text]
  );

  const handleText = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setText(event.target.value);

  return (
    <div
      className="flex w-full flex-col gap-y-6 py-4"
      data-slot="utils-case-converter"
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="case-input">
          {m.utils_case_input_label()}
        </Label>
        <Textarea
          className="min-h-24 font-mono text-xs"
          id="case-input"
          onChange={handleText}
          placeholder={m.utils_case_input_placeholder()}
          spellCheck={false}
          value={text}
        />
        <p className="text-muted-foreground text-xs">
          {m.utils_case_lines_notice()}
        </p>
      </div>

      {text.trim() && (
        <dl className="flex flex-col divide-y divide-input rounded-md border border-input">
          {results.map(({ format, value }) => (
            <div className="flex flex-col gap-y-1 p-3" key={format}>
              <div className="flex items-center justify-between gap-x-2">
                <dt className="font-medium text-xs">
                  {FORMAT_LABELS[format]()}
                </dt>
                <CopyButton
                  getValueAction={() => Promise.resolve(value)}
                  label={m.utils_case_copy_aria({
                    format: FORMAT_LABELS[format](),
                  })}
                  size="icon"
                  variant="ghost"
                />
              </div>
              <dd className="whitespace-pre-wrap break-all font-mono text-xs">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
