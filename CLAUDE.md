# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Dev server on http://localhost:1408 (compiles i18n first)
pnpm build                # Production build (compiles i18n first)
pnpm preview              # Build + serve on port 1408
pnpm types                # Type checking (tsc --noEmit)
pnpm lint                 # oxlint (config: oxlint.config.ts)
pnpm lint:fix             # oxlint --fix + oxfmt --write
pnpm format               # oxfmt --check
pnpm format:fix           # oxfmt --write
pnpm check / pnpm fix     # Aliases of lint / lint:fix
pnpm test                 # Vitest unit tests (src/**/*.test.ts)
pnpm test:e2e             # Playwright e2e (e2e/, needs `playwright install chromium`)
pnpm analyze              # Build with @next/bundle-analyzer
pnpm knip                 # Dead code/dependency detection
pnpm i18n:compile         # Compile Paraglide messages to src/paraglide/
pnpm registry:build       # Build component registry for distribution
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, Turbopack and React Compiler (`reactCompiler: true`)
- **Styling**: Tailwind CSS v4
- **UI Components**: Base UI (`@base-ui/react`). The radix `Slot`/`asChild`
  pattern BREAKS hydration with React 19.2 in dev (trigger silently vanishes
  client-side) — never reintroduce radix primitives; `src/components/base/Collapsible.tsx`
  is the reference for wrapping Base UI while keeping an `asChild`-compatible API.
- **i18n**: Paraglide JS (inlang) — FR (default, root URLs) + EN (under `/en`)
- **Linting**: Ultracite (oxlint + oxfmt). Biome is gone.
- **Content**: MDX via `next-mdx-remote` + `fumadocs-core` for TOC, FR + EN
- **State**: Zustand (persisted stores in `src/hooks/`), nuqs for URL state,
  React Hook Form + Zod for forms
- **Server actions**: next-safe-action (`src/actions/safe-action.ts` client,
  e.g. `send-cv.action.ts` replaces the old `/api/send` route)
- **Env**: @t3-oss/env-nextjs in `src/env.ts` (imported by next.config.ts) —
  add new variables there, never read `process.env` directly in app code
- **Tests**: Vitest (+ Testing Library, jsdom) for unit, Playwright for e2e
- **Git hooks**: lefthook (`lefthook.yml`) — pre-commit `pnpm fix`, pre-push `pnpm types`
- **Animation**: Motion (Framer Motion v12+)
- **Package Manager**: pnpm (v10+)
- **React**: 19

## Project Architecture

### Route Structure

Two root layouts (multiple root layouts pattern): `(fr)/` serves French at the
root URLs, `en/` serves English under `/en`. `app/global-not-found.tsx` handles
unmatched URLs (requires `experimental.globalNotFound` in next.config.ts).

```
src/app/
├── (fr)/                          # FRENCH tree (root URLs) — canonical implementation
│   ├── layout.tsx                 # Root layout FR (html lang="fr" via RootDocument)
│   ├── not-found.tsx
│   ├── og/page.tsx                # Capture page for OG images (noindex, used by capture scripts)
│   └── (content)/
│       ├── layout.tsx             # Site chrome: NavBar, Footer, Particles
│       ├── (root)/page.tsx        # Homepage (/) + _components/ sections
│       └── (writings)/            # /articles, /components, /utils (+ [slug])
├── en/                            # ENGLISH tree — thin wrappers re-exporting the FR pages
│   ├── layout.tsx                 # Root layout EN (html lang="en")
│   └── (content)/...              # Same shape; pages define EN metadata + reuse FR defaults
├── (llms)/                        # Plain-text mirror for AI ingestion (FR only)
│   ├── llms.txt/route.ts          # /llms.txt - markdown index
│   ├── (content)/about.md/...     # /about.md, /experience.md, etc.
│   └── (content)/blog.mdx/[slug]/ # Served at /<category>/<slug>.mdx via rewrites
├── api/                           # og (ImageResponse), send (Resend), rss, vcard, health
├── global-not-found.tsx           # 404 for unmatched URLs (own <html>)
├── sitemap.ts                     # FR + EN URLs with hreflang alternates
├── manifest.ts / robots.ts
```

### i18n (Paraglide)

- Config: `project.inlang/settings.json` (baseLocale `fr`, locales `fr`/`en`),
  messages in `messages/{fr,en}.json`.
- Compilation: `src/scripts/compile-i18n.mts` (programmatic API — needed for
  `urlPatterns`: fr at root, `/en` prefix). Runs via `predev`/`prebuild`.
  Output `src/paraglide/` is generated and git-ignored — never edit it.
- Usage: `import { m } from "@/paraglide/messages"` everywhere;
  `localizeHref()` for internal links; `getLocale()` for the current locale.
- Server locale: `src/lib/i18n.ts` (`setServerLocale` + `overwriteGetLocale`
  with React `cache()`), set by `RootDocument` in each root layout. Official
  workaround — Next.js RSC has no AsyncLocalStorage for Paraglide.
- Metadata: `createMetadata({ locale, path, ... })` in `src/lib/metadata.ts`
  builds canonical + hreflang alternates. `path` is ALWAYS the unprefixed
  route (e.g. `/articles`); locale handles the `/en` prefix.
- MDX content is bilingual: FR files in `src/content/<category>/`, EN
  translations in `src/content/<category>/en/<slug>.mdx`. A missing EN file
  falls back to FR and the page shows a `WritingsLocaleNotice`.
