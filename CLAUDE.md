# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Dev server on http://localhost:1408 (compiles i18n first)
pnpm build                # Production build (compiles i18n first)
pnpm preview              # Build + serve on port 1408
pnpm types                # Type checking (tsc --noEmit) — needs `pnpm i18n:compile` first
                          # on a fresh clone: src/paraglide/ is generated
pnpm lint                 # oxlint (config: oxlint.config.ts)
pnpm lint:fix             # oxlint --fix + oxfmt --write
pnpm format               # oxfmt --check
pnpm format:fix           # oxfmt --write
pnpm check / pnpm fix     # Aliases of lint / lint:fix
pnpm test                 # Vitest unit tests (src/**/*.test.ts)
pnpm test:e2e             # Playwright e2e (e2e/, needs `playwright install chromium`)
                          # webServer runs `pnpm preview`; override with
                          # PLAYWRIGHT_WEB_SERVER when a build already exists,
                          # PLAYWRIGHT_CHROMIUM_PATH to point at another Chromium
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
- **Tests**: Vitest (+ Testing Library, jsdom) for unit (`src/lib/*.test.ts`),
  Playwright for e2e (`e2e/*.spec.ts`)
- **CI**: `.github/workflows/ci.yml` — types, lint, format, unit tests in one job,
  build + e2e in another. Installs with `--no-frozen-lockfile` because
  `pnpm-lock.yaml` is git-ignored in this repo (so CI resolves versions fresh)
- **Security headers**: CSP + HSTS built in `next.config.ts` (`CSP_DIRECTIVES`).
  `script-src` keeps `'unsafe-inline'` on purpose — the App Router streams the
  RSC payload through dozens of inline `<script>` tags that change per page and
  per build, so neither nonces (they would force a middleware and dynamic pages)
  nor hashes can lock it down. `e2e/csp.spec.ts` loads every page type in a real
  browser and fails on any `securitypolicyviolation`
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
├── en/                            # ENGLISH tree — thin wrappers re-exporting the FR pages
│   ├── layout.tsx                 # Root layout EN (html lang="en")
│   └── (content)/...              # Same shape; pages define EN metadata + reuse FR defaults
│       └── (writings)/            # /articles, /components, /utils, /tags, /series, /search (+ [slug])
├── (llms)/                        # Plain-text mirror for AI ingestion
│   ├── llms.txt/route.ts          # /llms.txt - markdown index
│   ├── (content)/about.md/...     # /about.md, /experience.md, /projects.md, /certifications.md
│   ├── (content)/blog.mdx/[slug]/ # Served at /<category>/<slug>.mdx via rewrites (FR)
│   └── (content)/blog.en.mdx/…    # Served at /en/<category>/<slug>.mdx (EN)
├── api/                           # og (ImageResponse), rss, rss/[category],
│                                  # rss/tag/[tag], feed.json (JSON Feed 1.1),
│                                  # vcard, health
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
  The script fails fast: it compares the number of compiled messages with the keys
  in `messages/fr.json` and exits 1 on a mismatch. Without that guard a plugin
  that failed to load produced an EMPTY message bundle and the site built green
  with every label missing.
- Plugins are resolved from `./node_modules/@inlang/...` in
  `project.inlang/settings.json`, not from jsdelivr: a network fetch at build time
  is a single point of failure (a 403 there is what silently emptied the bundle).
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
  ToC, Tags, TagFilter, Breadcrumb, Pagination, Actions, Shortcuts, Related,
  ReadingAids = Progress + BackToTop…) and `src/components/features/utils/` for
  the tools page widgets. The `/utils` tool implementations themselves are in
  `src/components/utils/`.
- `src/components/layout/SectionBoundary.tsx` wraps homepage sections: `<Suspense>`
  covers waiting, not failure, so a section that throws needs a real error
  boundary or it takes the whole page down.
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
`locale`). Use `toContentLocale(locale)` to narrow a Paraglide locale string to
`"fr" | "en"` rather than casting. Frontmatter dates go through
`assertValidDates`, which rejects anything that is not a real `YYYY-MM-DD` day —
Zod's coercion silently turned `2026-02-30` into March 2nd and shuffled the sort
order. MDX processing uses custom plugins in `src/lib/`:
`rehype-component.ts` / `remark-component.ts` (component injection — these
read component sources dynamically, which makes Turbopack emit a benign
"unexpected file in NFT list" warning at build; known and accepted),
`rehype-npm-command.ts`, `remark-code-import.ts`.
Syntax highlighting via `shiki`.

