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
- **Styling**: Tailwind CSS v4. `@custom-variant dark` in `globals.css` binds
  `dark:` to the `.dark` class set by next-themes. Do not remove it: Tailwind 4
  compiles `dark:` to `prefers-color-scheme` by default, so every `dark:` utility
  followed the OS instead of the theme toggle (Shiki tokens at 1.28:1 when the
  two differ — `e2e/csp.spec.ts` loads both mismatches)
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
  React Hook Form + Zod for forms. `NuqsAdapter` wraps ONLY the Lorem Ipsum
  generator (`LoremIpsumGenerator.tsx`), the one component that calls
  `useQueryState` — around the root layout it put nuqs in the JavaScript of
  every page. A second nuqs consumer brings its own adapter the same way
- **Server actions**: next-safe-action (`src/actions/safe-action.ts` client,
  e.g. `send-cv.action.ts` replaces the old `/api/send` route)
- **Env**: @t3-oss/env-nextjs in `src/env.ts` (imported by next.config.ts) —
  add new variables there, never read `process.env` directly in app code
- **Tests**: Vitest (`vitest.config.mts`) for unit tests, Playwright for e2e
  (`e2e/*.spec.ts`). The unit environment is `node` by default — no test touches
  the DOM, and creating a jsdom per file was 51 % of the suite's time. A
  component test asks for the DOM itself, at the top of its file:
  `// @vitest-environment jsdom` (Testing Library and jsdom stay installed for
  that)
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
│       ├── layout.tsx             # Site chrome: NavBar, Footer, Particles (from 768px)
│       ├── (root)/page.tsx        # Homepage (/) + _components/ sections
├── en/                            # ENGLISH tree — thin wrappers re-exporting the FR pages
│   ├── layout.tsx                 # Root layout EN (html lang="en")
│   ├── (content)/...              # Same shape; pages define EN metadata + reuse FR defaults
│   │   └── (writings)/            # /articles, /components, /utils, /tags, /series, /search (+ [slug])
│   └── [...rest]/page.tsx         # Catch-all that only calls notFound(): an unknown /en URL
│                                  # otherwise falls to global-not-found.tsx, which is French.
│                                  # No generateStaticParams on purpose (unbounded cache)
├── (llms)/                        # Plain-text mirror for AI ingestion
│   ├── llms.txt/route.ts          # /llms.txt - markdown index
│   ├── (content)/about.md/...     # /about.md, /experience.md, /projects.md,
│   │                              # /certifications.md, /uses.md, /now.md
│   ├── (content)/blog.mdx/[slug]/ # Served at /<category>/<slug>.mdx via rewrites (FR)
│   └── (content)/blog.en.mdx/…    # Served at /en/<category>/<slug>.mdx (EN)
├── api/                           # og (ImageResponse), rss, rss/en, rss/[category],
│                                  # rss/tag/[tag], feed.json + feed.en.json
│                                  # (JSON Feed 1.1), vcard, health
├── global-not-found.tsx           # 404 for unmatched URLs (own <html>)
├── sitemap.ts                     # FR + EN URLs with hreflang alternates
├── manifest.ts / robots.ts
```

### i18n (Paraglide)

- Config: `project.inlang/settings.json` (baseLocale `fr`, locales `fr`/`en`),
  messages in `messages/{fr,en}.json`.
- Compilation: `src/scripts/compile-i18n.mts` (programmatic API — kept for the
  message-count guard below). It passes NO `urlPatterns`: Paraglide's default
  routing already is "base locale at the root, `/en` prefix", and custom
  patterns shipped a URLPattern polyfill on every page. `src/lib/i18n-routing.test.ts`
  pins that routing. Runs via `predev`/`prebuild`.
  Output `src/paraglide/` is generated and git-ignored — never edit it.
  The script fails fast: it compares the number of compiled messages with the keys
  in `messages/fr.json` and exits 1 on a mismatch. Without that guard a plugin
  that failed to load produced an EMPTY message bundle and the site built green
  with every label missing.
- Plugins are resolved from `./node_modules/@inlang/...` in
  `project.inlang/settings.json`, not from jsdelivr: a network fetch at build time
  is a single point of failure (a 403 there is what silently emptied the bundle).
- Usage: `import * as m from "@/paraglide/messages"` everywhere — NEVER
  `import { m }`: that `m` is a namespace object travelling as a value, which
  the bundler cannot prune, so all 619 messages in both languages shipped on
  every page (16 to 20 KiB of JS per page; the `zod-config.ts` lesson again).
  Call sites stay `m.key()`; never pass `m` around or index it (`m[key]`), which
  defeats the pruning for the whole chunk.
  `localizeHref()` for internal links; `getLocale()` for the current locale.
- Counts agree: messages take a `{plural}` suffix (`"{count} sujet{plural}"`)
  rather than printing `sujet(s)`. A word that is invariable in one locale gets
  two messages instead (`writings_series_index_count_singular` / `_plural` —
  "series" would become "seriess"), and so does a plural that is not a suffix
  (`utils_regex_match_count_singular` / `_plural` — "match", "matches"). Where a
  count can be ZERO, decide with `isPlural(count, locale)`
  (`src/components/utils/plural.ts`, built on `Intl.PluralRules`) rather than
  `count > 1`: French keeps zero singular ("0 ligne ajoutée"), English does not
  ("0 lines added").
- A key no code reads any more is removed from BOTH files in the same commit.
- Server locale: `src/lib/i18n-server.ts` (`setServerLocale` +
  `overwriteGetLocale` with React `cache()`), set by `RootDocument` in each root
  layout. Official workaround — Next.js RSC has no AsyncLocalStorage for
  Paraglide. Its first statement is `import "server-only"`: Next's compiler
  resolves it, the package is NOT installed on purpose, hence its entry in
  `ignoreDependencies` of `knip.json`.
- `src/lib/i18n.ts` (`AppLocale`, `Message`, `getIntlLocale`) is imported by
  client components and must stay free of side effects. Next compiles a SECOND
  copy of such a module, with its own Paraglide runtime, for the server render of
  client components, and evaluates it mid-render: the `overwriteGetLocale` that
  used to sit there at module scope reset the locale to French, so `/en` was
  prerendered with French text in its client components and threw React #418 on
  every load. One `overwriteGetLocale` owner per runtime copy —
  `i18n-server.ts` for Server Components, `LocaleProvider` for the client graph.
  `src/lib/i18n-server.test.ts` counts the callers, reading the modules as TEXT
  (Vitest cannot resolve `server-only`).
- Metadata: `createMetadata({ locale, path, ... })` in `src/lib/metadata.ts`
  builds canonical + hreflang alternates. `path` is ALWAYS the unprefixed
  route (e.g. `/articles`); locale handles the `/en` prefix.
- Titles go through ONE template, `TITLE_TEMPLATE` in `metadata.ts`
  (`%s — <full name>`), set by `createRootMetadata` for both trees — the name is
  not translated. NO nested layout may declare its own `title`: a layout-level
  template REPLACES the root one. The two writings layouts did, and 134 of the
  136 sitemap titles ended with a generic suffix instead of the name. A page
  passes its bare title; only the homepage leaves the template, through
  `absoluteTitle` (it would read "florin cuzeac — florin cuzeac"), while
  `og:title` and `twitter:title` keep `title`. `homeIdentity(jobTitle, bio)`
  composes the homepage title and description from strings the page already
  shows. The EN homepage reads its messages with an explicit `{ locale: "en" }`:
  `metadata` is evaluated at module load, before the layout has set the locale
  of the request. `authors` and `creator` are the full name, not the GitHub
  username.
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
  NotFoundContent, PageColumn).
- `PageColumn` is THE 768px column of the site (`md:max-w-3xl` between the two
  vertical rules — the width of the navbar and the footer). The writings layout
  and every secondary page render inside it: `/projects`, `/experience` and their
  detail pages (through `ShowcaseDetail`), `/uses`, `/now`, `/weight`, `/cv`.
  Those pages live OUTSIDE the `(writings)` route group, so a new one must wrap
  itself — without it the page spreads over the whole window, with no vertical
  rules. `e2e/showcase.spec.ts` compares each of them to the column of
  `/articles` rather than to a number. The column dissolves in print.
- Secondary pages build their sections with `ShowcaseSection` (the 18px Geist
  Pixel heading) and their `--` lists with `ShowcaseDashList` /
  `ShowcaseDashItem`, both in `src/components/features/`. The bullet is
  `shrink-0` (as a plain flex child it broke between its two dashes at 390px)
  and the list stays a block, so a caller can set it in `columns-2`.
- Writings UI in `src/components/features/` (`Writings*` components: TopBar,
  ToC, Tags, TagFilter, Breadcrumb, Pagination, Actions, Shortcuts, Related,
  ReadingAids = Progress + BackToTop…) and `src/components/features/utils/` for
  the tools page widgets. The `/utils` tool implementations themselves are in
  `src/components/utils/`.
- `src/components/layout/SectionBoundary.tsx` wraps homepage sections: `<Suspense>`
  covers waiting, not failure, so a section that throws needs a real error
  boundary or it takes the whole page down. `Commits` and `Repos` sit in NO
  `<Suspense>`, on purpose. On a static page React moves any boundary over 500
  bytes out of the flow once the document passes 12.8 KB, then reveals it by
  script at least 300 ms after the first frame: on a deep link to
  `/#my-experiences` everything below jumped (CLS 0.25 to 0.78 on 1 to 5 loads
  in 10, depending on machine load and network). The boundary protected nothing
  either — a section that throws during prerender fails the build with or
  without it. Do not wrap a large in-flow section of a static page in
  `<Suspense>`; `e2e/load-stability.spec.ts` reads the served HTML of `/` and
  `/en` for a deferred boundary.
