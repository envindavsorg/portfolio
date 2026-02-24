# Portfolio Optimizations Tracker

> Last audited: 2026-02-24

## Status Legend

- ✅ Fixed
- 🔲 To Do

## High Priority

| # | Status | Issue | File | Details |
|---|--------|-------|------|---------|
| 1 | ✅ | Incorrect canonical URL on blog articles | `src/app/(content)/(writings)/articles/[slug]/page.tsx:57` | Now uses `/${category}/${slug}` |
| 2 | ✅ | Focus ring disabled on buttons | `src/components/primitives/Button.tsx:20` | Added `focus-visible:ring-2` with ring-ring and ring-offset |
| 3 | ✅ | Double dark mode script | `src/app/layout.tsx` | Only one script present — no duplication |
| 4 | ✅ | HTML lang attribute mismatch | `src/app/layout.tsx:142` | Changed to `lang="fr"` |
| 5 | ✅ | Homepage loads all sections synchronously | `src/app/(content)/(root)/page.tsx` | `About` lazy-loaded via `dynamic()`, `Commits` wrapped in `<Suspense>` for streaming |
| 6 | ✅ | Unused dependencies in bundle | `package.json` | All used: `tslog` (logger), `rough-notation` (Highlighter), `poline` (ColorGenerator), `react-confetti` (CvSuccess) |

## Medium Priority

| # | Status | Issue | File | Details |
|---|--------|-------|------|---------|
| 7 | 🔲 | Missing skip-to-main navigation link | `src/app/(content)/layout.tsx` | No skip link for keyboard-only users |
| 8 | 🔲 | Base CSS applies pixel font globally | `src/styles/base.css:20-26` | `font-pixel-square` forced on all `p, li, span, a, div` — apply selectively instead |
| 9 | 🔲 | Particles density too high | `src/app/(content)/layout.tsx:16` | `density={150}` — reduce to 50-80 for better perf on low-end devices |
| 10 | 🔲 | prefers-reduced-motion not respected everywhere | `FlickeringGrid.tsx`, `PixelHeading.tsx` | Particles checks it, but FlickeringGrid and PixelHeading animations don't |
| 11 | ✅ | FlickeringGrid canvas missing dimensions | `src/components/blocks/FlickeringGrid.tsx` | Canvas has width/height set properly |
| 12 | ✅ | GitHub cache TTL too short | `src/actions/github/` | 1h revalidation is reasonable |

## Low Priority

| # | Status | Issue | File | Details |
|---|--------|-------|------|---------|
| 13 | 🔲 | PNGs still in public/ | `public/images/logo/png/`, `public/images/og-banner.png` | Convert to WebP for smaller size |
| 14 | ✅ | Missing priority on article images | `src/app/(content)/(root)/_components/articles/ArticleItem.tsx:36` | `priority` prop is set |
| 15 | 🔲 | OG images generated at request time | `src/app/api/og/route.tsx` | Could pre-generate at build for static routes (has 24h cache header though) |
| 16 | ✅ | Icon library over-bundled | `package.json` | Phosphor icons used in 29 files — legitimate usage |
| 17 | ✅ | Registry barrel exports | `src/registry/index.ts` | Properly structured |
| 18 | ✅ | ComponentPreview missing Suspense | `src/app/(content)/(writings)/_components/ComponentPreview.tsx` | Suspense boundary present |
| 19 | ✅ | Layout pages missing metadata | `src/app/(content)/(writings)/layout.tsx` | Metadata defined |
| 20 | ✅ | Homepage not explicitly static | `src/app/(content)/(root)/page.tsx:21` | `revalidate = 3600` present |

## Progress

**Fixed:** 14/20 (70%)
**Remaining:** 6/20 — 0 high, 4 medium, 2 low