Tag filtering on list pages is client-side (`WritingsTagFilter` context +
`history.replaceState`) so `/articles`, `/components`, `/utils` stay fully
static. Do NOT reintroduce `searchParams` in these pages. `/search` follows the
same rule with the URL **fragment**: a query parameter would make the page
dynamic, a fragment never reaches the server.

Content can also declare a **series** (`series` key + `seriesName` label +
`seriesOrder`). `series` must be identical across locales — it is the identifier
behind the URL — while `seriesName` is translated. Reading order is `seriesOrder`,
then `createdAt`, then slug, so a duplicated order still renders deterministically.

### Global Data

`src/data/global.ts` exports `GLOBAL_DATA` — single source of truth for
personal data (name, bio, social links, work history, CV info). Never
hardcode personal data elsewhere. French display strings shown in the UI go
through Paraglide messages; `global.ts` stays the FR source for
metadata/OG/llms routes.

### Server Actions

Actions live flat in `src/actions/`:

- `data.action.ts` - Contributions, stars, followers, per-repo languages
  (GitHub GraphQL via octokit)
- `commit.action.ts` - Latest commit data
- `send-cv.action.ts` - CV delivery (next-safe-action + Resend), rate limited
- `safe-action.ts` - the next-safe-action client

`data.action.ts` and `commit.action.ts` use `unstable_cache` with 1-hour
revalidation. IMPORTANT: the cache wraps ONLY the fetch, and the `catch` sits
OUTSIDE it — caching a failure would pin a zeroed page for a whole hour, and an
uncaught GitHub 401 fails the whole build. Keep that shape.

`send-cv.action.ts` builds its Resend client lazily (`getResend()`):
`RESEND_API_KEY` is optional, and `new Resend(undefined)` throws at module
scope, which would fire before any in-action guard could run.

### Pure Logic Libraries

Anything with real logic lives in `src/lib/` as a dependency-free module with a
sibling `*.test.ts`, so it can be tested without dragging in the MDX pipeline or
the component registry:

- `search.ts` - `SearchDoc` index (title, description, tags, headings, 400-char
  excerpt), `toPlainText`, `normalize` (diacritic-insensitive), `searchableText`,
  plus `scoreText` / `searchDocs`, the single ranking shared by the ⌘K palette and
  the `/search` page. Type-only imports on purpose: importing `content.ts` values
  would pull the whole MDX graph into the test run.
- `related.ts` - related-post scoring by shared tags
- `feed.ts` / `feed-routes.ts` - RSS 2.0 + JSON Feed 1.1 serialisation and the
  shared response helpers
- `github-stats.ts` - language aggregation across repos (forks excluded)
- `rate-limit.ts` - sliding-window limiter; blocked attempts do NOT extend the
  window
- `jwt.ts`, `diff.ts`, `hash.ts` - the logic behind the `/utils` tools
- `llms.ts` - markdown rendering shared by the plain-text mirror
- `tags.ts` - tag slugs, cross-category aggregation, per-tag lookup. `slugifyTag`
  delegates to `case.ts`'s `slugify`: two transliterations would drift and the
  tag URLs would stop matching
- `series.ts` - reading order of a series. `series` frontmatter is a KEY shared by
  every locale (it drives the slug); `seriesName` is the translatable label
- `case.ts` - word splitting and the ten case conversions, plus `slugify`
- `contrast.ts` - WCAG relative luminance and contrast ratio
- `cron.ts` - five-field cron parsing and next runs, in UTC, including Vixie
  cron's OR rule between day-of-month and day-of-week
- `datetime.ts` - Unix/ISO detection and time-zone formatting. Every function takes
  its reference instant as a parameter, so nothing reads the clock while rendering
- `regex-tester.ts` - regex execution returning segments rather than HTML
- `playground.ts` - JSX code generation for the component playground
- `zod-config.ts` - re-exports `z` with `jitless: true`. Client-side schemas MUST
  import `z` from here: Zod 4 compiles object validators with `new Function` and
  probes for it in a try/catch, which a strict `script-src` reports as a
  violation even though the throw is caught.

### LLM Content Mirror

The `(llms)/` route group serves every piece of content as raw text:
`/about.md`, `/experience.md`, `/projects.md`, `/certifications.md`, `/llms.txt`,
and `/<category>/<slug>.mdx` (rewrites in next.config.ts map these to
`blog.mdx/[slug]`, and `/en/<category>/<slug>.mdx` to `blog.en.mdx/[slug]`). The
"Copy Markdown" button on articles fetches from this mirror — on `/en` it needs
the English route, otherwise it hands back the French source.

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

## Testing

