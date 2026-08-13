import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import type { JSX } from "react";

import GLOBAL_DATA from "@/data/global";
import { logger } from "@/lib/logger";
import type { OgPalette } from "@/lib/og";
import {
  isPageType,
  MAX_DESCRIPTION_LENGTH,
  MAX_META_LENGTH,
  MAX_TITLE_LENGTH,
  ogBadge,
  ogFamily,
  ogMetaParts,
  ogPalette,
  ogTitleSize,
  truncate,
} from "@/lib/og";

/**
 * Les cartes sociales, une par famille de page.
 *
 * Ce fichier ne décide plus rien : les couleurs, les mots et les seuils viennent
 * de `src/lib/og.ts`, qui est testé. Ici il n'y a que de la composition pour
 * Satori — et Satori impose ses règles : flexbox seulement, `display: flex`
 * explicite sur tout conteneur à plusieurs enfants, pas de grille CSS.
 */

export const runtime = "nodejs";

const FONT_PATH = join(
  // `import.meta.dirname` est undefined sous Turbopack
  dirname(fileURLToPath(import.meta.url)),
  "fonts"
);

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

const OG_DIMENSIONS = { height: 630, width: 1200 } as const;

/** insets des guides : la même valeur que les `screen-line` du site */
const GUIDE_INSET = 64;

interface CardProps {
  badge: string;
  description: string;
  meta: string[];
  palette: OgPalette;
  title: string;
}

/**
 * Les quatre guides en pointillés.
 *
 * Ce ne sont pas un ornement emprunté : le site trace exactement ces lignes sur
 * chacune de ses pages (`screen-line-before` / `screen-line-after`). Les
 * retrouver sur la carte fait que l'image et la page se ressemblent.
 */
const Guides = ({ palette }: { palette: OgPalette }): JSX.Element => (
  <div style={{ display: "flex" }}>
    <div
      style={{
        borderLeft: `1px dashed ${palette.guide}`,
        bottom: 0,
        left: GUIDE_INSET,
        position: "absolute",
        top: 0,
        width: 1,
      }}
    />
    <div
      style={{
        borderLeft: `1px dashed ${palette.guide}`,
        bottom: 0,
        position: "absolute",
        right: GUIDE_INSET,
        top: 0,
        width: 1,
      }}
    />
    <div
      style={{
        borderTop: `1px dashed ${palette.guide}`,
        height: 1,
        left: 0,
        position: "absolute",
        right: 0,
        top: GUIDE_INSET,
      }}
    />
    <div
      style={{
        borderTop: `1px dashed ${palette.guide}`,
        bottom: GUIDE_INSET,
        height: 1,
        left: 0,
        position: "absolute",
        right: 0,
      }}
    />
  </div>
);

const Badge = ({
  label,
  palette,
}: {
  label: string;
  palette: OgPalette;
}): JSX.Element => (
  <div
    style={{
      alignSelf: "flex-start",
      backgroundColor: palette.accentSoft,
      borderRadius: 999,
      color: palette.accentInk,
      display: "flex",
      fontSize: 26,
      padding: "10px 24px",
    }}
  >
    {label}
  </div>
);

/** la signature du site, en haut à droite de chaque carte */
const Brand = ({ palette }: { palette: OgPalette }): JSX.Element => (
  <div
    style={{
      alignItems: "center",
      color: palette.ink,
      display: "flex",
      fontSize: 26,
      position: "absolute",
      right: 100,
      top: 92,
    }}
  >
    <div
      style={{
        backgroundColor: palette.accent,
        borderRadius: "50%",
        display: "flex",
        height: 10,
        marginRight: 12,
        width: 10,
      }}
    />
    cuzeacflorin.fr
  </div>
);

