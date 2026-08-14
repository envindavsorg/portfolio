"use client";

import type {
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const PIXEL_FONTS = [
  "font-pixel-square",
  "font-pixel-grid",
  "font-pixel-circle",
  "font-pixel-triangle",
  "font-pixel-line",
] as const;

const FONT_LABELS = [
  "Square",
  "Grid",
  "Circle",
  "Triangle",
  "Line",
] as const;
const FONT_COUNT = PIXEL_FONTS.length;

const PREFIX_FONT_MAP: Record<string, string> = {
  circle: "font-pixel-circle",
  grid: "font-pixel-grid",
  line: "font-pixel-line",
  square: "font-pixel-square",
  triangle: "font-pixel-triangle",
};

const ISOLATE_FONT_MAP: Record<string, string> = {
  mono: "font-mono",
  sans: "font-sans",
};

const resolveIsolateFont = (value: string): string =>
  ISOLATE_FONT_MAP[value] ?? value;

const PHI = (1 + Math.sqrt(5)) / 2;

const TICK_MS = 50;

const goldenBase = (index: number): number =>
  Math.floor((index * PHI * FONT_COUNT) % FONT_COUNT);

const pseudoRandom = (tick: number, index: number): number =>
  // débordement uint32 volontaire : c'est ce qui rend le hachage déterministe
  ((tick * 2_654_435_761 + index * 340_573_321) >>> 0) % FONT_COUNT;

const extractText = (children: ReactNode): string => {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join("");
  }
  if (
    children !== null &&
    children !== undefined &&
    typeof children === "object" &&
    "props" in children
  ) {
    return extractText(
      (children as ReactElement<{ children?: ReactNode }>).props
        .children
    );
  }
  return "";
};

export type PixelHeadingMode =
  | "uniform"
  | "multi"
  | "wave"
  | "random";

interface CharFontParams {
  mode: PixelHeadingMode;
  vi: number;
  msElapsed: number;
  cycleInterval: number;
  staggerDelay: number;
  defaultFontIndex: number;
}

const computeCharFont = ({
  mode,
  vi,
  msElapsed,
  cycleInterval,
  staggerDelay,
  defaultFontIndex,
}: CharFontParams): number => {
  const charMs = Math.max(0, msElapsed - vi * staggerDelay);
  const staggeredCycles = Math.floor(charMs / cycleInterval);

  switch (mode) {
    case "uniform": {
      const cycles = Math.floor(msElapsed / cycleInterval);
      return (defaultFontIndex + cycles) % FONT_COUNT;
    }
    case "multi": {
      return (goldenBase(vi) + staggeredCycles) % FONT_COUNT;
    }
    case "wave": {
      return (vi + staggeredCycles) % FONT_COUNT;
    }
    case "random": {
      return staggeredCycles > 0
        ? pseudoRandom(staggeredCycles, vi)
        : goldenBase(vi);
    }
    default: {
      return defaultFontIndex;
    }
  }
};

type PrefixFont =
  | "square"
  | "grid"
  | "circle"
  | "triangle"
  | "line"
  | "none";

const PixelPrefix = ({
  prefix,
  prefixFont,
  isolate,
}: {
  prefix: string;
  prefixFont: PrefixFont;
  isolate?: Record<string, string>;
}) => {
  const prefixFontClass =
    prefixFont === "none" ? undefined : PREFIX_FONT_MAP[prefixFont];

  return (
    <>
      {isolate ? (
        [...prefix].map((char, i) => (
          <span
            aria-hidden
            className={cn(
              prefixFontClass,
              isolate[char]
                ? resolveIsolateFont(isolate[char])
                : undefined
            )}
            key={`p${i}`}
          >
            {char}
          </span>
        ))
      ) : (
        <span aria-hidden className={prefixFontClass}>
          {prefix}
        </span>
      )}
      <span> </span>
    </>
  );
};

export interface PixelHeadingProps extends ComponentProps<"h1"> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  cycleInterval?: number;
  defaultFontIndex?: number;
  onFontIndexChange?: (index: number) => void;
  showLabel?: boolean;
  mode?: PixelHeadingMode;
  staggerDelay?: number;
  autoPlay?: boolean;
  prefix?: string;
  prefixFont?:
    | "square"
    | "grid"
    | "circle"
    | "triangle"
    | "line"
    | "none";
  isolate?: Record<string, string>;
}

