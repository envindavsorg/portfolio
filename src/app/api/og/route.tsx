import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import GLOBAL_DATA from "@/content/data/global";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const FONT_PATH = join(process.cwd(), "src", "assets", "fonts");

const PAGE_BADGES = {
  homepage: "Page d'accueil",
  blog: "Blog",
  blogArticle: "Article de blog",
  components: "Composants",
  componentsArticle: "Composant",
  utils: "Outils",
  utilsArticle: "Outil",
} as const;

type PageType = keyof typeof PAGE_BADGES;

let fontsCache: { regular: Buffer; medium: Buffer; bold: Buffer } | null = null;

const loadFonts = async () => {
  if (fontsCache) {
    return fontsCache;
  }

  const [regular, medium, bold] = await Promise.all([
    readFile(join(FONT_PATH, "Geist-Regular.ttf")),
    readFile(join(FONT_PATH, "Geist-Medium.ttf")),
    readFile(join(FONT_PATH, "Geist-Bold.ttf")),
  ]);

  fontsCache = { regular, medium, bold };
  return fontsCache;
};

const getBadge = (type: PageType): string => {
  if (type === "homepage") {
    return PAGE_BADGES.homepage;
  }
  return `Portfolio | ${GLOBAL_DATA.USER.fullName} | ${PAGE_BADGES[type]}`;
};

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;

    const type = (searchParams.get("type") as PageType) || "homepage";
    const title = searchParams.get("title") || GLOBAL_DATA.USER.fullName;
    const description = searchParams.get("description") || GLOBAL_DATA.USER.bio;

    const [fonts, badge] = await Promise.all([
      loadFonts(),
      Promise.resolve(getBadge(type)),
    ]);

    return new ImageResponse(
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "#FAF9F6",
          padding: "60px 60px 40px 60px",
          fontFamily: "Geist Sans",
        }}
      >
        <img
          alt=""
          height={300}
          src="https://cuzeacflorin.fr/images/og-banner.png"
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            objectFit: "contain",
            borderRadius: 20,
          }}
          width={1000}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 20,
              fontWeight: 600,
              color: "#141413",
              marginBottom: 40,
              border: "1px solid #141413",
            }}
          >
            {badge}
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 800,
              color: "#141413",
              lineHeight: 1.1,
              marginBottom: 20,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: "#141413",
              maxWidth: 900,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: "#141413",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00C950",
              marginRight: 12,
            }}
          />
          {GLOBAL_DATA.SOCIAL.portfolio} -
          <span style={{ color: "#71717B", marginLeft: 12 }}>
            {GLOBAL_DATA.WORK.title}
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Geist Sans",
            data: fonts.regular,
            style: "normal",
            weight: 400,
          },
          {
            name: "Geist Sans",
            data: fonts.medium,
            style: "normal",
            weight: 600,
          },
          {
            name: "Geist Sans",
            data: fonts.bold,
            style: "normal",
            weight: 800,
          },
        ],
      },
    );
  } catch (error) {
    logger.error("Error generating OG image:", error);

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        Oups, une erreur est survenue !
      </div>,
      { width: 1200, height: 630 },
    );
  }
};
