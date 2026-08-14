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
pnpm lint                 # biome lint (config: biome.jsonc)
pnpm lint:fix             # biome check --write (lint + format + assists)
pnpm format               # biome format
pnpm format:fix           # biome format --write
pnpm check / pnpm fix     # biome check / biome check --write
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
- **Linting**: Biome (`biome.jsonc`) — lint, format and assists in one tool.
  oxlint/oxfmt/ultracite are gone. The trigger was severity ownership: an
  ultracite bump from 7.8.1 to 7.10.3 turned 276 warnings into errors across
  137 files with no commit in this repo changing. Every severity now lives in
  `biome.jsonc`, with the reason next to it — that is why the config is
  `.jsonc` and not `.json`. Rules the old `oxlint.config.ts` had switched off
  are switched off here too. `css.parser.tailwindDirectives` is REQUIRED: without
  it `globals.css` throws 26 parse errors on `@plugin`, `@theme` and `@utility`.
  Every rule is now `error` — **`pnpm check` must report zero warnings**, so a new
  warning means a decision has not been recorded yet. The 116 findings the
  migration surfaced were resolved one by one: real defects fixed, everything else
  carrying a per-site `biome-ignore` with its reason, or a directory override in
  `biome.jsonc`. Do NOT downgrade a rule to `warn` to get a build through — a
  warning nobody reads guards nothing, which is exactly the state the ultracite
  bump had produced
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
  build + e2e in another. Installs with `--frozen-lockfile` and caches the pnpm
  store: `pnpm-lock.yaml` is COMMITTED. Do not re-ignore it — when it was ignored,
  CI resolved every version fresh on each run, so an upstream release of a
  transitive dependency could break (or silently fix) the build with no commit
  changing. A dependency change must now update the lockfile in the same commit,
  or CI fails on the mismatch
- **Security headers**: CSP + HSTS built in `next.config.ts` (`CSP_DIRECTIVES`).
  `script-src` keeps `'unsafe-inline'` on purpose — the App Router streams the
  RSC payload through dozens of inline `<script>` tags that change per page and
  per build, so neither nonces (they would force a middleware and dynamic pages)
  nor hashes can lock it down. `e2e/csp.spec.ts` loads every page type in a real
  browser and fails on any `securitypolicyviolation`
- **Git hooks**: lefthook (`lefthook.yml`) — pre-commit `pnpm fix`, pre-push `pnpm types`
- **Animation**: Motion (Framer Motion v12+). `motion.create()` returns a NEW
  component type per call — always call it at MODULE scope (or memoise per tag,
  as `TextAnimate` does). Called inside a render it remounts the subtree on every
  render, so animations restart forever and `memo` becomes useless
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
│   ├── (content)/about.md/...     # /about.md, /experience.md, /projects.md,
│   │                              # /certifications.md, /uses.md, /now.md
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
  falls back to FR and the page shows a `WritingsLocaleNotice`. The `tags`
  frontmatter is IDENTICAL in both locales — it is the key behind the URL
  (see `tags.ts`); only the rendered label is translated.
- The FR pages export locale-aware views (`ArticlesIndex`, `ArticleView`,
  `ComponentsIndex`, `ComponentView`, `UtilsIndex`, `UtilView`) that the thin
  `en/` pages reuse with `locale="en"`.

### Feature Organization

- Homepage sections live in `src/app/(fr)/(content)/(root)/_components/`
  (about, articles, branding, certs, commits, cover, cv, experiences, header,
  overview, projects, repos, stack, tools). Static data co-located in `content.ts`
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

`budget.spec.ts` logs every measurement it takes (`POIDS <path> js=… fonts=…`),
so a CI run doubles as the reference measurement. Both the published numbers and
the ceilings now come from a CI trace, and that mattered: local measurement put
`/articles` at 518 KiB of JS, CI at **707** — a third more, on what turns out to
be the heaviest page of the site. Refresh both from a CI log, never from a
laptop; a ceiling derived from a number only one machine can reproduce is a
guess wearing a guard's uniform.

`src/data/weights.ts` holds the measured page weights AND the CI ceilings, and is
imported by both the `/weight` page and `e2e/budget.spec.ts` — a published number
and a ceiling defined separately would drift apart. Do NOT sum
`performance.getEntriesByType("resource")` to re-measure: a preloaded-then-executed
chunk yields two entries for one transfer, which reported 1340 KiB instead of 654.

