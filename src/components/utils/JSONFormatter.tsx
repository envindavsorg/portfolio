"use client";

import type { ChangeEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Divider } from "@/components/base/Divider";
import { Label } from "@/components/base/Label";
import { Button, CopyButton } from "@/components/primitives/Button";
import { Textarea } from "@/components/primitives/Textarea";
import { m } from "@/paraglide/messages";

import { ArrowDownAtoZ } from "../motion/ArrowDownAtoZ";
import { ArrowDownZtoA } from "../motion/ArrowDownZtoA";
import { Delete } from "../motion/Delete";

type SortOrder = "asc" | "desc";
type DisplayMode = "formatted" | "minified";

type TokenType =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punctuation";

interface Token {
  type: TokenType;
  value: string;
}

interface JSONStats {
  keys: number;
  lines: number;
  size: number;
}

const TOKEN_CLASSES: Record<TokenType, string> = {
  boolean: "text-violet-400",
  key: "text-sky-400",
  null: "text-red-400",
  number: "text-amber-400",
  punctuation: "text-muted-foreground",
  string: "text-emerald-400",
};

const sortKeys = (obj: unknown, order: SortOrder): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((item) => sortKeys(item, order));
  }
  if (obj !== null && typeof obj === "object") {
    const keys = Object.keys(
      obj as Record<string, unknown>
    ).toSorted();
    if (order === "desc") {
      keys.reverse();
    }
    const sorted: Record<string, unknown> = {};
    for (const key of keys) {
      sorted[key] = sortKeys(
        (obj as Record<string, unknown>)[key],
        order
      );
    }
    return sorted;
  }
  return obj;
};

const safeParse = (
  value: string
): { parsed: unknown; valid: boolean } => {
  try {
    return { parsed: JSON.parse(value.trim()), valid: true };
  } catch {
    return { parsed: null, valid: false };
  }
};

const formatJSON = (
  value: string
): { output: string; isValid: boolean } => {
  if (!value.trim()) {
    return { isValid: true, output: "" };
  }

  const { parsed, valid } = safeParse(value);
  if (!valid) {
    return { isValid: false, output: m.utils_json_invalid() };
  }

  return {
    isValid: true,
    output: JSON.stringify(parsed, null, "\t\t"),
  };
};

const minifyJSON = (value: string): string => {
  const { parsed, valid } = safeParse(value);
  return valid ? JSON.stringify(parsed) : value;
};

const sortJSONKeys = (value: string, order: SortOrder): string => {
  const { parsed, valid } = safeParse(value);
  return valid
    ? JSON.stringify(sortKeys(parsed, order), null, "\t\t")
    : value;
};