- UI primitives: `src/components/base/` and `src/components/primitives/` —
  ALL built on Base UI (radix has been fully migrated out; see Tech Stack).
  `src/components/blocks/` (visual blocks), `src/components/motion/`
  (animated icons).
- A `Button` is a piece of the blueprint: square corners, a DASHED rule, four
  corner brackets and a slanted shine that crosses it once on hover. The
  brackets are the `corner-brackets` utility of `globals.css` — eight flat
  gradients on the border box, no extra node, no pseudo-element; `--bracket`
  sets their length and `--bracket-color` their colour (the text colour by
  default, the theme colour on a hovered outline button, transparent on a
  ghost button until hovered). A `bg-linear-*` or `bg-none` on the same box
  REPLACES them, which is how the `link` variant drops them. The shine is the
  button's `::after` (only `translate` animates, under `motion-safe`), so a
  caller must not put its own `after:` on a `Button`. The outline border keeps
  its two strengths (30 % then 60 %): it still carries the hover. The dialog
  and popover panels carry the same brackets, with
  `[--bracket-origin:padding-box]`: a background is painted UNDER the border,
  so on a box whose border is opaque the brackets were invisible (dark theme);
  inside the padding box they always show. The navbar's icon buttons are
  `ghost` — six bracketed squares in a row out-shouted the menu next to them.
- Corners are square site-wide, and at the source: the radius scale
  (`--radius-xs` to `--radius-3xl`) is zeroed in the `@theme` block of
  `globals.css`, so `rounded-md` and friends draw square without touching a
  component. Only `rounded-full` stays round — tags, the portrait, dots,
  sliders. Reach for `rounded-full` when something must be round; a
  `rounded-lg` no longer rounds anything.