### Global Data

`src/data/global.ts` exports `GLOBAL_DATA` — single source of truth for
personal data (name, bio, social links, work history, CV info). Never
hardcode personal data elsewhere. French display strings shown in the UI go
through Paraglide messages; `global.ts` stays the FR source for
metadata/OG/llms routes.

`src/data/uses.ts` backs `/uses` and its text mirror, under one rule: **only
what the repository proves**. Every entry lines up with `package.json`, a
workflow, or a versioned config file — the `environment` group reads
`.zed/settings.json`, `.node-version`, `.editorconfig` and
`.claude/settings.json` (all tracked, the `/.zed` ignore rule never applied to a
file already followed). Hardware stays OUT: nothing here reveals it, and a
guessed machine is exactly the kind of decorative claim this page exists to
avoid. `src/data/uses.test.ts` re-reads those files, so a bumped Node version
fails a test instead of quietly leaving the page lying.

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
  the `/search` page. Typo tolerance uses `editDistance` (optimal string
  alignment, so a TRANSPOSITION costs one edit — `tailwnid` for `tailwind` costs
  two under plain Levenshtein and would be missed); tolerance is 0 below 4 chars,
  1 up to 7, 2 beyond. An approximate hit NEVER outranks an exact one. Type-only imports on purpose: importing `content.ts` values
  would pull the whole MDX graph into the test run.
- `related.ts` - related-post scoring by shared tags
- `feed.ts` / `feed-routes.ts` - RSS 2.0 + JSON Feed 1.1 serialisation and the
  shared response helpers
- `github-stats.ts` - language aggregation across repos (forks excluded). Owns
  `DEFAULT_LANGUAGE_COLOR`, shared with `repos.ts` so the same language never
  gets two different dots
- `og.ts` - social-card identity per page type: family, palette, badge wording,
  truncation and title sizing. Badge contrast is asserted with the site's own
  `contrast.ts` — an OG image is never scanned by axe, which is precisely why the
  pairs are measured (the first ones sat at 3.95:1)
- `showcase.ts` - which projects and roles get their own page, in what order, and
  the previous/next pair. The `id` in the data IS the slug: it is identical in both
  locales, so a shared URL lands on the same item — the tag lesson applied. The
  experience projection is `toExperienceEntry` from `cv.ts`, reused rather than
  rewritten, because the CV is what goes out by email
- `repos.ts` - which public repos become homepage cards, and in what order.
  Ranking is stars, then `pushedAt`, then name: personal repos are mostly at zero
  stars, so ties are the rule and a single key would leave the order to whatever
  the API happened to return
- `rate-limit.ts` - sliding-window limiter; blocked attempts do NOT extend the
  window
- `jwt.ts`, `diff.ts`, `hash.ts` - the logic behind the `/utils` tools
- `llms.ts` - markdown rendering shared by the plain-text mirror
- `tags.ts` - tag slugs, cross-category aggregation, per-tag lookup. `slugifyTag`
  delegates to `case.ts`'s `slugify`: two transliterations would drift and the
  tag URLs would stop matching. A tag is a **KEY**, written in French because FR
  is the base locale and the key produces the slug; `tagLabel(tag, locale)`
  translates only what is displayed — same contract as `series`/`seriesName`.
  Never translate a tag in EN frontmatter: it forks the URL space (`/en/tags/colors`
  and `/en/tags/couleurs` both existed, for the same topic, in the same tree)
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

- **Formatting**: Biome, `lineWidth: 70`. Run `pnpm fix` before committing.
  That width is inherited from the old oxfmt `printWidth` and is what gives the
  repo its short lines — keeping it is what held the Biome switch to 10
  reformatted files instead of the whole tree.
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
- `repos.spec.ts` - the GitHub repo cards. Asserts the INVARIANT (exactly one of
  cards / unavailable notice, never both, never neither) rather than the cards
  themselves: CI builds with a placeholder token and never sees live repos, so a
  test demanding cards would only ever fail. Card content is tested in
  `src/lib/repos.test.ts`
- `showcase.spec.ts` - the project/role pages, `/uses`, `/now`, `/weight`, their
  sitemap entries and their text mirrors
