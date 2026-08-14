"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Label } from "@/components/base/Label";
import { TextAnimate } from "@/components/blocks/TextAnimate";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { Slider } from "@/components/primitives/Slider";
import { Spinner } from "@/components/primitives/Spinner";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

interface PresetBackground {
  name: () => string;
  url: string;
}

interface FontOption {
  name: string;
  value: string;
  canvas: string;
}

interface AlignmentOption {
  value: CanvasTextAlign;
  label: () => string;
}

interface BannerConfig {
  title: string;
  subtitle: string;
  bgIndex: number;
  fontIndex: number;
  align: CanvasTextAlign;
  fontSize: number;
  overlayOpacity: number;
  textColor: string;
}

const PRESET_BACKGROUNDS: PresetBackground[] = [
  {
    name: () => m.utils_banner_bg_mystic_firs(),
    url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1400&q=80",
  },
  {
    name: () => m.utils_banner_bg_misty_forest(),
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80",
  },
  {
    name: () => m.utils_banner_bg_sunny_mountain(),
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80",
  },
];

const FONTS: FontOption[] = [
  {
    canvas: "Georgia",
    name: "Serif",
    value: "Georgia, serif",
  },
  {
    canvas: "Segoe UI",
    name: "Sans-serif",
    value: "'Segoe UI', sans-serif",
  },
  {
    canvas: "Courier New",
    name: "Mono",
    value: "'Courier New', monospace",
  },
  {
    canvas: '"Geist", sans-serif',
    name: "Geist Sans",
    value: "var(--font-geist-sans), sans-serif",
  },
  {
    canvas: '"Geist Mono", monospace',
    name: "Geist Mono",
    value: "var(--font-geist-mono), monospace",
  },
  {
    canvas: '"Geist Pixel Square", monospace',
    name: "Pixel Square",
    value: "var(--font-geist-pixel-square), monospace",
  },
  {
    canvas: '"Geist Pixel Grid", monospace',
    name: "Pixel Grid",
    value: "var(--font-geist-pixel-grid), monospace",
  },
  {
    canvas: '"Geist Pixel Circle", monospace',
    name: "Pixel Circle",
    value: "var(--font-geist-pixel-circle), monospace",
  },
  {
    canvas: '"Geist Pixel Triangle", monospace',
    name: "Pixel Triangle",
    value: "var(--font-geist-pixel-triangle), monospace",
  },
  {
    canvas: '"Geist Pixel Line", monospace',
    name: "Pixel Line",
    value: "var(--font-geist-pixel-line), monospace",
  },
];

const ALIGNMENTS: AlignmentOption[] = [
  { label: () => m.utils_banner_align_left(), value: "left" },
  { label: () => m.utils_banner_align_center(), value: "center" },
  { label: () => m.utils_banner_align_right(), value: "right" },
];

const CANVAS_W = 6016;
const CANVAS_H = 3388;
const ASPECT_RATIO = `${CANVAS_W} / ${CANVAS_H}`;

const DEFAULT_CONFIG: Omit<BannerConfig, "title" | "subtitle"> = {
  align: "center",
  bgIndex: 0,
  fontIndex: 0,
  fontSize: 380,
  overlayOpacity: 40,
  textColor: "#ffffff",
};

const getResolvedFontFamily = (
  fontValue: string,
  fallbackCanvasName: string
) => {
  if (typeof window === "undefined") {
    return fallbackCanvasName;
  }

  const match = fontValue.match(/var\((--[^)]+)\)/u);
  if (match) {
    const [, cssVarName] = match;
    const resolvedRealName = getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(cssVarName)
      .trim();

    if (resolvedRealName) {
      return resolvedRealName;
    }
  }
  return fallbackCanvasName;
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number
): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) {
    lines.push(line);
  }
  return lines;
};