- Cards use the stretched link of `src/components/base/CardLink.tsx`: the anchor
  wraps ONLY the title — its accessible name IS its text — and a pseudo-element
  extends the click to the whole card. Never wrap a card in an anchor carrying an
  `aria-label`: axe 4.14 runs `label-content-name-mismatch` (WCAG 2.5.3) in
  `a11y.spec.ts`. When a label must say more than the visible words, build it
  with `accessibleName()` (`src/lib/accessible-name.ts`).
- `src/components/base/LinkGrid.tsx` is the blueprint link grid of the footer and
  the 404 (four cells per row, two on phones). The footer is the ONLY inbound
  link to `/cv`, `/now`, `/uses` and `/weight` — `e2e/routes.spec.ts` fails if it
  goes. The caller passes final hrefs (already through `localizeHref`) and an
  `aria-label`: two unnamed `<nav>` are indistinguishable to a screen reader.
- Homepage rows share `_components/shared/row.ts` (the 12px gutter of `Panel`,
  the hover underline, the chevron nudge) and `shared/DescriptionCards.tsx`; the
  rows of `/projects` and `/experience` reuse its `ROW_TITLE_HOVER`.
  Hover is NOT carried by the background: `bg-accent2` alone measured 1.035:1,
  and in light theme `--accent2` cannot darken — the brand blue sits at 4.51:1 on
  it. Use the underline / border, never `hover:text-theme` on a hovered row.
- The cover (`cover/Cover.tsx`, `src/hooks/useGreetingsCarousel.ts`) advances its
  greeting loop only while it is on screen and the tab is visible; a step that
  falls due off-screen is HELD and runs on return. There is NO carousel: the
  hook holds an index and `src/lib/cycle.ts` steps it. Embla never showed a
  slide — one greeting is mounted at a time — and removing it took 7 KiB of JS
  off the homepage (it did NOT shorten hydration: see the Theme note).
  `autoPlay` is separate from the loop on purpose: under
  `prefers-reduced-motion` the greeting is rendered already written (the
  `capture` path, remounted by key) and does not advance by itself, while
  previous/next still cycle — `MotionConfig reducedMotion="user"` does NOT
  cover `pathLength`. A manual step cancels the automatic one that was about to
  fire. The greetings share ONE box (`h-20 sm:h-30`), which is also what the
  hook observes: they differ in height, and a box resized per greeting shifted
  the layout every five seconds. The two buttons are named through Paraglide
  (`home_cover_previous_button`, `home_cover_next_button`).
- What hydrates late reserves its box first. `Marquee` carries `min-h-12` (the
  size of a `MarqueeItem`): react-fast-marquee renders nothing on the server, and
  the stack section grew 96px after hydration (CLS 0.111 on a deep link to
  `/#my-experiences`). The homepage article cards declare the REAL 6016×3388 of
  the banner files, as `components/blog/ArticleItem.tsx` does (2800×1280
  reserved a box 33px too low per row), and their `sizes` is
  `(max-width: 640px) 100vw, 372px`: the column caps the card, not the window.
- `DotPattern` without `glow` is ONE SVG `<pattern>` (three nodes, present in the
  server HTML, no measuring, no resize listener). The Motion circle per dot
  exists only in the `glow` branch, which no caller uses today — do not go back
  to one component per dot for a static grid (close to 900 circles on the
  homepage).
- End-of-content blocks (series, topics, related) go through `WritingsPanel`
  (20px heading, no second side border); `WritingsPrevNext` is the bottom
  previous/next, in the same order as the top-bar arrows and ←/→.
- `WritingsToC` renders ONE table of contents per width: the collapsible panel
  under `xl`, and from `xl` (1280px) a permanent rail in the right margin — the
  column is 768px, so 256px are free on each side. No `fixed`, no measuring: a
  zero-height `sticky` anchor carries the rail in `absolute`. It fades out once
  the article body is passed (an IntersectionObserver on `[data-longform]`),
  otherwise the full-width rules of the end blocks and the footer cut through
  it. Both forms mark the current section with `aria-current="location"`.
- `PanelHeader sticky` switches to its centred `-- title --` form by observing
  ITSELF against a root whose top sits one pixel below the sticky line (read
  from the computed `top`, which is in rem). Two earlier sentinel-based versions
  were each wrong by one edge; `e2e/titles.spec.ts` scrolls by wheel steps, both
  ways, to keep it honest. Its letters are plain `<span>` animated by CSS
  transitions in `Panel.tsx` — no Motion component per letter, no `TextAnimate`
  (215 Motion components gone from the homepage). Three rules come with it:
  - The served HTML SHOWS every title. Motion wrote its start state into the
    HTML, so 204 letters were served at opacity 0: blank bars for 2.6 to 2.9 s
    on a phone, and forever without JavaScript. After hydration the first
    report of an IntersectionObserver masks the titles that are off screen;
    they play their entrance once when reached. A title already on screen is
    left as served. The states live in the pure reducer
    `src/lib/sticky-title.ts` (static / armed / live, plus the exiting form).
  - `PanelHeader eager` is for the sticky header that can fall in the first
    viewport (today only About): its entrance is played by CSS at first paint
    through `@starting-style`, and it is the only title whose letters carry
    inline timing in the HTML. A new first section must pass `eager`.
  - Never stagger letters with one delay per letter: each start and each end is
    a phase boundary handled on the main thread (670 to 790 ms for 46 letters,
    against 230 to 300 on one shared timeline). All letters share one timeline
    and each carries its delay in a `linear()` easing built by
    `src/lib/stagger-easing.ts`. Their `transition-property` is `!important`,
    and only that: the theme provider cuts every transition while it applies a
    theme change, and a running transition is cancelled when its property
    leaves the list. The class gives no duration — without the inline style a
    state change applies at once, which is how a letter is masked without
    animating.

  Both copies are still mounted together during the swap (the leaving one is
  `absolute`) — the converging wait of the spec relies on it. Colour is NOT
  animated and NOT inherited from the header: each copy carries its own
  (`TITLE_COLOR` — foreground at rest, theme when stuck), so the leaving copy
  fades out in its colour while the entering one fades in in the other. The
  header used to fade its colour over 300 ms (`transition-colors`); colour is
  inherited, so each frame of that fade re-styled every letter with a running
  transition — the main cost of a swap, hence of scrolling on a phone. Never
  put a colour transition back on the header, nor a colour the copies would
  inherit; `e2e/titles.spec.ts` checks both.