- `widget-isolation.spec.ts` - no tool widget reaches a page that does not use one,
  with a CONTROL case (the speed-test page must contain the marker) so that removing
  the dependency cannot turn every absence assertion green for nothing
- `search-page.spec.ts` - the `/search` page and its agreement with the palette
- `playground.spec.ts` - the component playground and its generated code
- `offline.spec.ts` - the service worker, with the network genuinely cut
- `a11y.spec.ts` - axe-core over 16 page types plus the open playground. Two known
  contrast debts are listed in the file with their measurement; any new violation
  fails. Light theme only — forcing dark gives measurements axe cannot resolve
- `budget.spec.ts` - JS, font and CSS weight ceilings measured in the browser, plus
  the font-preload count

Watch out for three selector traps: Next.js always mounts an empty
`<div role="alert">` route announcer (scope to `p[role="alert"]`), an article
body brings its own `<pre>` and `<li>` elements, and a `/components/<slug>` page
carries THREE `role="tablist"` — the preview tabs plus the two npm/pnpm/yarn/bun
command blocks. A page-wide `[aria-selected='true']` therefore matches three
tabs, which looks like an a11y defect and is not; scope to one tablist. MDX
section headings used to be `#`, giving every content page several `<h1>`; they
are now `##`, so a content page has exactly ONE `<h1>` — the page title rendered
outside MDX.

`TabsAnimated` refuses to switch tabs while a transition is animating, and
`onAnimationStart` also fires for the FIRST panel's entrance — so `isAnimating`
was true from mount and every click in the first ~0.4s was dropped in silence
(measured: 0/100/250/400ms did nothing, 600ms worked). A `hasTransitioned` ref
now limits the guard to real transitions. `e2e/playground.spec.ts` clicks at
exactly those delays; do not "simplify" it into a single click after
`networkidle`, which is what hid the bug in the first place.

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
- **OG Images**: Dynamic via `GET /api/og?type=…&title=…&description=…&meta=…`,
  helpers (`openGraphImage`, `BASE_URL`) in `src/lib/metadata.ts`. Six templates,
  one per family, picked by `ogFamily()` in `src/lib/og.ts` (palettes, badges and
  thresholds live there and are unit-tested; the route only composes JSX). Satori
  constraints: flexbox only, explicit `display: flex` on every multi-child node —
  and it does NOT decode the site's `.webp`, which crashed the homepage card with
  `u2 is not iterable`, so cards use no raster image at all. A failed render falls
  back to a card that IGNORES the requested title, so a broken font silently
  serves one identical image for the whole site: `e2e/og.spec.ts` compares bytes
  across titles and types to catch exactly that
- **Sound**: `src/lib/sound-manager.ts` plays sounds on certain interactions
- **CV delivery**: PDF emailed via Resend with React Email template.
  `@react-email/components` is DEPRECATED upstream with nowhere to migrate to —
  `1.0.12` is the last published version, the individual packages
  (`@react-email/html`, `/body`, `/container`…) are deprecated too, and
  `react-email@6` is the dev tool, not the component library. Only
  `@react-email/render` is still maintained. It is kept deliberately: those ten
  components carry email-client compatibility (`Html` sets the language, `Preview`
  the hidden preheader, `Img` the attributes Outlook needs) that this repo cannot
  test — there is no Resend key in CI. Do not hand-roll them to silence a
  deprecation notice
- **Capture scripts**: `pnpm capture:*` drive Puppeteer against `/og` and
  `/components/<slug>` to refresh images in `public/images/`
- **Fonts**: declare every pixel font locally in `src/fonts/pixel.ts`. Importing
  `geist/font/pixel` evaluates all five `localFont()` calls, so `preload: false`
  on the unused ones has no effect through that entry point — declaring them
  locally is what takes the preload count from 7 down to 3
- **Print**: the `@media print` block in `globals.css` covers `/cv` AND content
  pages. Anything tagged `data-print="hide"` is dropped (ToC, pagination, share
  actions, tags, series, related). `pre` switches to `pre-wrap`: on paper there is
  no horizontal scrolling, so an overflowing code block is silently CUT. The page
  URL is rendered by `WritingsByline` because CSS cannot read `location`
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
