# Technology Stack

**Analysis Date:** 2026-08-12

> Superseded the 2026-02-17 snapshot, which predated the i18n rewrite, the Base UI
> migration and the arrival of a test suite.

## Languages

**Primary:**

- TypeScript 6.0.3 — all application code in `src/`, `strict` enabled
- TSX — React components

**Secondary:**

- MDX — article, component and tool content in `src/content/`
- CSS — a single Tailwind v4 entry point (`src/app/globals.css`); no other
  stylesheet

## Runtime

- Node.js 22 (the version CI installs; no `engines` field pins it)
- pnpm 10.32.1 (`packageManager` field)
- Deployment target: Vercel

## Frameworks

**Next.js 16.2.7** — App Router, Turbopack, React Compiler
(`reactCompiler: true`), `reactStrictMode`. Notable configuration in
`next.config.ts`:

- `experimental.globalNotFound` for `app/global-not-found.tsx`
- `optimizePackageImports` for `@phosphor-icons/react`, `@base-ui/react`, `motion`
- `transpilePackages: ["next-mdx-remote"]`
- `pageExtensions: ["mdx", "ts", "tsx"]`
- security headers, including a CSP assembled from `CSP_DIRECTIVES`
- rewrites mapping `/<category>/<slug>.mdx` (and the `/en` variants) onto the
  plain-text mirror

**React 19.2.7** — Server Components by default, `'use client'` only at the
interactivity boundary.

**Tailwind CSS v4** via `@tailwindcss/postcss`, plus `@tailwindcss/typography`
and `tw-animate-css`.

## Key Dependencies

**UI primitives:** `@base-ui/react` 1.5. radix has been fully removed — its
`Slot`/`asChild` pattern broke hydration under React 19.2 (the trigger vanished
client-side with no error). `src/components/base/Collapsible.tsx` is the
reference for wrapping a Base UI part while keeping an `asChild`-compatible API.

**i18n:** `@inlang/paraglide-js` 2.18 with `@inlang/plugin-message-format` and
`@inlang/plugin-m-function-matcher`, both resolved from `node_modules` rather than
a CDN. Compiled by `src/scripts/compile-i18n.mts` into the git-ignored
`src/paraglide/`.

**Content:** `next-mdx-remote` 6, `fumadocs-core` (table of contents), `shiki` 4
and `rehype-pretty-code` for highlighting, `gray-matter` for frontmatter,
`remark-gfm`, `rehype-slug`, `rehype-raw`, `rehype-external-links`.

**Forms and validation:** `react-hook-form` + `@hookform/resolvers` + `zod` 4.
`next-safe-action` 8 for typed server actions.

**State:** `zustand` 5 (persisted, versioned stores in `src/hooks/`), `nuqs` for
URL state, React context for narrow concerns (tag filter, navbar).

**Data access:** `octokit` 5 (GitHub GraphQL), `resend` 6 with
`@react-email/components` for CV delivery, `@cloudflare/speedtest` for the speed
test tool.

**Motion and visuals:** `motion` 12, `@tsparticles/*`, `embla-carousel-react`,
`react-fast-marquee`, `rough-notation`, `poline`, `@number-flow/react`,
`react-confetti`.

**Command palette:** `cmdk` 1.1, driven by a custom filter that extends matching
to indexed body text.

**Misc:** `dayjs`, `class-variance-authority`, `clsx` + `tailwind-merge` (`cn()`),
`sonner` (toasts), `vaul` (drawer), `next-themes`, `@bprogress/next`,
`vcard-creator`, `schema-dts`, `sharp`, `consola`/`tslog`.

**Analytics:** `@vercel/analytics`, `@vercel/speed-insights` (served from
`/_vercel/*`, same-origin, so they need no CSP exception).

## Testing & Quality

- **Vitest 4** (`vitest.config.ts`, `vitest.setup.ts`) with jsdom and Testing
  Library. 106 tests over `src/lib/*.test.ts`.
- **Playwright 1.60** (`playwright.config.ts`), 58 tests in `e2e/`. The web server
  defaults to `pnpm preview`; `PLAYWRIGHT_WEB_SERVER` and
  `PLAYWRIGHT_CHROMIUM_PATH` override the command and the browser binary.
- **oxlint 1.68 + oxfmt 0.53** through `ultracite` 7.8 (`oxlint.config.ts`,
  `oxfmt.config.ts`). Biome is gone.
- **knip** 6 for dead code and unused dependencies.
- **lefthook** 2 — pre-commit `pnpm fix`, pre-push `pnpm types`.
- **CI**: `.github/workflows/ci.yml` runs types, lint, format and unit tests in one
  job; build and e2e in another.

## Build & Dev Tools

- `tsx` for the `.mts` scripts, with a dedicated `tsconfig.scripts.json`
- `@next/bundle-analyzer` behind `ANALYZE=true`
- `shadcn` 4.10 for the distributable registry (`pnpm registry:build`)
- `puppeteer-core` + `@skyra/gifenc` + `pngjs` for the capture scripts
- `rimraf`, `strip-indent`, `unist-util-visit`, `unist-builder`, `vfile` for the
  MDX plugins and registry generation

## Configuration

| File | Purpose |
|---|---|
| `next.config.ts` | Next config, security headers, rewrites; imports `src/env.ts` |
| `src/env.ts` | `@t3-oss/env-nextjs` schema — the only place `process.env` is read |
| `tsconfig.json` | `strict`, `@/*` → `src/*` |
| `tsconfig.scripts.json` | Node-side config for the `.mts` scripts |
| `oxlint.config.ts` / `oxfmt.config.ts` | Lint and format rules |
| `postcss.config.mjs` | Tailwind v4 pipeline |
| `vitest.config.ts` / `vitest.setup.ts` | Unit test runner |
| `playwright.config.ts` | e2e runner and web server |
| `project.inlang/settings.json` | Locales, plugins (from `node_modules`) |
| `components.json` | shadcn paths for the registry |
| `knip.json` | Dead-code entry points |
| `lefthook.yml` | Git hooks |

## Platform Requirements

- Node 22+, pnpm 10+
- Dev server on port **1408** (not 3000); capture scripts use 1409
- `GITHUB_API_TOKEN` must be set for env validation to pass; every other variable
  is optional
- `pnpm-lock.yaml` is git-ignored, so installs are not reproducible across
  machines and CI resolves versions on every run
