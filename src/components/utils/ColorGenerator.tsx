"use client";

import { motion } from "motion/react";
import { Poline, positionFunctions } from "poline";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { ColorPicker } from "@/components/blocks/ColorPicker";
import { Button, CopyButton } from "@/components/primitives/Button";
import { Prose } from "@/components/primitives/Typography";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { m } from "@/paraglide/messages";

import { Lock } from "../motion/Lock";
import { LockOpen } from "../motion/LockOpen";

type ColorScheme = Record<string, string>;

const DEFAULT_COLOR_SCHEME: ColorScheme = {
  accent: "240 4.8% 95.9%",
  "accent-foreground": "240 5.9% 10%",
  background: "0 0% 100%",
  border: "240 5.9% 90%",
  card: "0 0% 100%",
  "card-foreground": "240 10% 3.9%",
  destructive: "0 84.2% 60.2%",
  "destructive-foreground": "0 0% 98%",
  foreground: "240 10% 3.9%",
  input: "240 5.9% 90%",
  muted: "240 4.8% 95.9%",
  "muted-foreground": "240 3.8% 46.1%",
  popover: "0 0% 100%",
  "popover-foreground": "240 10% 3.9%",
  primary: "240 5.9% 10%",
  "primary-foreground": "0 0% 98%",
  ring: "240 5.9% 10%",
  secondary: "240 4.8% 95.9%",
  "secondary-foreground": "240 5.9% 10%",
};

const parseHSL = (hsl: string): [number, number, number] => {
  const parts = hsl.match(/[\d.]+/gu)?.map(Number) ?? [0, 0, 0];
  return [parts[0], parts[1], parts[2]];
};

const formatHSL = (h: number, s: number, l: number): string =>
  `${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%`;

const LIGHTNESS_INDEX = 2;
const LIGHTNESS_CONTRAST_THRESHOLD = 50;

const getContrastColor = (hsl: string): string => {
  const isLight =
    parseHSL(hsl)[LIGHTNESS_INDEX] > LIGHTNESS_CONTRAST_THRESHOLD;
  return isLight ? "0 0% 0%" : "0 0% 100%";
};

const adjustLightness = (key: string, l: number): number => {
  if (key.includes("foreground")) {
    return Math.min(l - 30, 20);
  }
  if (key === "background") {
    return Math.max(l + 30, 90);
  }
  if (key === "border" || key === "input") {
    return Math.min(Math.max(l, 70), 90);
  }
  return l;
};

const buildCSSOutput = (scheme: ColorScheme): string => {
  const variables = Object.entries(scheme)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n");
  return `@layer base {\n  :root {\n${variables}\n  }\n}`;
};

export const ColorGenerator = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    DEFAULT_COLOR_SCHEME
  );
  const [lockedColor, setLockedColor] = useState<string | null>(null);
  const { handleCopy } = useCopyToClipboard();
  const iconRef = useRef<AnimatedIconHandle>(null);

  const generateColors = useCallback(() => {
    setColorScheme((prev) => {
      const anchorColors: [number, number, number][] = [];

      if (lockedColor && prev[lockedColor]) {
        const [h, s, l] = parseHSL(prev[lockedColor]);
        anchorColors.push([h, s / 100, l / 100]);
      }

      while (anchorColors.length < 3) {
        anchorColors.push([Math.random() * 360, 0.7, 0.5]);
      }

      const poline = new Poline({
        anchorColors,
        numPoints: 20,
        positionFunctionX: positionFunctions.sinusoidalPosition,
        positionFunctionY: positionFunctions.quadraticPosition,
        positionFunctionZ: positionFunctions.linearPosition,
      });

      const colors = poline.colorsCSS;
      const next = { ...prev };

      for (const [index, key] of Object.keys(next).entries()) {
        if (key === lockedColor) {
          continue;
        }
        const [h, s, l] = parseHSL(colors[index % colors.length]);
        next[key] = formatHSL(h, s, adjustLightness(key, l));
      }

      return next;
    });
  }, [lockedColor]);

  const resetColors = useCallback(() => {
    setColorScheme(DEFAULT_COLOR_SCHEME);
    setLockedColor(null);
  }, []);

  const updateColor = useCallback((key: string, newColor: string) => {
    const [h, s, l] = parseHSL(newColor);
    setColorScheme((prev) => ({
      ...prev,
      [key]: formatHSL(h, s, l),
    }));
  }, []);

  const colorEntries = Object.entries(colorScheme);

  const handleMouseEnter = useCallback(
    () => iconRef.current?.startAnimation(),
    []
  );
  const handleMouseLeave = useCallback(
    () => iconRef.current?.stopAnimation(),
    []
  );

  return (
    <>
      <div className="screen-line-before flex items-center justify-between py-3">
        <Button onClick={resetColors} variant="outline">
          {m.utils_color_reset_palette_button()}
        </Button>
        <Button onClick={generateColors}>
          {m.utils_color_generate_palette_button()}
        </Button>
      </div>

      <div className="screen-line-before grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
        {colorEntries.map(([key, value]) => (
          <div className="relative" key={key}>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs sm:text-sm">
                --{key}
              </span>
              <Button
                onClick={() => {
                  setLockedColor((prev) =>
                    prev === key ? null : key
                  );
                  toast.info("", {
                    description:
                      lockedColor === key
                        ? m.utils_color_unlocked_toast()
                        : m.utils_color_locked_toast(),
                    duration: 3000,
                    id: "color-hint",
                  });
                }}
                aria-label={
                  lockedColor === key
                    ? m.utils_color_unlock_aria()
                    : m.utils_color_lock_aria()
                }
                aria-pressed={lockedColor === key}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                size="icon"
                variant="ghost"
              >
                {lockedColor === key ? (
                  <Lock ref={iconRef} />
                ) : (
                  <LockOpen ref={iconRef} />
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center">
              <ColorPicker
                color={`hsl(${value})`}
                onChangeAction={(color) => updateColor(key, color)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="screen-line-before py-1.5">
        <Prose>{m.utils_color_intro_line1()}</Prose>
        <Prose>{m.utils_color_intro_line2()}</Prose>
      </div>

      <div className="screen-line-before py-3">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 overflow-hidden transition-colors duration-300 ease-in-out md:grid-cols-2 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {colorEntries.map(([key, value]) => (
            <div
              className="flex items-center justify-between"
              key={key}
            >
              <div className="flex flex-col items-start gap-y-1">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {key}
                </span>
                <span
                  className="rounded-md px-1 py-0.5 text-foreground text-xs sm:text-sm"
                  style={{
                    backgroundColor: `hsl(${value})`,
                    borderColor: `hsl(${colorScheme.border})`,
                    color: `hsl(${getContrastColor(value)})`,
                  }}
                >
                  {value}
                </span>
              </div>
              <CopyButton value={`--${key}: ${value};`} />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="screen-line-before flex justify-end py-1.5">
        <Button
          onClick={() => handleCopy(buildCSSOutput(colorScheme))}
          variant="outline"
        >
          {m.utils_color_copy_button()}
        </Button>
      </div>
    </>
  );
};