const MetaRow = ({
  meta,
  palette,
}: {
  meta: string[];
  palette: OgPalette;
}): JSX.Element | null => {
  if (meta.length === 0) {
    return null;
  }

  return (
    <div style={{ alignItems: "center", display: "flex" }}>
      {meta.map((part, index) => (
        <div
          key={part}
          style={{ alignItems: "center", display: "flex" }}
        >
          {index > 0 && (
            <div
              style={{
                color: palette.accent,
                display: "flex",
                padding: "0 14px",
              }}
            >
              ·
            </div>
          )}
          <div style={{ color: palette.muted, display: "flex" }}>
            {part}
          </div>
        </div>
      ))}
    </div>
  );
};

/** l'ossature commune : fond, guides, signature, et le contenu au milieu */
const Shell = ({
  children,
  palette,
}: {
  children: JSX.Element;
  palette: OgPalette;
}): JSX.Element => (
  <div
    style={{
      backgroundColor: palette.canvas,
      color: palette.ink,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      justifyContent: "space-between",
      padding: "92px 100px",
      position: "relative",
      textTransform: "lowercase",
      width: "100%",
    }}
  >
    <Guides palette={palette} />
    <Brand palette={palette} />
    {children}
  </div>
);

/** gabarit par défaut : pastille, titre, description, méta */
const StandardCard = ({
  badge,
  description,
  meta,
  palette,
  title,
}: CardProps): JSX.Element => (
  <Shell palette={palette}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Badge label={badge} palette={palette} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: ogTitleSize(title),
            lineHeight: 1.08,
            maxWidth: 940,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: palette.muted,
            display: "flex",
            fontSize: 30,
            lineHeight: 1.35,
            marginTop: 26,
            maxWidth: 880,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 26,
        }}
      >
        <MetaRow meta={meta} palette={palette} />
      </div>
    </div>
  </Shell>
);

/**
 * Les outils sont un TERMINAL.
 *
 * Une page /utils est un utilitaire qu'on manipule, pas un texte qu'on lit : sa
 * carte le dit d'un coup d'œil, fond sombre et invite de commande. C'est la
 * seule famille dont le fond change, et c'est voulu — dans un fil, elle ne peut
 * pas être confondue avec un article.
 */
const TerminalCard = ({
  badge,
  description,
  meta,
  palette,
  title,
}: CardProps): JSX.Element => (
  <Shell palette={palette}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Badge label={badge} palette={palette} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ alignItems: "baseline", display: "flex" }}>
          <div
            style={{
              color: palette.accent,
              display: "flex",
              fontSize: ogTitleSize(title),
              marginRight: 24,
            }}
          >
            $
          </div>
          <div
            style={{
              display: "flex",
              fontSize: ogTitleSize(title),
              lineHeight: 1.08,
              maxWidth: 860,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            color: palette.muted,
            display: "flex",
            fontSize: 30,
            lineHeight: 1.35,
            marginTop: 26,
            maxWidth: 880,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 26,
        }}
      >
        <MetaRow meta={meta} palette={palette} />
      </div>
    </div>
  </Shell>
);

/**
 * Une fiche de poste met la PÉRIODE en avant.
 *
 * C'est l'information qu'on cherche sur un parcours, et elle se lit d'un coup
 * d'œil : la carte l'affiche en grand à gauche du titre plutôt que noyée dans
 * une ligne de méta.
 */
const PeriodCard = ({
  badge,
  description,
  meta,
  palette,
  title,
}: CardProps): JSX.Element => {
  const [period, ...rest] = meta;

  return (
    <Shell palette={palette}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Badge label={badge} palette={palette} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {period && (
            <div
              style={{
                color: palette.accent,
                display: "flex",
                fontSize: 40,
                marginBottom: 18,
              }}
            >
              {period}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontSize: ogTitleSize(title),
              lineHeight: 1.08,
              maxWidth: 940,
            }}
          >
            {title}
          </div>

          <div
            style={{
              color: palette.muted,
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              marginTop: 22,
              maxWidth: 880,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 26,
          }}
        >
          <MetaRow meta={rest} palette={palette} />
        </div>
      </div>
    </Shell>
  );
};