const getJSONStats = (value: string): JSONStats | null => {
  const { parsed, valid } = safeParse(value);
  if (!valid) {
    return null;
  }

  const formatted = JSON.stringify(parsed, null, 2);
  return {
    keys:
      typeof parsed === "object" && parsed !== null
        ? Object.keys(parsed).length
        : 0,
    lines: formatted.split("\n").length,
    size: new Blob([JSON.stringify(parsed)]).size,
  };
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} ${m.utils_json_unit_bytes()}`;
  }
  return `${(bytes / 1024).toFixed(1)} ${m.utils_json_unit_kb()}`;
};

const tokenize = (json: string): Token[] => {
  const tokens: Token[] = [];
  const lines = json.split("\n");

  for (const line of lines) {
    let remaining = line;

    while (remaining.length > 0) {
      const leadingWhitespace = remaining.match(/^(\s+)/u);
      if (leadingWhitespace) {
        tokens.push({
          type: "punctuation",
          value: leadingWhitespace[1],
        });
        remaining = remaining.slice(leadingWhitespace[1].length);
        continue;
      }

      const keyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")\s*:/u);
      if (keyMatch) {
        tokens.push({ type: "key", value: keyMatch[1] });
        tokens.push({ type: "punctuation", value: ": " });
        remaining = remaining.slice(keyMatch[0].length).trimStart();
        continue;
      }

      const stringMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/u);
      if (stringMatch) {
        tokens.push({ type: "string", value: stringMatch[1] });
        remaining = remaining.slice(stringMatch[1].length);
        continue;
      }

      const numberMatch = remaining.match(
        /^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/u
      );
      if (numberMatch) {
        tokens.push({ type: "number", value: numberMatch[1] });
        remaining = remaining.slice(numberMatch[1].length);
        continue;
      }

      const boolMatch = remaining.match(/^(true|false)/u);
      if (boolMatch) {
        tokens.push({ type: "boolean", value: boolMatch[1] });
        remaining = remaining.slice(boolMatch[1].length);
        continue;
      }

      const nullMatch = remaining.match(/^(null)/u);
      if (nullMatch) {
        tokens.push({ type: "null", value: nullMatch[1] });
        remaining = remaining.slice(nullMatch[1].length);
        continue;
      }

      tokens.push({ type: "punctuation", value: remaining[0] });
      remaining = remaining.slice(1);
    }

    tokens.push({ type: "punctuation", value: "\n" });
  }

  return tokens;
};

const SyntaxHighlight = ({ json }: { json: string }) => {
  const tokens = useMemo(() => tokenize(json), [json]);

  return (
    <pre
      className="my-0 overflow-auto rounded-md border border-input bg-background p-4 font-mono text-base! leading-relaxed sm:text-lg!"
      style={{ tabSize: 2 }}
    >
      <code className="border-0! bg-background!">
        {tokens.map((token, index) => (
          <span className={TOKEN_CLASSES[token.type]} key={index}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
};

export const JSONFormatter = () => {
  const [input, setInput] = useState("");
  const [displayMode, setDisplayMode] =
    useState<DisplayMode>("formatted");
  const iconAscRef = useRef<AnimatedIconHandle>(null);
  const iconDescRef = useRef<AnimatedIconHandle>(null);
  const iconDeleteRef = useRef<AnimatedIconHandle>(null);

  const { output, isValid } = useMemo(
    () => formatJSON(input),
    [input]
  );

  const displayOutput = useMemo(() => {
    if (!(isValid && output)) {
      return output;
    }
    return displayMode === "minified" ? minifyJSON(input) : output;
  }, [input, output, isValid, displayMode]);

  const stats = useMemo(
    () => (isValid && output ? getJSONStats(input) : null),
    [input, isValid, output]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.currentTarget.value);
      setDisplayMode("formatted");
    },
    []
  );

  const handleMinify = useCallback(() => {
    setDisplayMode((prev) =>
      prev === "minified" ? "formatted" : "minified"
    );
  }, []);

  const handleSortKeys = useCallback((order: SortOrder) => {
    setInput((prev) => sortJSONKeys(prev, order));
    setDisplayMode("formatted");
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setDisplayMode("formatted");
  }, []);

  const hasOutput = isValid && output;

  return (
    <>
      <div className="screen-line-after flex flex-col gap-y-6 py-3">
        <div className="flex flex-col gap-y-3">
          <Label
            className="text-foreground text-sm"
            htmlFor="json-input"
          >
            {m.utils_json_input_label()}
          </Label>
          <Textarea
            className="outline-0"
            id="json-input"
            onChange={handleChange}
            placeholder={m.utils_json_input_placeholder()}
            rows={8}
            spellCheck={false}
            value={input}
          />
        </div>

        <Divider border={false} type="half" />

        <div className="flex flex-col gap-y-3">
          <Label className="text-foreground text-sm">
            {m.utils_json_output_label()}
          </Label>
          {hasOutput ? (
            <SyntaxHighlight json={displayOutput} />
          ) : (
            <div
              aria-live="polite"
              className={`overflow-auto rounded-md border border-input bg-background p-4 font-mono text-sm leading-relaxed ${
                isValid ? "text-muted-foreground" : "text-destructive"
              }`}
            >
              {output || m.utils_json_output_placeholder()}
            </div>
          )}
        </div>
      </div>

      {(hasOutput || input.trim()) && (
        <div className="flex items-center justify-between py-1.5">
          {stats && (
            <p className="text-muted-foreground text-xs">
              {m.utils_json_stats({
                keys: stats.keys,
                lines: stats.lines,
                size: formatSize(stats.size),
              })}
            </p>
          )}

          <div className="ml-auto flex items-center gap-x-2">
            {input.trim() && (
              <Button
                onClick={handleClear}
                onMouseEnter={() =>
                  iconDeleteRef.current?.startAnimation()
                }
                onMouseLeave={() =>
                  iconDeleteRef.current?.stopAnimation()
                }
                size="icon"
                variant="outline"
              >
                <Delete ref={iconDeleteRef} />
              </Button>
            )}

            {hasOutput && (
              <>
                <Button
                  onClick={() => handleSortKeys("asc")}
                  onMouseEnter={() =>
                    iconAscRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    iconAscRef.current?.stopAnimation()
                  }
                  size="icon"
                  variant="outline"
                >
                  <ArrowDownAtoZ ref={iconAscRef} />
                </Button>

                <Button
                  onClick={() => handleSortKeys("desc")}
                  onMouseEnter={() =>
                    iconDescRef.current?.startAnimation()
                  }
                  onMouseLeave={() =>
                    iconDescRef.current?.stopAnimation()
                  }
                  size="icon"
                  variant="outline"
                >
                  <ArrowDownZtoA ref={iconDescRef} />
                </Button>

                <Button
                  aria-pressed={displayMode === "minified"}
                  data-active={displayMode === "minified"}
                  onClick={handleMinify}
                  variant="outline"
                >
                  {displayMode === "minified"
                    ? m.utils_json_toggle_format()
                    : m.utils_json_toggle_minify()}
                </Button>

                <CopyButton value={displayOutput} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