export const PixelHeading = ({
  children,
  as: Tag = "h1",
  className,
  cycleInterval = 150,
  defaultFontIndex = 0,
  onFontIndexChange,
  showLabel = false,
  mode = "multi",
  staggerDelay = 50,
  autoPlay = true,
  prefix,
  prefixFont = "none",
  isolate,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: PixelHeadingProps) => {
  const text = useMemo(() => extractText(children), [children]);

  const [msElapsed, setMsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const prevUniformIndex = useRef(defaultFontIndex);
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!autoPlay || prefersReducedMotion) {
      return;
    }

    setIsActive(true);
    setMsElapsed(0);

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const start = () => {
      if (intervalRef.current) {
        return;
      }
      intervalRef.current = setInterval(() => {
        setMsElapsed((prev) => prev + TICK_MS);
      }, TICK_MS);
    };

    // le minuteur tournait indéfiniment, y compris onglet en arrière-plan et
    // titre hors de l'écran : vingt rendus par seconde pour rien.
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !document.hidden) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 }
    );

    const element = containerRef.current;
    if (element) {
      observer.observe(element);
    } else {
      start();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
    };
  }, [autoPlay, prefersReducedMotion]);

  const charFonts = useMemo(() => {
    const fonts: number[] = [];
    let vi = 0;
    for (const char of text) {
      if (char === " ") {
        fonts.push(-1);
        continue;
      }
      fonts.push(
        computeCharFont({
          cycleInterval,
          defaultFontIndex,
          mode,
          msElapsed,
          staggerDelay,
          vi,
        })
      );
      vi += 1;
    }
    return fonts;
  }, [
    text,
    mode,
    msElapsed,
    cycleInterval,
    staggerDelay,
    defaultFontIndex,
  ]);

  useEffect(() => {
    if (mode !== "uniform") {
      return;
    }
    const idx = charFonts.find((f) => f !== -1) ?? defaultFontIndex;
    if (idx !== prevUniformIndex.current) {
      prevUniformIndex.current = idx;
      onFontIndexChange?.(idx);
    }
  }, [charFonts, mode, defaultFontIndex, onFontIndexChange]);

  const activeLabel = useMemo(() => {
    if (mode === "uniform") {
      const idx = charFonts.find((f) => f !== -1) ?? 0;
      return FONT_LABELS[idx];
    }
    const modeLabels: Record<PixelHeadingMode, string> = {
      multi: "Multi",
      random: "Random",
      uniform: "",
      wave: "Wave",
    };
    return modeLabels[mode];
  }, [mode, charFonts]);

  const startCycling = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(true);
    setMsElapsed(0);
    intervalRef.current = setInterval(() => {
      setMsElapsed((prev) => prev + TICK_MS);
    }, TICK_MS);
  }, [prefersReducedMotion]);

  const stopCycling = useCallback(() => {
    if (autoPlay) {
      setIsActive(true);
      return;
    }
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [autoPlay]);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLHeadingElement>) => {
      startCycling();
      onMouseEnter?.(event);
    },
    [startCycling, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLHeadingElement>) => {
      stopCycling();
      onMouseLeave?.(event);
    },
    [stopCycling, onMouseLeave]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLHeadingElement>) => {
      startCycling();
      onFocus?.(event);
    },
    [startCycling, onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLHeadingElement>) => {
      stopCycling();
      onBlur?.(event);
    },
    [stopCycling, onBlur]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLHeadingElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setMsElapsed((prev) => prev + cycleInterval);
      }
      onKeyDown?.(event);
    },
    [cycleInterval, onKeyDown]
  );

  const uniformIdx =
    mode === "uniform"
      ? (charFonts.find((f) => f !== -1) ?? defaultFontIndex)
      : 0;

  return (
    <div
      className="inline-flex flex-col items-start gap-2"
      data-slot="pixel-heading"
      ref={containerRef}
    >
      <Tag
        aria-label={prefix ? `${prefix} ${text}` : text}
        className={cn(
          "cursor-default select-none text-[28px] sm:text-5xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          mode === "uniform" && PIXEL_FONTS[uniformIdx],
          className
        )}
        data-mode={mode}
        data-state={isActive ? "active" : "idle"}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        {...props}
      >
        {prefix && (
          <PixelPrefix
            isolate={isolate}
            prefix={prefix}
            prefixFont={prefixFont}
          />
        )}

        {mode === "uniform"
          ? children
          : [...text].map((char, i) => {
              if (char === " ") {
                return <span key={i}> </span>;
              }
              const isolateFont = isolate?.[char];
              return (
                <span
                  aria-hidden
                  className={
                    isolateFont
                      ? resolveIsolateFont(isolateFont)
                      : PIXEL_FONTS[charFonts[i]]
                  }
                  key={i}
                >
                  {char}
                </span>
              );
            })}
      </Tag>
      {showLabel && (
        <output
          aria-live="polite"
          className={cn(
            "text-muted-foreground text-xs uppercase tracking-widest transition-opacity duration-200",
            isActive || autoPlay ? "opacity-100" : "opacity-0"
          )}
          data-slot="pixel-heading-label"
        >
          {activeLabel}
        </output>
      )}
    </div>
  );
};