/** un projet montre sa STACK, en pastilles */
const ChipsCard = ({
  badge,
  description,
  meta,
  palette,
  title,
}: CardProps): JSX.Element => (
  <Shell palette={palette}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Badge label={badge} palette={palette} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: ogTitleSize(title),
            lineHeight: 1.08,
            maxWidth: 940,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: palette.muted,
            display: "flex",
            fontSize: 30,
            lineHeight: 1.35,
            marginTop: 26,
            maxWidth: 880,
          }}
        >
          {description}
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {meta.map((chip) => (
          <div
            key={chip}
            style={{
              border: `1px solid ${palette.guide}`,
              borderRadius: 999,
              color: palette.muted,
              display: "flex",
              fontSize: 24,
              marginRight: 12,
              padding: "8px 18px",
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

/**
 * L'accueil se distingue par une rangée de PIXELS, pas par une image.
 *
 * La version précédente affichait une bannière `.webp` allée chercher sur le
 * domaine à chaque rendu. Deux défauts, tous deux vérifiés : Satori ne sait pas
 * décoder ce WebP — la carte tombait avec « u2 is not iterable » et la route
 * répondait par son repli — et une image distante fait dépendre la génération
 * d'un réseau qui peut manquer, comme sur la machine d'intégration continue.
 *
 * Le motif la remplace : des carrés d'accent dégradés, qui citent la fonte pixel
 * du site sans coûter un octet de réseau ni un décodeur.
 */
const HomeCard = ({
  badge,
  description,
  meta,
  palette,
  title,
}: CardProps): JSX.Element => (
  <Shell palette={palette}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Badge label={badge} palette={palette} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", marginBottom: 34 }}>
          {[0, 1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              style={{
                backgroundColor: palette.accent,
                display: "flex",
                height: 18,
                marginRight: 10,
                opacity: 1 - step * 0.15,
                width: 18,
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: ogTitleSize(title),
            lineHeight: 1.08,
            maxWidth: 800,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: palette.muted,
            display: "flex",
            fontSize: 30,
            lineHeight: 1.35,
            marginTop: 26,
            maxWidth: 640,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 26,
        }}
      >
        <MetaRow
          meta={meta.length > 0 ? meta : [GLOBAL_DATA.WORK.title]}
          palette={palette}
        />
      </div>
    </div>
  </Shell>
);

const CARDS: Record<
  ReturnType<typeof ogFamily>,
  (props: CardProps) => JSX.Element
> = {
  components: StandardCard,
  experience: PeriodCard,
  home: HomeCard,
  project: ChipsCard,
  tools: TerminalCard,
  writing: StandardCard,
};

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;

  const rawType = searchParams.get("type") ?? "homepage";
  const type: PageType = isPageType(rawType) ? rawType : "homepage";
  const palette = ogPalette(type);

  try {
    const title = truncate(
      searchParams.get("title") || GLOBAL_DATA.USER.fullName,
      MAX_TITLE_LENGTH
    );
    const description = truncate(
      searchParams.get("description") || GLOBAL_DATA.USER.bio,
      MAX_DESCRIPTION_LENGTH
    );
    const meta = ogMetaParts(
      truncate(searchParams.get("meta") ?? "", MAX_META_LENGTH)
    );

    const font = await loadFont();
    const Card = CARDS[ogFamily(type)];

    return new ImageResponse(
      <Card
        badge={ogBadge(type, searchParams.get("locale") === "en")}
        description={description}
        meta={meta}
        palette={palette}
        title={title}
      />,
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

    /**
     * La carte de repli reste une CARTE, dans la palette du type demandé.
     *
     * Un lien partagé dont l'aperçu affiche « oups » en rouge est pire que pas
     * d'aperçu du tout : il donne l'impression que la page elle-même est
     * cassée, alors que seule la génération de l'image a échoué.
     */
    return new ImageResponse(
      <StandardCard
        badge={ogBadge(type, searchParams.get("locale") === "en")}
        description={GLOBAL_DATA.USER.bio}
        meta={[]}
        palette={palette}
        title={GLOBAL_DATA.USER.fullName}
      />,
      OG_DIMENSIONS
    );
  }
};