- The FR pages export locale-aware views (`ArticlesIndex`, `ArticleView`,
  `ComponentsIndex`, `ComponentView`, `UtilsIndex`, `UtilView`) that the thin
  `en/` pages reuse with `locale="en"`.

### Feature Organization

- Homepage sections live in `src/app/(fr)/(content)/(root)/_components/`
  (about, articles, branding, certs, commits, cover, cv, experiences, header,
  overview, projects, stack, tools). Static data co-located in `content.ts`
  files next to their section.
- Site chrome in `src/components/layout/` (navbar/, footer/, RootDocument,
  NotFoundContent).
- Writings UI in `src/components/features/` (`Writings*` components: TopBar,
  ToC, Tags, TagFilter, Breadcrumb, Pagination, Actions, Shortcuts…) and
  `src/components/features/utils/` for the tools page widgets.
- UI primitives: `src/components/base/` and `src/components/primitives/` —
  ALL built on Base UI (radix has been fully migrated out; see Tech Stack).
  `src/components/blocks/` (visual blocks), `src/components/motion/`
  (animated icons).

**RSC boundary pattern**: `Feature.tsx` (async RSC shell fetching data) +
`FeatureContent.tsx` (`'use client'` receiving data as props).

### Content System

Posts are MDX files in `src/content/{articles,components,utils}/`. The
`category` frontmatter matches the folder and the route (all plural):

- `articles` → `/articles/[slug]`
- `components` → `/components/[slug]`
- `utils` → `/utils/[slug]`

`src/lib/content.ts` reads the filesystem, validates frontmatter with Zod and
sorts by `createdAt` desc. All getters take an optional locale:
`getContentBySlug(slug, category, locale)` / `getContentByCategory(category,
locale)` / `getAllContent(locale)` (default `"fr"`; `"en"` merges
`<category>/en/` files with FR fallback, each `Content` carries its real
`locale`). MDX processing uses custom plugins in `src/lib/`:
`rehype-component.ts` / `remark-component.ts` (component injection — these
read component sources dynamically, which makes Turbopack emit a benign
"unexpected file in NFT list" warning at build; known and accepted),
`rehype-npm-command.ts`, `remark-code-import.ts`.
Syntax highlighting via `shiki`.

Tag filtering on list pages is client-side (`WritingsTagFilter` context +
`history.replaceState`) so `/articles`, `/components`, `/utils` stay fully
static. Do NOT reintroduce `searchParams` in these pages.

### Global Data

`src/data/global.ts` exports `GLOBAL_DATA` — single source of truth for
personal data (name, bio, social links, work history, CV info). Never
hardcode personal data elsewhere. French display strings shown in the UI go
through Paraglide messages; `global.ts` stays the FR source for
metadata/OG/llms routes.

### Server Actions

Actions live flat in `src/actions/`:

- `data.action.ts` - Contributions, stars, followers (GitHub GraphQL via octokit)
- `commit.action.ts` - Latest commit data
- `followers.action.ts` - LinkedIn follower count from Vercel Blob

All use `unstable_cache` with 1-hour revalidation.

### LLM Content Mirror

The `(llms)/` route group serves every piece of content as raw text:
`/about.md`, `/experience.md`, `/llms.txt`, and `/<category>/<slug>.mdx`
(rewrites in next.config.ts map these to `blog.mdx/[slug]`). The "Copy
Markdown" button on articles fetches from this mirror.

### Custom Registry

Distributable components at `src/registry/` (theme-switcher,
apple-hello-effect, flip-sentences). After modifying, run
`pnpm registry:build` (internally `registry:internal` + `shadcn build`),
which generates `src/__registry__/` and `public/r/registry.json`.

## Code Style

- **Formatting**: oxfmt (via Ultracite). Run `pnpm fix` before committing.
- **Imports**: Use `@/*` alias for `src/`
- **Class Names**: Use `cn()` from `@/lib/utils` for merging Tailwind classes
- **Components**: PascalCase, named exports
- **Types**: Global ambient types live in `src/types/*.d.ts` as top-level
  declarations (no `declare global` wrapper — those files are scripts, not
  modules; adding an `export {}` gets auto-removed by the formatter and
  silently disables the globals).

## Environment Variables

Required in `.env.local` (no `.env.example` exists):

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_API_TOKEN` | Yes | GitHub PAT for Octokit GraphQL |
| `GITHUB_USERNAME` | No | GitHub username |
| `GITHUB_REPO_NAME` | No | Repo for commit widget |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob (LinkedIn followers) |
| `RESEND_API_KEY` | No | Email delivery for CV |
| `API_TOKEN` | No | Internal API auth |
| `NEXT_PUBLIC_APP_URL` | No | Absolute URL base (falls back to VERCEL_URL, then prod domain) |

Env validation runs at startup via Zod schema in `next.config.ts`. Only
`GITHUB_API_TOKEN` is strictly required.

## Important Notes

- **Port**: Dev server on 1408 (not 3000)
- **OG Images**: Dynamic via `GET /api/og?type=blog&title=...`, helpers
  (`openGraphImage`, `BASE_URL`) in `src/lib/metadata.ts`
- **Sound**: `src/lib/sound-manager.ts` plays sounds on certain interactions
- **CV delivery**: PDF emailed via Resend with React Email template
- **Capture scripts**: `pnpm capture:*` drive Puppeteer against `/og` and
  `/components/<slug>` to refresh images in `public/images/`