const drawBanner = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: BannerConfig,
  img: HTMLImageElement | undefined
): boolean => {
  if (!img) {
    return false;
  }

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  const sw = iw * scale;
  const sh = ih * scale;
  ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);

  ctx.fillStyle = `rgba(0,0,0,${config.overlayOpacity / 100})`;
  ctx.fillRect(0, 0, w, h);

  const font = FONTS[config.fontIndex];
  const realFontFamily = getResolvedFontFamily(
    font.value,
    font.canvas
  );

  const pad = w * 0.08;
  const maxTextW = w - pad * 2;

  let textX = w / 2;
  if (config.align === "left") {
    textX = pad;
  } else if (config.align === "right") {
    textX = w - pad;
  }

  ctx.textAlign = config.align;

  const titleSize = Math.round(config.fontSize * (w / CANVAS_W));
  ctx.font = `700 ${titleSize}px ${realFontFamily}`;
  ctx.fillStyle = config.textColor;

  const titleLines = wrapText(ctx, config.title, maxTextW);
  const lineHeight = titleSize * 1.15;

  const hasSubtitle = config.subtitle.trim().length > 0;
  const subtitleSize = Math.round(titleSize * 0.35);
  const subLineHeight = subtitleSize * 1.5;
  const gap = titleSize * 0.2;

  const subLines = hasSubtitle
    ? wrapText(ctx, config.subtitle, maxTextW)
    : [];

  const totalTextH = hasSubtitle
    ? titleLines.length * lineHeight +
      gap +
      subLines.length * subLineHeight
    : titleLines.length * lineHeight;

  let y = (h - totalTextH) / 2 + titleSize;

  for (const line of titleLines) {
    ctx.font = `700 ${titleSize}px ${realFontFamily}`;
    ctx.fillStyle = config.textColor;
    ctx.fillText(line, textX, y);
    y += lineHeight;
  }

  if (hasSubtitle) {
    y += gap;
    ctx.font = `400 ${subtitleSize}px ${realFontFamily}`;
    ctx.fillStyle = `${config.textColor}bb`;
    for (const line of subLines) {
      ctx.fillText(line, textX, y);
      y += subLineHeight;
    }
  }

  return true;
};