- An `IntersectionObserver` callback reads the LAST entry of its batch
  (`entries.at(-1)`), or every entry when it watches several targets — never
  the first. Under main-thread pressure "on screen" then "off screen" arrive in
  ONE callback, and the first says the opposite of the real state until the
  next crossing: `PixelHeading`'s 50 ms tick restarted and never stopped
  (reproduced 4/4). `src/lib/intersection-observers.test.ts` reads every
  callback under `src/` as text and refuses the pattern.

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

`Mdx` (`src/components/markdown/mdx.tsx`) renders the long-form body: 15/16px,
line-height 1.7, running text capped at 72ch while code, tables and callouts keep
the full column. Its colour lives in `globals.css` (`.prose[data-longform]`), not
in a utility — the `.prose` rule there is `!important` inside `@layer base`. Code
tokens need `font-mono` on `[data-line] span` (the `.prose span` rule reaches
Shiki's spans despite `not-prose`), a fence WITHOUT a language is rendered as
`plaintext`, and MDX table cells wrap (`/weight` keeps the nowrap primitive).
Tool widgets carry `not-prose`, or list bullets land on their results.

French spacing is applied at RENDER by `src/lib/remark-french-spacing.ts`: a
no-break space before `:` and inside `« »`, a narrow one before `?`, `!` and `;`.
The sources keep ordinary spaces, so the text mirror, the search index and the
reading time — which all read the source — do not move. It is registered for
FRENCH content only: `Mdx` takes a `locale` prop (default: the page's) and the
three `[slug]` pages pass the CONTENT's locale, so a French fallback served under
`/en` keeps its spacing. Headings are skipped on purpose: their anchor is
computed twice, by `rehype-slug` at render and by fumadocs from the source, and
github-slugger turns a space into a dash but DROPS a no-break space — touching
them would break every ToC link and every anchor already shared.

The base MDX table does NOT declare `ComponentPreview`, `ComponentSource` or
`CodeCollapsibleWrapper`: only `/components` pages use them, so `ComponentView`
passes `COMPONENT_DOCS` (`markdown/component-docs.ts`) through the `components`
prop — otherwise every article downloads the playground. `component-docs.test.ts`
fails if an article or a tool uses one of these tags. Reading time is produced in
`content.ts` as `N min`, outside Paraglide: it never agrees and reads the same in
both locales (the hard-coded plural printed "1 minutes").

A tool page downloads ONE widget, the one of its slug. `getUtilWidgets(slug)`
(`markdown/utils-widgets.ts`) adds a single client boundary to the MDX table,
`UtilWidget` (`markdown/UtilWidget.tsx`), which holds the fourteen `import()`.
That is the whole point: Turbopack puts every client reference of a page in ONE
chunk group, and a `dynamic()` written in a SERVER module does not split it
(Next's lazy-loading guide says so) — the fourteen widgets shipped on every tool
page, 613 KiB of JS whatever the slug. An `import()` only splits where it is
written in client code. The boundary AWAITS the widget of the current URL at
module level, which makes it an async module: React waits for it before the
reference resolves, as it does for any chunk, and the widget then renders
synchronously. Do NOT move that wait into the render (`next/dynamic`, `lazy`):
the widget would load while the page hydrates, and until it has, React cannot
hydrate synchronously on the first keystroke or click and DROPS the event — 90
of 123 runs of the two `utils-tools` specs failed that way. Do NOT give each
widget its own async module either: prefetching the link to the neighbouring
tool evaluates it and brings that widget along. A new tool is one line in
`UtilWidget.tsx` and one in `utils-widgets.ts`, tied by a type.

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
`/articles` at 518 KiB of JS, CI at **707** — a third more, on what was then
the heaviest page of the site. Refresh both from a CI log, never from a
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
metadata/OG/llms routes. Employers in structured data are NOT read from
`GLOBAL_DATA.WORK.jobs` but from `EXPERIENCES` (the homepage `content.ts`):
only the latter carries periods, and it already is the source of the CV.
`WORK.jobs` is read by the vCard route alone.

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
  shared response helpers. The English tree has its OWN feeds, `/api/rss/en` (a
  static segment, which wins over `[category]`) and `/api/feed.en.json`; there
  are no per-category English feeds, and `feedAlternates("en")` advertises only
  those two. `FeedMeta.language` is what prefixes the item links with `/en` —
  not a second parameter, so a feed declared `en` cannot link to French pages —
  and `homeUrl` is `/en` WITHOUT a trailing slash (`/en/` is a 308). Feed tags
  are labels (`tagLabel`) in the language of the file served. JSON Feed items
  carry `content_text` (1.1 requires it or `content_html`) and `image` when the
  frontmatter has one; the feed declares `icon` and `favicon`.
  `feedTitle(locale, feed)` in `metadata.ts` is the title both the `<head>` and
  the feed itself use
- `feed-path.ts` - `rssFeedPath(locale)`, the "all content" feed of the language
  on screen. The navbar icon and the footer link both read it: the footer
  hard-coded `/api/rss` and opened the French feed from `/en`. A module of its
  own because the navbar is a client component and `feed.ts` imports the tags
- `content-dates.ts` - `latestUpdate`, shared by `sitemap.ts` and the homepage
  `ProfilePage.dateModified`, so both give the same date. Never date structured
  data with `dayjs()` on a revalidated page: the value moved every hour with no
  content changing, and contradicted the `lastmod` of the same URL
- `json-ld.ts` / `breadcrumb-json-ld.ts` - the site graph and the node of a
  content page. `getPageJsonLd` gives that node an `@id` (`<url>#article`),
  `mainEntityOfPage`, `publisher`, `wordCount` and `timeRequired`; a component
  is a `TechArticle`, articles and tools are `BlogPosting`. `keywords` are
  `tagLabel(tag, fileLocale)`, and the fallback image is the SAME URL as
  `og:image` (both from `contentOgImageParams` in `metadata.ts`). In the Person
  node a job without `period.end` goes under `worksFor`, the others under
  `alumniOf`. The breadcrumb has its own module because a CLIENT component
  emits it; `breadcrumbHref` strips the trailing slash `localizeHref("/")`
  produces (`/en/`, a 308) — `next/link` does that itself, a bare `<a>` does not
- `github-stats.ts` - language aggregation across repos (forks excluded). Owns
  `DEFAULT_LANGUAGE_COLOR`, shared with `repos.ts` so the same language never
  gets two different dots
- `og.ts` - social-card identity per page type: family, palette, badge wording,
  truncation and title sizing. Badge contrast is asserted with the site's own
  `contrast.ts` — an OG image is never scanned by axe, which is precisely why the
  pairs are measured (the first ones sat at 3.95:1). A tenth page type, `page`
  (badge "page", the writing family and palette), serves the pages that belong
  to no section: `/cv`, `/uses`, `/now`, `/weight`, `/search`, tags and series.
  Only the articles index is `blog` — the CV card used to carry the "blog" badge
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
- `zod-config.ts` - sets `jitless: true` and re-exports the `zod/mini` builders
  ONE BY ONE — no `z`, no `export *`. Client-side schemas MUST take their
  builders from here (`src/schemas/emailSchema.ts` is the reference). Two reasons:
  a re-exported `z` namespace travels as a value and defeats tree-shaking
  (125 KiB on the wire for a two-field form, 52 with named `zod/mini` functions),
  and the classic `z.object()` probes `new Function` in a try/catch, which a
  strict `script-src` reports as a violation even though the throw is caught.
  `jitless` is read when a schema is BUILT, so importing the builders from here is
  what guarantees the order. A schema that needs one more builder adds it to the
  list. Server-only modules (`env.ts`, `content.ts`, the admin actions) import
  `"zod"` directly: no CSP applies there and the chained API costs visitors nothing.
- `toc.ts` / `content-toc.ts` - `toc.ts` only groups entries that were already
  extracted (`groupTocItems`) and imports nothing but a TYPE from fumadocs, so the
  client component `WritingsToC` can use it. The extraction (`getContentToc`)
  lives in `content-toc.ts`, server-only: in one module, the whole markdown
  parser shipped in the bundle of every content page.
- `safe-storage.ts` - `localStorage` that returns its failure instead of
  throwing it (see Storage under Important Notes)
- `pause-off-screen.ts` - `pauseOffScreen`, the shared-observer ref callback
  for infinite CSS animations (see Testing, "at rest")
- `accessible-name.ts` - `accessibleName(visible, detail)` builds a label that
  STARTS with the visible text (WCAG 2.5.3): `aria-label` replaces the content,
  and someone driving the browser by voice says what they read.

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
never re-implements the function it checks. A few sit next to what they guard:
`src/schemas/emailSchema.test.ts` (field bounds written by hand, plus a trap on
the `Function` constructor for the CSP), `src/data/uses.test.ts`,
`src/components/markdown/component-docs.test.ts`,
`src/components/utils/plural.test.ts`. In `src/lib/`,
`functions.test.ts` pins the localized date format, `toc.test.ts` the grouping,
`content.test.ts` the reading time over the whole corpus, `metadata.test.ts`
the title template in both locales and the homepage's way out of it.

End-to-end tests (Playwright, `e2e/`):

- `i18n.spec.ts` - both trees render in the right language. Nine page types are
  loaded in both languages and ANY `pageerror` fails: a production build reports
  a hydration mismatch as "Minified React error #418", which the old filter on
  the development wording never matched. It also reads the SERVED English HTML
  for labels only client components render, with the French page as a control
- `csp.spec.ts` - headers, plus every page type loaded in a real browser with a
  `securitypolicyviolation` listener. It also asserts no `.js` request failed —
  a page whose scripts never load reports no violations and would otherwise pass
- `search.spec.ts` - ⌘K palette: shortcuts, full-text match on body-only words,
  diacritic-insensitivity, navigation, EN index
- `feeds.spec.ts` - RSS/JSON Feed shape, per-category filtering, escaping, and the
  plain-text mirror in both languages. Its English block starts from the
  `<link rel="alternate">` a `/en` page DECLARES, then reads what is served
  behind them: the language, `/en` links, the same items as the French feed
- `seo.spec.ts` - what the site says about itself to machines, read in the
  SERVED HTML: every sitemap URL carries the name exactly once in its `<title>`,
  the homepage introduces itself in the language of its tree, its `ProfilePage`
  date equals the sitemap `lastmod`, the Person has a single current employer,
  an English article publishes English `keywords`, the English breadcrumb
  reaches `/en` without a redirect, and `/favicon.ico` is an icon
- `reading.spec.ts` - related posts, ToC (the panel under 1280px, the rail
  above), ←/→ navigation, progress bar, back to top, tablist keyboard contract
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
  NOR the page of another tool (`/utils/regex-tester` receives neither the speed
  test nor nuqs), with a CONTROL case per marker (the speed-test page must contain
  `speed.cloudflare.com`, the lorem ipsum page `__nuqs__`) so that removing the
  dependency cannot turn every absence assertion green for nothing
- `search-page.spec.ts` - the `/search` page and its agreement with the palette
- `playground.spec.ts` - the component playground and its generated code
- `offline.spec.ts` - the service worker, with the network genuinely cut
- `a11y.spec.ts` - axe-core (4.14, WCAG 2.0/2.1 A + AA) over 26 URLs, a dark-theme
  pass, and the open playground, palette and shortcuts sheet. No debt is tolerated any more: any
  violation fails. Three states axe cannot reach on its own (a collapsed
  certification, the article dialog, the 404) are opened and checked for
  `label-content-name-mismatch`
- `cv-form.spec.ts` - the CV request dialog in both languages, and a check that
  Zod's locale strings are NOT shipped on `/` and `/en` (with a control that the
  marker exists in the package)
- `routes.spec.ts` - every sitemap `<loc>` and hreflang answers, rendered internal
  links answer, a 404 comes back in the language of its URL with one `<h1>` and no
  horizontal overflow, the footer leads to the pages nothing else links to, and
  its RSS link — like the navbar's — opens the feed of the page's language
- `titles.spec.ts` - homepage section titles stay visible, and their sticky form
  follows the scroll position by wheel steps in both directions. Titles are
  readable with JavaScript disabled, an off-screen title is masked after
  hydration and enters when reached, the letters keep their transition under
  the theme provider's rule (with the title copy as control), and a sticky
  title carries its own colour with no fade on the header
- `load-stability.spec.ts` - no deferred boundary in the served HTML of `/` and
  `/en`, the deep link at 390px, the pixel title's box with the four late fonts
  blocked, the theme not re-applied at mount (plus toggle, system theme and
  stored theme — the witness is the class read at `DOMContentLoaded`, which
  only the inline script can have set), a stored theme named like an
  `Object.prototype` key, pages rendering with a storage that throws, the
  pixel title stopping off-screen when two intersection changes arrive
  together, and the header sentence and halos at rest off screen
- `budget.spec.ts` - JS, font and CSS weight ceilings measured in the browser, plus
  the font-preload count. It runs with service workers BLOCKED: a response
  served through the site's own service worker reports a negative body size to
  Playwright, so every lazily loaded chunk was being subtracted from the total.
  Its `waitForBackdrop` COPIES the mount condition of `Particles.tsx` — change
  both together — and each `POIDS` line ends with `particules=oui|non`

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

What a page does when nobody touches it is measured with CDP
`Performance.getMetrics` (`TaskDuration` over 5-second windows) plus
instrumented `requestAnimationFrame` / interval counts. On a shared machine only
the COUNTS are reliable, and a saturated scroll cannot show a time gain. One
loop is left running on purpose: `PixelHeading` ticks every 50 ms (`autoPlay`)
for as long as a title is on screen — that is the heading's design, and
changing it is the owner's call, not a performance fix. At rest with the cover
off screen NOTHING else runs on the main thread: 2 to 16 ms and 0 to 1 style
recalculation per 5 s on a phone profile, where the sentence flip of the header
and four `animate-ping` halos cost 212 to 447 ms and 39 to 62 recalculations.
Two rules keep it so:

- `FlipSentences` (a registry component: `pnpm registry:build` after any
  change) observes its own root. A flip that falls due off screen, or with the
  document hidden, is HELD and the interval stops; on return it runs at once,
  by ONE step, and the 4 s rhythm restarts. It stays self-contained
  (`motion/react`, `react`, `cn`).
- An infinite CSS animation that can sit off screen takes `pauseOffScreen`
  (`src/lib/pause-off-screen.ts`) as its `ref`: ONE shared IntersectionObserver
  (rootMargin 200px) sets inline `animation-play-state: paused` off screen and
  removes it before the element enters. `PulsatingCircle` is a client component
  for that one reason — a ref cannot cross a Server Component boundary — and
  its served HTML is unchanged. Two CSS-only routes were measured and do NOT
  work: `content-visibility: auto` (Chromium still animates content 1191px
  below an 844px viewport) and a `view()` timeline toggling a custom property
  read by `animation-play-state` (an animated custom property is ignored inside
  `animation-*`, so the halo stays paused on screen too). To see whether an
  animation ticks, count style recalculations through CDP:
  `document.getAnimations()` still reports `running` for skipped content.

Three measuring lessons from the phone-fluidity work. A forced layout or style
recalculation is charged to whoever READS layout first, not to whoever dirtied
it: attribute by switching the suspect off, never from a profile's self time —
embla was blamed for what next-themes caused. Scroll smoothness is judged on
frames delivered with one frame forced per vsync, gaps over 50 ms and long
tasks, confirmed by an interleaved A/B on ONE build: busy time saturates, and
the same build gave 398 to 439 frames between runs. The deep-link shift is
timing-dependent (0 to 5 loads in 10): measure it under several network
profiles and guard its cause in the served HTML, not the CLS number.

`page.waitForLoadState("networkidle")` on a SECOND load of a page already
visited in the same context waits 28 to 36 s: the RSC prefetches reappear as
requests Chromium leaves open and then aborts. The two arrow-key tests of
`reading.spec.ts` are separate tests for that reason — do not merge them back.

### Admin space (`/admin`)

A **third root layout** next to `(fr)/` and `en/`, GitHub-only sign-in via
better-auth, restricted to a single account. Everything lives under
`src/lib/admin/` + `src/app/admin/`.

**The authorisation rule is a pure module**: `access.ts` decides, with no DB,
network or better-auth import — so the one decision whose failure grants a
stranger write access to this repo is unit-tested in isolation. Two properties
matter and are tested: it **fails closed** (no `ADMIN_GITHUB_ID` ⇒ nobody gets
in, owner included), and it keys on the **numeric GitHub id, never the login** —
a login can be renamed and re-registered by someone else, which would turn a
rename into an admin takeover. The test also caught a hole in the first version:
`String(["42424242"])` is `"42424242"`, so a one-element array passed the numeric
check; the type is now verified before conversion.

**Three independent barriers**, none assuming another is correct:
1. a `databaseHooks.user.create.before` hook, so a foreign account is never
   created and no session ever exists for it;
2. `requireAdminSession()` at the top of every protected page;
3. the same check again in the `(protected)` layout.

⚠️ **A guard in the layout is NOT enough**, and this is counter-intuitive: Next
renders layout and page **in parallel**, so a `redirect()` thrown by the layout
does not stop the page — it computes its data and its JSX lands in the RSC
payload of the redirect response. Measured here: `curl /admin` with no session
returned a 307 whose **body contained the whole content inventory and the weight
table**. `e2e/admin.spec.ts` reads that body and fails on it. Always call
`requireAdminSession()` before touching data in a protected page.

**Lazy construction**, same lesson as `getResend()`: `betterAuth()` and
`new Pool()` are built on first request, never at module scope — CI has none of
the variables and would otherwise fail the build. Every admin env var is
`optional()` in `src/env.ts` for the same reason; the runtime check is what
closes the door, not the schema.

`frontmatter.ts` rewrites MDX without `gray-matter.stringify` nor js-yaml: both
reformat everything, and a `createdAt: 2026-03-03` read back through
`z.coerce.date()` would be rewritten as an ISO timestamp that `assertValidDates`
then refuses — a save from the admin would produce files the site can no longer
read. Its test round-trips **all 44 real content files** through `gray-matter`,
comparing values order-independently: the serialiser imposes a canonical field
order on purpose (the corpus is inconsistent today), so six files will show a
one-time reordering diff with no value change.

`messages.ts` guards the two failure modes a hand-edited translation produces
without breaking anything loudly: a **lost interpolation** (`{words} mots` →
`words` renders a sentence with no number, silently) and a key added **in English
only** (`compile-i18n.mts` counts FRENCH keys and would fail the build; the
reverse is the normal untranslated case). Both are refused before writing, which
is what makes it safe for the action to commit the two files as two separate
commits rather than going through the Trees API. Its test round-trips both real
message files **byte for byte** — a serialiser that differs from the repo's
format would produce a 622-line diff on the first save with no value change — and
asserts the live repo has no placeholder mismatch.

Setup: create a GitHub OAuth app (callback
`https://<domain>/api/auth/callback/github`), a Neon project, run
`psql "$DATABASE_URL" -f migrations/0001_better_auth.sql`, then set
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET` and `ADMIN_GITHUB_ID` (find it with
`curl https://api.github.com/users/<login> | jq .id`). Missing any of them makes
`/admin/signin` say which, and keeps the door shut.

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
| `DATABASE_URL` | No | Neon Postgres, for better-auth sessions (`/admin`) |
| `BETTER_AUTH_SECRET` | No | Session signing secret (`/admin`) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth app (`/admin`) |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth app (`/admin`) |
| `ADMIN_GITHUB_ID` | No | **Numeric** GitHub id allowed into `/admin` — absent means nobody |

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
  across titles and types to catch exactly that. The footer of the homepage card
  falls back to `m.user_job_title` in the REQUESTED locale; the fallback is
  decided in the route's `GET`, not in `HomeCard` — a route has no ambient locale
- **Favicon**: `public/favicon.ico` is a copy of
  `public/favicons/favicon-light.ico`, for clients that never read the `<head>`
  (a feed reader, a tab opened on a feed or a text mirror): `/favicon.ico`
  answered 404 with a 40 KB page. The per-theme `<link>` icons are unchanged.
  `apple-touch-icon.png` is 512×512 and declared as such
- **Images**: in Next 16, `priority` on `next/image` only emits the preload. An
  LCP image needs `fetchPriority="high"` written explicitly (`Header.tsx`;
  `PortalImage` sets it whenever `priority` is passed)
- **Particles** (`src/components/blocks/Particles.tsx`): the canvas is NOT
  mounted under 768px. It mounts only while
  `(min-width: 768px) and (prefers-reduced-motion: no-preference)` matches — the
  query is followed, not read once — and on a device with more than two cores.
  Under 768px the column fills the screen: a full-screen DPR-3 canvas was
  repainted sixty times a second for about ten one-pixel dots. Never wait for
  `#tsparticles` at phone width. The count is capped: `particles.number.limit`
  in `delete` mode at `CLICK_HEADROOM` (3) times the density — a click pushes
  two particles and `outModes: "out"` recycled them forever. tsParticles scales
  the limit by the same area factor as `value`, and a limit BELOW `value`
  reduces the initial count: keep the multiple above 1
- **Footer clock**: `FooterClock` ticks only while its root is on screen and the
  document is visible, and sets the time once before it resumes. It re-rendered
  every second on every page, footer off-screen or tab in the background. The
  server placeholder is still replaced at mount
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
  locally is what took the preload count from 7 down to 3. Geist Sans and Geist
  Mono are declared locally too (`src/fonts/sans.ts`, `src/fonts/mono.ts`; the
  `geist` package is gone): Sans is drawn on one page and no longer preloaded,
  which brings the count to 2. Mono stays preloaded on purpose — see the note in
  `mono.ts` before changing it. Turbopack names a `next/font/local` family
  after its constant (`PixelSquare`, `GeistMono`), so the "Geist Mono" entry of
  the fallback lists matches nothing. The four non-preloaded pixel fonts fall
  back FIRST to `PixelSquare`: the five variants share line height and
  advances, so a letter sits in its final place before its font arrives (until
  then a title box was 42.5px high instead of 38.5: CLS 0.036 to 0.046 on
  every load of a content page)
- **Theme**: `src/components/providers/modules/ThemeProvider.tsx` passes an
  EMPTY `value` map to next-themes and applies the class on `<html>` itself, in
  `ThemeClass`, only when it changes, cutting transitions during the switch. Do
  not put `disableTransitionOnChange` back and do not remove the empty map:
  next-themes re-applied at every mount the theme its inline script had just
  set, which invalidated the style of the whole document (2,900 elements on
  the homepage) inside the hydration task — longest task 496 to 571 ms on a
  phone profile, 308 to 425 without it. The lever relies on next-themes 0.4.6
  (the inline script falls back to the theme name, the React side does not);
  `e2e/load-stability.spec.ts` fails if an upgrade changes that. The map is
  built with `Object.create(null)`: with a plain `{}`, a stored theme named
  like an `Object.prototype` key (`constructor`, `toString`, `__proto__`) found
  a function in it, next-themes passed it to `classList.add`, and the whole
  page became the error screen. `NavBarTheme` handles the rejected `ready` of a
  skipped view transition (19 unhandled errors for 20 fast clicks)
- **Storage**: `localStorage` THROWS when site storage is blocked — it is not
  merely empty. Read and write through `src/lib/safe-storage.ts`
  (`readStorage`, `writeStorage`, `removeStorage`), never `localStorage`
  directly: one unguarded `getItem` in an effect of `FooterClock` replaced
  EVERY page of the site with the error screen, and a tool page wrote its
  visit the same way. `e2e/load-stability.spec.ts` loads three page types with
  a throwing storage
- **Print**: the `@media print` block in `globals.css` covers `/cv` AND content
  pages. The chrome goes by element (`header`, `nav`, `footer`) and anything
  tagged `data-print="hide"` is dropped (ToC, pagination, share actions, tags,
  series, related). `pre` switches to `pre-wrap`: on paper there is
  no horizontal scrolling, so an overflowing code block is silently CUT. The page
  URL is rendered by `WritingsByline` because CSS cannot read `location`
- **Dates**: `formatDate` (`src/lib/functions.ts`) loads dayjs's `localizedFormat`
  plugin. `LL` is not a core dayjs token: without the plugin dayjs does not throw,
  it prints the literal `LL` — which is what every byline showed
- **Progress bar**: import `@bprogress/next` from its `/app` entry. The package
  root also re-exports the Pages Router provider: 18 to 24 KiB of unused router on
  every page
- **Focus ring**: ONE `:focus-visible` rule in `@layer base` of `globals.css`
  draws it for the whole site, in `--ring`, which is the theme colour (the grey
  one measured 2.62:1, 1.55:1 on links). Do not add focus classes to primitives:
  `outline-none` next to `focus-visible:outline-2` computes to `outline: none 2px`,
  i.e. no indicator at all. A component that draws its own indicator opts out
  with an `outline-*` utility, which always wins over the base layer. Base UI's
  `Slider` focuses the hidden `<input>` INSIDE the thumb: use `has-[:focus-visible]`
- **AGENTS.md**: `next dev` (16.4) writes one at the repo root and restores it when
  deleted. It is git-ignored; this file is the documentation
- **Persisted stores**: Zustand stores in `src/hooks/` carry a `version` and a
  `migrate` (see `useConfig.ts`). A stored shape that no longer matches the code
  must be migrated, not trusted
- **Arrow-key shortcuts**: `WritingsShortcuts` moves between posts with ←/→ and
  bails on `event.defaultPrevented`, so widgets with their own arrow semantics
  (a `role="tablist"`, a combobox) don't also change the page. They follow
  chronological order, NOT the series order — the series has its own explicit
  previous/next links
- **Navbar** (`src/components/layout/navbar/elements/`): the logo and the
  desktop « accueil » link go through `NavBarIntentLink`, which prefetches the
  homepage on intent only — hover or focus. It is the heaviest page of the site
  and was downloaded on every page view (54 KiB of RSC, then its chunks). RSS
  and llms.txt are plain `<a>`: their targets are route handlers. The RSS one
  opens the feed of the current language, through `rssFeedPath` — the rule the
  footer link shares.
  `NavBarTooltip` labels the icon-only buttons with their accessible name, never
  a second wording. `isRouteActive(link, pathname)` takes the UNPREFIXED route
  and `isHomePath` recognises `/` and `/en` — never compare `pathname === "/"`.
  The scrolled bar is `bg-canvas/98` in light and `/90` in dark: the active link
  (#306fdb) holds 4.75:1 on the canvas and 4.55:1 through 98 % over black, 97 %
  falls under 4.5; in dark the peach stays above 10:1 at 90 %, so the blur is
  kept. Its bottom rule is a border, not `screen-line-after` (a 0.5px block at
  `bottom: 0` rounds to zero height). Escape closes the mobile menu and returns
  focus to its toggle — unless a layer above it (palette, shortcuts sheet) has
  already consumed the key (`event.defaultPrevented`). Under 768px both of those
  layers are drawers
- **Offline**: `public/sw.js` caches `/_next/static/**`, fonts and images
  cache-first (their URLs are content-hashed), and HTML **network-first**. Never
  serve HTML from cache while the network answers: a stale document references
  chunks that no longer exist and loads without any JavaScript, silently.
  `public/offline.html` is the fallback and carries no script and no external
  stylesheet on purpose — it can sit in a cache for months
- **Playground**: props declared in `src/registry/playgrounds.ts`, which also holds
  the component reference. Do NOT read it from `Index`: `registry:component`
  entries have no `component` field, only `registry:example` ones do
