# Architecture

**Analysis Date:** 2026-08-12

> Superseded the 2026-02-17 snapshot: the `src/features/` module layout and the
> single-locale route tree it described are gone.

## Pattern Overview

**Overall:** a static-first Next.js App Router site. Two root layouts serve two
locales, content comes from MDX on disk, and the only dynamic work is a handful of
cached GitHub queries and one server action.

**Key characteristics:**

- **Static by default.** Almost every route is prerendered. Decisions across the
  codebase exist to keep it that way — tag filtering is client-side instead of
  using `searchParams`, and the CSP avoids nonces because they would require a
  middleware and force dynamic rendering.
- **Two root layouts, one implementation.** `app/(fr)` is canonical; `app/en`
  re-renders the same views with `locale="en"`.
- **Server Components by default,** `'use client'` pushed to the leaves.
- **Logic separated from rendering.** Anything worth testing lives in `src/lib/` as
  a plain module with a sibling test.

## Layers

**1. Route layer (`src/app/`)**
Layouts, pages, route handlers. Pages own metadata (`createMetadata`) and JSON-LD,
and compose feature components. `(fr)/(content)/layout.tsx` provides the site
chrome (NavBar, Footer, Particles).

**2. Feature layer (`src/components/features/`, `_components/`)**
Homepage sections and the writings reading UI. The RSC boundary pattern:
`Feature.tsx` is an async Server Component that fetches, `FeatureContent.tsx` is
`'use client'` and receives plain props.

**3. Primitive layer (`src/components/base/`, `primitives/`, `blocks/`)**
The only code that touches Base UI directly. `cn()` merges Tailwind classes;
`class-variance-authority` handles variants.

**4. Logic layer (`src/lib/`)**
Content reading and validation, search indexing, related-post scoring, feed
serialisation, GitHub statistics, rate limiting, JWT/diff/hash, MDX plugins,
metadata construction.

**5. Data layer (`src/data/`, `src/content/`, `src/actions/`)**
`GLOBAL_DATA` for personal data, MDX files for content, server actions for
anything remote.

## Data Flow

**Content (build time):**
`src/content/**/*.mdx` → `lib/content.ts` (read, `assertValidDates`, Zod parse,
sort by `createdAt` desc) → pages → `next-mdx-remote` + the custom rehype/remark
plugins → HTML. Locale resolution merges `<category>/en/` over the FR files and
falls back to FR, so each `Content` carries the locale it actually came from.

**Search index:**
`getAllContent(locale)` → `toSearchDoc` → a compact `SearchDoc[]` handed to the
navbar. This matters for payload size: the navbar is site chrome, so whatever it
receives ships in the RSC payload of *every* page. Passing full `Content` objects
embedded the entire MDX body of every article in every page.

**GitHub data (request time, cached):**
`data.action.ts` / `commit.action.ts` → `unstable_cache` (1 h) → section
components. The cache wraps only the fetch; the `catch` is outside it, so a
failure is not cached for an hour and a GitHub 401 cannot fail the build.

**CV request (client → server):**
`useEmailForm` → `emailSchema` (Zod, messages resolved lazily so the locale is the
visitor's) → `send-cv.action.ts` → three rate limiters (per IP, per recipient,
global) → Resend.

**Feeds:**
`getContentByCategory` → `toFeedItems` → `toRssXml` / `toJsonFeed` → static route
handlers.

## Key Abstractions

- **`createMetadata({ locale, path, … })`** — the single source of canonical URLs,
  hreflang alternates and OG images. `path` is always the unprefixed route.
- **`setServerLocale` / `overwriteGetLocale`** (`lib/i18n.ts`) — per-request locale
  in RSC, held in a React `cache()`. Next.js RSC gives Paraglide no
  AsyncLocalStorage, so this is the official workaround.
- **`Content` / `SearchDoc`** — the full post versus the compact index entry.
- **`SectionBoundary`** — a class error boundary. `Suspense` covers waiting, not
  failure; a section that throws without one takes down the page.
- **`RateLimiter`** — a sliding window where blocked attempts do not extend the
  window.
- **`toContentLocale`** — narrows a Paraglide locale string to `"fr" | "en"` instead
  of casting.
- **`z` from `lib/zod-config.ts`** — Zod with the JIT disabled, for client bundles.

## Entry Points

| Entry | File |
|---|---|
| FR site | `app/(fr)/layout.tsx` → `(content)/layout.tsx` |
| EN site | `app/en/layout.tsx` → `(content)/layout.tsx` |
| 404 | `app/global-not-found.tsx` (own `<html>`), plus per-tree `not-found.tsx` |
| Feeds | `app/api/rss/route.ts`, `app/api/rss/[category]/route.ts`, `app/api/feed.json/route.ts` |
| OG images | `app/api/og/route.tsx` |
| Plain text | `app/(llms)/**` |
| Sitemap / robots / manifest | `app/sitemap.ts`, `robots.ts`, `manifest.ts` |
| Build scripts | `src/scripts/*.mts`, `*.ts` |

## Error Handling

- **Remote data:** every GitHub query has a typed fallback (zeroed counters) and
  logs the failure. Nothing throws upward, so the build cannot break on a bad
  token.
- **Content:** invalid frontmatter or a nonexistent date throws at build time on
  purpose — better a failed build than a page silently sorted wrong.
- **i18n:** `compile-i18n.mts` compares compiled message count against
  `messages/fr.json` and exits 1 on a mismatch.
- **Rendering:** `SectionBoundary` isolates a failing homepage section.
- **Server action:** `next-safe-action` returns typed validation and server errors;
  rate-limit rejections come back as ordinary error results.

## Cross-Cutting Concerns

- **Localisation** touches every layer: routes, metadata, content, messages. New UI
  strings must land in both `messages/fr.json` and `messages/en.json`.
- **Security headers** are declared once in `next.config.ts`. `script-src` keeps
  `'unsafe-inline'` because the RSC payload streams through dozens of inline
  `<script>` tags (and pages add inline JSON-LD); nonces would force dynamic
  rendering and hashes cannot be computed for content that changes per build.
  `e2e/csp.spec.ts` is what keeps the rest of the policy honest.
- **Caching** is uniform: `unstable_cache` with a 1 h revalidate for remote data,
  `force-static` on feed routes, `Cache-Control` with `stale-while-revalidate` on
  their responses.
- **Accessibility** is treated as part of the contract, not a polish pass: exposing
  `role="tab"` means implementing arrow navigation, decorative elements are
  `aria-hidden`, and the e2e suite asserts the keyboard behaviour.
- **Sound and motion** respect `prefers-reduced-motion` through `useMediaQuery`.