export const ArticleBanner = () => {
  const [config, setConfig] = useState<BannerConfig>(() => ({
    ...DEFAULT_CONFIG,
    subtitle: m.utils_banner_default_subtitle(),
    title: m.utils_banner_default_title(),
  }));
  const [loadedImages, setLoadedImages] = useState<
    Record<number, HTMLImageElement>
  >({});
  const [downloading, setDownloading] = useState<
    false | "png" | "webp"
  >(false);
  const [fontsReady, setFontsReady] = useState(false);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const customImageUrlRef = useRef<string | null>(null);

  const imagesReady = Boolean(loadedImages[config.bgIndex]);

  const updateConfig = useCallback(
    <K extends keyof BannerConfig>(
      key: K,
      value: BannerConfig[K]
    ) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (customImageUrlRef.current) {
        URL.revokeObjectURL(customImageUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(file);
      customImageUrlRef.current = objectUrl;

      const img = new window.Image();
      img.addEventListener("load", () => {
        setLoadedImages((prev) => ({ ...prev, [-1]: img }));
        updateConfig("bgIndex", -1);
      });
      img.src = objectUrl;

      event.target.value = "";
    },
    [updateConfig]
  );

  useEffect(() => {
    const controllers: (() => void)[] = [];

    for (const [i, bg] of PRESET_BACKGROUNDS.entries()) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      let cancelled = false;
      img.addEventListener("load", () => {
        if (!cancelled) {
          setLoadedImages((prev) => ({ ...prev, [i]: img }));
        }
      });
      img.src = bg.url;
      controllers.push(() => {
        cancelled = true;
      });
    }

    return () => {
      for (const cancel of controllers) {
        cancel();
      }

      if (customImageUrlRef.current) {
        URL.revokeObjectURL(customImageUrlRef.current);
      }
    };
  }, []);

  // `config.fontIndex` est un déclencheur : changer de police impose de
  // réattendre `document.fonts.ready` avant de redessiner
  // biome-ignore lint/correctness/useExhaustiveDependencies: dépendance-déclencheur du changement de police
  useEffect(() => {
    let cancelled = false;

    const waitForFonts = async () => {
      await document.fonts.ready;
      if (!cancelled) {
        setFontsReady(true);
      }
    };

    waitForFonts();

    return () => {
      cancelled = true;
    };
  }, [config.fontIndex]);

  // `fontsReady` est un déclencheur : le corps ne le lit pas, mais la
  // prévisualisation doit être redessinée dès que les polices sont chargées,
  // sinon elle mesure du texte dans une fonte de repli
  // biome-ignore lint/correctness/useExhaustiveDependencies: dépendance-déclencheur du chargement des polices
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const canvas = previewRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      drawBanner(
        ctx,
        CANVAS_W,
        CANVAS_H,
        config,
        loadedImages[config.bgIndex]
      );
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [config, loadedImages, fontsReady]);

  const handleDownload = useCallback(
    (format: "png" | "webp") => {
      const img = loadedImages[config.bgIndex];
      if (!img) {
        return;
      }

      setDownloading(format);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = CANVAS_W;
      exportCanvas.height = CANVAS_H;
      const ctx = exportCanvas.getContext("2d");

      if (ctx) {
        drawBanner(ctx, CANVAS_W, CANVAS_H, config, img);
        const link = document.createElement("a");
        link.download = `banner-${Date.now()}.${format}`;

        const mimeType =
          format === "webp" ? "image/webp" : "image/png";
        const quality = format === "webp" ? 0.9 : 1;
        link.href = exportCanvas.toDataURL(mimeType, quality);
        link.click();
      }

      setTimeout(() => setDownloading(false), 1500);
    },
    [config, loadedImages]
  );

  return (
    <>
      <div className="relative py-3">
        <canvas
          aria-label={m.utils_banner_bg_legend()}
          className="block h-auto w-full rounded-xl"
          ref={previewRef}
          style={{ aspectRatio: ASPECT_RATIO }}
        />
        {!imagesReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-y-1">
              <Spinner className="size-8 text-theme" />
              <TextAnimate
                animation="slideUp"
                as="p"
                by="word"
                themed
              >
                {m.utils_banner_loading_image()}
              </TextAnimate>
            </div>
          </div>
        )}
      </div>

      <div className="screen-line-before flex gap-3 py-2 *:lowercase max-sm:flex-col sm:justify-end">
        <Button
          disabled={!imagesReady}
          onClick={() => handleDownload("png")}
          variant="outline"
        >
          {downloading === "png"
            ? m.utils_banner_png_downloaded()
            : m.utils_banner_download_png()}
        </Button>
        <Button
          disabled={!imagesReady}
          onClick={() => handleDownload("webp")}
        >
          {downloading === "webp"
            ? m.utils_banner_webp_downloaded()
            : m.utils_banner_download_webp()}
        </Button>
      </div>

      <div className="screen-line-before flex flex-col gap-y-3 py-3">
        <Label
          className="text-foreground text-sm"
          htmlFor="banner-title"
        >
          {m.utils_banner_title_label()}
        </Label>
        <Input
          id="banner-title"
          onChange={(event) =>
            updateConfig("title", event.target.value)
          }
          value={config.title}
        />
      </div>

      <div className="screen-line-before flex flex-col gap-y-3 py-3">
        <Label
          className="text-foreground text-sm"
          htmlFor="banner-subtitle"
        >
          {m.utils_banner_subtitle_label()}
        </Label>
        <Input
          id="banner-subtitle"
          onChange={(event) =>
            updateConfig("subtitle", event.target.value)
          }
          value={config.subtitle}
        />
      </div>

      <div className="screen-line-before py-3">
        <fieldset>
          <legend className="mb-3 text-foreground text-sm">
            {m.utils_banner_bg_legend()}
          </legend>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-y-2">
              <input
                accept="image/*"
                aria-label={m.utils_banner_custom_image_aria()}
                className="hidden"
                id="custom-image-upload"
                onChange={handleImageUpload}
                type="file"
              />
              <Label
                className={cn(
                  "relative flex aspect-video w-32 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-all",
                  config.bgIndex === -1
                    ? "border-theme opacity-100"
                    : "border-zinc-500 border-dashed opacity-60 hover:opacity-100"
                )}
                htmlFor="custom-image-upload"
              >
                {loadedImages[-1] ? (
                  // biome-ignore lint/performance/noImgElement: URL de blob créée dans le navigateur, hors de portée de l'optimiseur
                  <img
                    aria-label={m.utils_banner_custom_image_aria()}
                    className="m-0! block h-full w-full object-cover"
                    src={loadedImages[-1].src}
                  />
                ) : (
                  <span className="text-2xl text-zinc-500">+</span>
                )}
              </Label>
              <span
                className={cn(
                  "text-center text-xs",
                  config.bgIndex === -1 && "text-theme"
                )}
              >
                {m.utils_banner_custom_label()}
              </span>
            </div>

            {PRESET_BACKGROUNDS.map((bg, i) => (
              <div className="flex flex-col gap-y-2" key={bg.name()}>
                <button
                  aria-pressed={config.bgIndex === i}
                  className={cn(
                    "relative aspect-video w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                    config.bgIndex === i
                      ? "border-theme opacity-100"
                      : "border-transparent opacity-35 hover:opacity-70"
                  )}
                  onClick={() => updateConfig("bgIndex", i)}
                  type="button"
                >
                  <NextImage
                    alt={bg.name()}
                    className="m-0! block h-full w-full object-cover"
                    height={800}
                    loading="lazy"
                    src={bg.url}
                    width={1400}
                  />
                </button>
                <span
                  className={cn(
                    "text-center text-xs",
                    config.bgIndex === i && "text-theme"
                  )}
                >
                  {bg.name()}
                </span>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="screen-line-before py-3">
        <fieldset>
          <legend className="mb-3 text-foreground text-sm">
            {m.utils_banner_font_legend()}
          </legend>
          <div className="flex flex-wrap gap-3">
            {FONTS.map((f, i) => (
              <Button
                aria-pressed={config.fontIndex === i}
                className={cn(
                  config.fontIndex === i &&
                    "text-theme hover:text-theme"
                )}
                key={f.name}
                onClick={() => updateConfig("fontIndex", i)}
                style={{ fontFamily: f.value }}
                variant="outline"
              >
                {f.name}
              </Button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="screen-line-before grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-6 py-3">
        <fieldset>
          <legend className="mb-3 text-foreground text-sm">
            {m.utils_banner_alignment_legend()}
          </legend>
          <div className="flex flex-wrap gap-3">
            {ALIGNMENTS.map(({ value, label }) => (
              <Button
                aria-pressed={config.align === value}
                className={cn(
                  config.align === value &&
                    "text-theme hover:text-theme"
                )}
                key={value}
                onClick={() => updateConfig("align", value)}
                variant="outline"
              >
                {label()}
              </Button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-foreground text-sm">
            {m.utils_banner_color_legend()}
          </legend>
          <div className="flex items-center gap-3">
            <input
              aria-label={m.utils_banner_color_legend()}
              className="aspect-square size-12 cursor-pointer rounded-md border-none bg-transparent"
              id="text-color"
              onChange={(e) =>
                updateConfig("textColor", e.target.value)
              }
              type="color"
              value={config.textColor}
            />
            <div className="flex flex-col gap-y-1">
              <span className="text-muted-foreground text-xs">
                {getLocale() === "en" ? (
                  <>selected color:</>
                ) : (
                  <>Couleur sélectionnée :</>
                )}
              </span>
              <span
                className="text-lg uppercase"
                style={{
                  color: config.textColor,
                }}
              >
                {config.textColor}
              </span>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="screen-line-before grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-6 py-3">
        <div className="space-y-3">
          <Label className="text-foreground text-sm">
            {m.utils_banner_text_size_label()}{" "}
            <span className="text-base text-theme">
              {config.fontSize}px
            </span>
          </Label>
          <Slider
            aria-label={m.utils_banner_title_size_aria()}
            max={620}
            min={240}
            onValueChange={([v]) => updateConfig("fontSize", v)}
            step={1}
            value={[config.fontSize]}
          />
        </div>
        <div className="space-y-3">
          <Label className="text-foreground text-sm">
            {m.utils_banner_overlay_label()}{" "}
            <span className="text-base text-theme">
              {config.overlayOpacity}%
            </span>
          </Label>
          <Slider
            aria-label={m.utils_banner_overlay_opacity_aria()}
            max={80}
            min={0}
            onValueChange={([v]) => updateConfig("overlayOpacity", v)}
            step={1}
            value={[config.overlayOpacity]}
          />
        </div>
      </div>
    </>
  );
};
