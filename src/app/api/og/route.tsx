import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import type { JSX } from "react";

import GLOBAL_DATA from "@/data/global";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const FONT_PATH = join(
  // oxlint-disable-next-line unicorn/prefer-import-meta-properties -- import.meta.dirname est undefined sous Turbopack
  dirname(fileURLToPath(import.meta.url)),
  "fonts"
);

const PAGE_BADGES = {
  blog: "Blog",
  blogArticle: "Article de blog",
  components: "Composants",
  componentsArticle: "Composant",
  homepage: "Page d'accueil",
  utils: "Outils",
  utilsArticle: "Outil",
} as const;

type PageType = keyof typeof PAGE_BADGES;

// les cartes sociales des pages /en portaient un badge français
const PAGE_BADGES_EN: Record<PageType, string> = {
  blog: "Blog",
  blogArticle: "Blog article",
  components: "Components",
  componentsArticle: "Component",
  homepage: "Homepage",
  utils: "Tools",
  utilsArticle: "Tool",
};

const isValidPageType = (value: string): value is PageType =>
  value in PAGE_BADGES;

let fontCache: Buffer | null = null;

const loadFont = async (): Promise<Buffer> => {
  if (fontCache) {
    return fontCache;
  }

  fontCache = await readFile(
    join(FONT_PATH, "GeistPixel-Square.ttf")
  );
  return fontCache;
};

const getBadge = (type: PageType, isEnglish: boolean): string => {
  const badges = isEnglish ? PAGE_BADGES_EN : PAGE_BADGES;

  if (type === "homepage") {
    return badges.homepage;
  }
  return `portfolio | ${GLOBAL_DATA.USER.fullName} | ${badges[type].toLowerCase()}`;
};

const OG_DIMENSIONS = { height: 630, width: 1200 } as const;

// au-delà, le texte débordait déjà de la carte : tronquer ne dégrade rien
const MAX_TITLE_LENGTH = 90;
const MAX_DESCRIPTION_LENGTH = 180;

const truncate = (value: string, max: number): string =>
  value.length > max
    ? `${value.slice(0, max - 1).trimEnd()}…`
    : value;

const renderLayout = (
  content: JSX.Element,
  fontFamily = "sans-serif"
): JSX.Element => (
  <div
    style={{
      alignItems: "flex-start",
      background: "#FAF9F6",
      display: "flex",
      flexDirection: "column",
      fontFamily,
      height: "100%",
      justifyContent: "space-between",
      padding: "60px 60px 40px 60px",
      position: "relative",
      width: "100%",
    }}
  >
    <img
      alt="Cuzeac Florin"
      height={300}
      src="https://cuzeacflorin.fr/images/og-banner.webp"
      style={{
        borderRadius: 20,
        bottom: "-10%",
        left: "-5%",
        objectFit: "contain",
        position: "absolute",
      }}
      width={1000}
    />

    {content}

    <div
      style={{
        alignItems: "center",
        color: "#141413",
        display: "flex",
        fontSize: 24,
      }}
    >
      <div
        style={{
          background: "#00C950",
          borderRadius: "50%",
          height: 8,
          marginRight: 12,
          width: 8,
        }}
      />
      {GLOBAL_DATA.SOCIAL.portfolio} -
      <span
        style={{
          color: "#71717B",
          marginLeft: 12,
          textTransform: "lowercase",
        }}
      >
        {GLOBAL_DATA.WORK.title}
      </span>
    </div>
  </div>
);

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;

    const rawType = searchParams.get("type") ?? "homepage";
    const type: PageType = isValidPageType(rawType)
      ? rawType
      : "homepage";
    // l'endpoint est public : sans plafond, un title de 100 ko fait rendre à
    // Satori un texte géant (CPU/mémoire) et pollue le cache CDN par URL.
    const title = truncate(
      searchParams.get("title") || GLOBAL_DATA.USER.fullName,
      MAX_TITLE_LENGTH
    );
    const description = truncate(
      searchParams.get("description") || GLOBAL_DATA.USER.bio,
      MAX_DESCRIPTION_LENGTH
    );

    const font = await loadFont();
    const badge = getBadge(type, searchParams.get("locale") === "en");

    return new ImageResponse(
      renderLayout(
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              alignSelf: "flex-start",
              border: "1px solid #141413",
              borderRadius: 10,
              color: "#141413",
              display: "flex",
              fontSize: 20,
              fontWeight: 400,
              marginBottom: 40,
              padding: "8px 16px",
            }}
          >
            {badge}
          </div>
          <div
            style={{
              color: "#141413",
              fontSize: 58,
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 20,
              maxWidth: 1000,
              textTransform: "lowercase",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#141413",
              fontSize: 30,
              fontWeight: 400,
              maxWidth: 900,
              textTransform: "lowercase",
            }}
          >
            {description}
          </div>
        </div>,
        "Geist Pixel"
      ),
      {
        ...OG_DIMENSIONS,
        fonts: [
          {
            data: font,
            name: "Geist Pixel",
            style: "normal",
            weight: 400,
          },
        ],
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error) {
    logger.error("Error generating OG image:", error);

    return new ImageResponse(
      renderLayout(
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#E11D48",
              fontSize: 58,
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 20,
              maxWidth: 1000,
              textTransform: "lowercase",
            }}
          >
            oups ...
          </div>
          <div
            style={{
              color: "#F43F5E",
              fontSize: 30,
              fontWeight: 400,
              maxWidth: 900,
              textTransform: "lowercase",
            }}
          >
            une erreur est survenue !
          </div>
        </div>
      ),
      OG_DIMENSIONS
    );
  }
};
