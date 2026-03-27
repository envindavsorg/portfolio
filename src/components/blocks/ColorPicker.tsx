"use client";

import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";

import { Label } from "@/components/base/Label";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/primitives/Popover";
import {
  hexToHsl,
  normalizeColor,
  trimColorString,
} from "@/lib/palette";

import { Check } from "../motion/Check";
import { ChevronDown } from "../motion/ChevronDown";
import { ChevronUp } from "../motion/ChevronUp";

const COLOR_PRESETS = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#4CD964",
  "#5AC8FA",
  "#007AFF",
  "#5856D6",
  "#FF2D55",
  "#8E8E93",
  "#EFEFF4",
  "#E5E5EA",
  "#D1D1D6",
] as const;

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const HSL_REGEX = /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/;

const parseHslFromColor = (
  normalized: string
): [number, number, number] => {
  if (normalized.startsWith("#")) {
    return hexToHsl(normalized);
  }
  const matches = normalized.match(/\d+(\.\d+)?/g)?.map(Number);
  return matches ? [matches[0], matches[1], matches[2]] : [0, 0, 0];
};

const formatHsl = (h: number, s: number, l: number) =>
  `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;

const hexToRgb = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const getRelativeLuminance = ([r, g, b]: [
  number,
  number,
  number,
]) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.039_28 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const isLightColor = (hex: string) =>
  getRelativeLuminance(hexToRgb(hex)) > 0.4;

interface ColorPickerProps {
  color: string;
  onChangeAction: (color: string) => void;
}

export const ColorPicker = ({
  color,
  onChangeAction,
}: ColorPickerProps) => {
  const onChangeRef = useRef(onChangeAction);
  onChangeRef.current = onChangeAction;

  const [hsl, setHsl] = useState<[number, number, number]>(() =>
    parseHslFromColor(normalizeColor(color))
  );
  const [colorInput, setColorInput] = useState(() =>
    normalizeColor(color)
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<AnimatedIconHandle>(null);

  const applyColor = useCallback((newColor: string) => {
    const normalized = normalizeColor(newColor);
    setColorInput(normalized);

    const parsed = parseHslFromColor(normalized);
    setHsl(parsed);
    onChangeRef.current(formatHsl(...parsed));
  }, []);

  const handleHueChange = useCallback(
    (hue: number) => {
      const newHsl: [number, number, number] = [hue, hsl[1], hsl[2]];
      setHsl(newHsl);
      setSelectedPreset(null);
      applyColor(formatHsl(...newHsl));
    },
    [hsl, applyColor]
  );

  const handleSaturationLightnessChange = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const s = Math.round(
        ((event.clientX - rect.left) / rect.width) * 100
      );
      const l = Math.round(
        100 - ((event.clientY - rect.top) / rect.height) * 100
      );
      const newHsl: [number, number, number] = [hsl[0], s, l];
      setHsl(newHsl);
      setSelectedPreset(null);
      applyColor(formatHsl(...newHsl));
    },
    [hsl, applyColor]
  );

  const handleColorInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setColorInput(value);
      setSelectedPreset(null);

      if (HEX_REGEX.test(value) || HSL_REGEX.test(value)) {
        applyColor(value);
      }
    },
    [applyColor]
  );

  const handlePresetClick = useCallback(
    (preset: string) => {
      setSelectedPreset(preset);
      applyColor(preset);
    },
    [applyColor]
  );

  const handleMouseEnter = useCallback(
    () => iconRef.current?.startAnimation(),
    []
  );
  const handleMouseLeave = useCallback(
    () => iconRef.current?.stopAnimation(),
    []
  );

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        asChild
        className="[&_span]:size-4 [&_span]:rounded-full [&_span]:border [&_span]:border-foreground"
      >
        <Button
          className="flex w-full items-center justify-start [&_p]:text-foreground"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          variant="outline"
        >
          <span style={{ backgroundColor: colorInput }} />
          <p>{trimColorString(colorInput)}</p>
          <div className="ms-auto">
            {isOpen ? (
              <ChevronUp ref={iconRef} />
            ) : (
              <ChevronDown ref={iconRef} />
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-3" sideOffset={6}>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative h-40 w-full cursor-crosshair overflow-hidden rounded-lg"
            onClick={handleSaturationLightnessChange}
            style={{
              background: `linear-gradient(to top, rgba(0, 0, 0, 1), transparent), linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 0, 0, 0)), hsl(${hsl[0]}, 100%, 50%)`,
            }}
          >
            <motion.div
              className="absolute size-4 rounded-full border-2 border-white shadow-md"
              style={{
                backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
                left: `${hsl[1]}%`,
                top: `${100 - hsl[2]}%`,
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          </motion.div>

          <motion.input
            className="h-3 w-full cursor-pointer appearance-none rounded-full"
            max="360"
            min="0"
            onChange={(e) => handleHueChange(Number(e.target.value))}
            style={{
              background:
                "linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))",
            }}
            type="range"
            value={hsl[0]}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />

          <div className="flex items-center space-x-2">
            <Label className="sr-only" htmlFor="color-input">
              entrez une couleur ...
            </Label>
            <Input
              className="h-10 grow"
              id="color-input"
              onChange={handleColorInputChange}
              placeholder="#RRGGBB or hsl(h, s%, l%)"
              type="text"
              value={colorInput}
            />
            <motion.div
              className="aspect-square size-9 rounded-md"
              style={{ backgroundColor: colorInput }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          </div>

          <div className="grid grid-cols-6 gap-2">
            <AnimatePresence>
              {COLOR_PRESETS.map((preset) => (
                <motion.button
                  className="relative size-8 rounded-full"
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  style={{ backgroundColor: preset }}
                  type="button"
                  whileHover={{ scale: 1.2, zIndex: 1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {selectedPreset === preset && (
                    <motion.div
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                      exit={{ scale: 0 }}
                      initial={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check
                        size={18}
                        style={{
                          color: isLightColor(preset)
                            ? "#000000"
                            : "#FFFFFF",
                        }}
                      />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};