Unit tests (Vitest) cover `src/lib/` — the pure modules listed above. Reference
values come from outside the code under test (Node's `crypto`, Python) so a test
never re-implements the function it checks.

End-to-end tests (Playwright, `e2e/`):

- `i18n.spec.ts` - both trees render in the right language, no hydration errors
- `csp.spec.ts` - headers, plus every page type loaded in a real browser with a
  `securitypolicyviolation` listener. It also asserts no `.js` request failed —
  a page whose scripts never load reports no violations and would otherwise pass
- `search.spec.ts` - ⌘K palette: shortcuts, full-text match on body-only words,
  diacritic-insensitivity, navigation, EN index
- `feeds.spec.ts` - RSS/JSON Feed shape, per-category filtering, escaping, and the
  plain-text mirror in both languages
- `reading.spec.ts` - related posts, ToC, ←/→ navigation, progress bar, back to
  top, tablist keyboard contract
- `utils-tools.spec.ts` / `utils-tools-2.spec.ts` - the eight `/utils` tools
- `tags.spec.ts` / `series.spec.ts` - tag and series pages, both language trees
- `search-page.spec.ts` - the `/search` page and its agreement with the palette
- `playground.spec.ts` - the component playground and its generated code
- `offline.spec.ts` - the service worker, with the network genuinely cut
- `a11y.spec.ts` - axe-core over 16 page types plus the open playground. Two known
  contrast debts are listed in the file with their measurement; any new violation
  fails. Light theme only — forcing dark gives measurements axe cannot resolve
- `budget.spec.ts` - JS, font and CSS weight ceilings measured in the browser, plus
  the font-preload count

Watch out for two selector traps: Next.js always mounts an empty
`<div role="alert">` route announcer (scope to `p[role="alert"]`), and MDX bodies
use `#` for sections, so a content page has several `<h1>` and its own `<pre>`
and `<li>` elements.

## Environment Variables

Required in `.env.local` (no `.env.example` exists):

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_API_TOKEN` | Yes | GitHub PAT for Octokit GraphQL |
| `GITHUB_USERNAME` | No | GitHub username |
| `GITHUB_REPO_NAME` | No | Repo for commit widget |
| `BLOB_READ_WRITE_TOKEN` | No | Declared in `src/env.ts`, currently unused by app code |
| `RESEND_API_KEY` | No | Email delivery for CV |
| `API_TOKEN` | No | Internal API auth |
| `NEXT_PUBLIC_APP_URL` | No | Absolute URL base (falls back to VERCEL_URL, then prod domain) |

Env validation runs at startup via the Zod schema in `src/env.ts`, which
`next.config.ts` imports. Only `GITHUB_API_TOKEN` is strictly required, and only
for its presence: the build tolerates an invalid token (CI passes a placeholder),
falling back to zeroed GitHub widgets rather than failing.

## Important Notes

- **Port**: Dev server on 1408 (not 3000)
- **OG Images**: Dynamic via `GET /api/og?type=blog&title=...`, helpers
  (`openGraphImage`, `BASE_URL`) in `src/lib/metadata.ts`
- **Sound**: `src/lib/sound-manager.ts` plays sounds on certain interactions
- **CV delivery**: PDF emailed via Resend with React Email template
- **Capture scripts**: `pnpm capture:*` drive Puppeteer against `/og` and
  `/components/<slug>` to refresh images in `public/images/`
- **Fonts**: declare every pixel font locally in `src/fonts/pixel.ts`. Importing
  `geist/font/pixel` evaluates all five `localFont()` calls, so `preload: false`
  on the unused ones has no effect through that entry point — declaring them
  locally is what takes the preload count from 7 down to 3
- **Persisted stores**: Zustand stores in `src/hooks/` carry a `version` and a
  `migrate` (see `useConfig.ts`). A stored shape that no longer matches the code
  must be migrated, not trusted
- **Arrow-key shortcuts**: `WritingsShortcuts` moves between posts with ←/→ and
  bails on `event.defaultPrevented`, so widgets with their own arrow semantics
  (a `role="tablist"`, a combobox) don't also change the page. They follow
  chronological order, NOT the series order — the series has its own explicit
  previous/next links
- **Offline**: `public/sw.js` caches `/_next/static/**`, fonts and images
  cache-first (their URLs are content-hashed), and HTML **network-first**. Never
  serve HTML from cache while the network answers: a stale document references
  chunks that no longer exist and loads without any JavaScript, silently.
  `public/offline.html` is the fallback and carries no script and no external
  stylesheet on purpose — it can sit in a cache for months
- **Playground**: props declared in `src/registry/playgrounds.ts`, which also holds
  the component reference. Do NOT read it from `Index`: `registry:component`
  entries have no `component` field, only `registry:example` ones do
