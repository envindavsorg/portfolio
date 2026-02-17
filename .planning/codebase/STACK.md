# Technology Stack

**Analysis Date:** 2026-02-17

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code in `src/`, strict mode enabled
- TSX - React components throughout `src/`

**Secondary:**
- MDX - Blog and component documentation content
- JavaScript (`.mjs`) - PostCSS config `postcss.config.mjs`, minor scripts
- CSS - Tailwind CSS directives in `src/styles/`

## Runtime

**Environment:**
- Node.js v25.6.0 (pinned via `.nvmrc`)
- Also compatible with v20 or v22+ per project docs

**Package Manager:**
- pnpm 10.29.3 (pinned with SHA hash in `package.json`)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js 16.1.6 - App Router, SSR/SSG, Server Actions, API routes
  - Config: `next.config.ts`
  - Dev port: 1408 (`next dev -p 1408`)
  - Turbopack: enabled by default in Next.js 15+
  - Page extensions: `mdx`, `ts`, `tsx`
  - React strict mode: enabled

**UI Components:**
- React 19.2.4 - UI rendering with latest concurrent features
- React DOM 19.2.4 - DOM rendering companion
- shadcn/ui (CLI: 3.8.5) - Component scaffold and registry integration
  - Components live in `src/components/ui/`
  - Custom distribution registry at `src/registry/`

**Styling:**
- Tailwind CSS 4.1.18 - PostCSS-based (v4 new oxide architecture)
  - PostCSS plugin: `@tailwindcss/postcss` via `postcss.config.mjs`
  - Typography: `@tailwindcss/typography` 0.5.19 for blog/MDX prose
  - Animation addon: `tw-animate-css` 1.4.0
  - `@tailwindcss/oxide` - Rust-based CSS engine (trusted dependency)
- `tailwind-merge` 3.4.1 - Class merging via `cn()` in `src/lib/utils.ts`
- `class-variance-authority` 0.7.1 - Variant-based component classes (CVA)
- `clsx` 2.1.1 - Conditional class joining

**Animation:**
- Motion 12.34.0 (`motion`) - Framer Motion v12, primary animation library

**State Management:**
- Jotai 2.17.1 - Atomic state management for client state

**Forms & Validation:**
- React Hook Form 7.71.1 - Form state and submission handling
- Zod 4.3.6 - Schema validation (also used for env var validation in `next.config.ts`)
- `@hookform/resolvers` 5.2.2 - Zod/RHF bridge

**Content Processing:**
- `next-mdx-remote` 6.0.0 - MDX rendering for blog/component docs
- `fumadocs-core` 16.6.2 - MDX/docs processing utilities
- `gray-matter` 4.0.3 (dev) - Frontmatter parsing for blog post metadata
- `remark` 15.0.1 - Markdown AST processor
- `remark-gfm` 4.0.1 - GitHub Flavored Markdown
- `remark-mdx` 3.1.1 - MDX support in remark
- `rehype-pretty-code` 0.14.1 - Syntax highlighting integration
- `shiki` 3.22.0 - Syntax highlighter engine (code blocks)
- `rehype-slug` 6.0.0 - Add IDs to headings
- `rehype-external-links` 3.0.0 - Open external links in new tab
- `rehype-raw` 7.0.0 - Parse raw HTML in markdown
- Custom rehype plugins: `src/lib/rehype-component.ts`, `src/lib/rehype-npm-command.ts`
- `unist-builder` 4.0.0 + `unist-util-visit` 5.1.0 - AST manipulation for plugins

**Email:**
- `@react-email/components` 1.0.7 + `@react-email/render` 2.0.4 - React email templates
- `resend` 6.9.2 - Transactional email sending API

**Theming:**
- `next-themes` 0.4.6 - Dark/light/system mode switching

**UX & Navigation:**
- `@bprogress/next` 3.2.12 - Page transition progress bar
- `sonner` 2.0.7 - Toast notifications
- `vaul` 1.1.2 - Drawer/sheet component
- `cmdk` 1.1.1 - Command palette

## Key Dependencies

**Critical Integrations:**
- `octokit` 5.0.5 - GitHub GraphQL/REST API client
  - Configured in `src/lib/octokit.ts`
  - Requires `GITHUB_API_TOKEN` env var
- `resend` 6.9.2 - Email sending
  - Requires `RESEND_API_KEY` env var
- `@vercel/blob` 2.2.0 - File/asset storage on Vercel Blob
  - Requires `BLOB_READ_WRITE_TOKEN` env var
- `@vercel/analytics` 1.6.1 - Web analytics
- `@vercel/speed-insights` 1.3.1 - Core Web Vitals monitoring

**UI & Interactive:**
- `@phosphor-icons/react` 2.1.10 - Primary icon library
- `@radix-ui/react-checkbox` 1.3.3 - Accessible checkbox primitive
- `@radix-ui/react-icons` 1.3.2 - Radix icon set
- `@radix-ui/react-popover` 1.1.15 - Popover primitive
- `@radix-ui/react-select` 2.2.6 - Select/dropdown primitive
- `@radix-ui/react-slot` 1.2.4 - Slot/composition primitive
- `@radix-ui/react-tooltip` 1.2.8 - Tooltip primitive
- `@radix-ui/react-visually-hidden` 1.2.4 - Accessibility helper
- `radix-ui` 1.4.3 - Radix umbrella package
- `embla-carousel-react` 8.6.0 - Carousel component
- `react-fast-marquee` 1.6.5 - Scrolling marquee/ticker
- `@tsparticles/react` 3.0.0 + `@tsparticles/engine` 3.9.1 + `@tsparticles/slim` 3.9.1 - Particle effects
- `@number-flow/react` 0.5.12 - Animated number transitions
- `react-confetti` 6.4.0 - Confetti celebration effect
- `rough-notation` 0.5.1 - Rough sketch-style annotations
- `react-number-format` 5.4.4 - Formatted number inputs

**Utilities:**
- `dayjs` 1.11.19 - Date formatting and manipulation
- `es-toolkit` 1.44.0 - Modern utility library (lodash alternative)
- `consola` 3.4.2 - Structured logging (used in `src/lib/logger.ts`, `next.config.ts`)
- `tslog` 4.10.2 - TypeScript logger
- `sharp` 0.34.5 - Server-side image processing (OG images, capture scripts)
- `geist` 1.7.0 - Vercel Geist font family
- `@uidotdev/usehooks` 2.4.1 - Utility React hooks
- `react-hotkeys-hook` 5.2.4 - Keyboard shortcut bindings
- `react-use-measure` 2.1.7 - DOM element size measurement
- `react-markdown` 10.1.0 - Simple Markdown renderer
- `vcard-creator` 0.7.2 - vCard file generation
- `poline` 0.13.0 - Color palette/polyline utilities
- `@cloudflare/speedtest` 1.7.0 - Network speed testing widget
- `schema-dts` 1.1.5 - JSON-LD / Schema.org TypeScript types
- `@c15t/nextjs` 1.8.3 - Cookie consent management (GDPR)

## Testing & Quality

**No automated tests detected** - No jest, vitest, playwright, or cypress config/files found.

**Linting & Formatting:**
- Biome.js 2.4.2 - Unified linter and formatter
  - Config: `biome.json` extends `ultracite/core` preset
  - Indentation: tabs, line width: 80 chars (CSS: 120)
  - Quotes: single, semicolons: always
  - Auto-sorts Tailwind classes in `className`, `classList`, `clsx`, `cva`, `cn`
  - Pre-commit: `lint-staged` 16.2.7 runs `biome check --write --unsafe`

**Type Checking:**
- TypeScript 5.9.3 strict mode
- Config: `tsconfig.json` with strictNullChecks, noEmit
- Command: `pnpm types` (runs `tsc --noEmit --pretty`)

**Additional:**
- `prettier` 3.8.1 - Available as fallback formatter

## Build & Dev Tools

**Build System:**
- Next.js 16.1.6 with Turbopack (default for `next dev`)
- `tsup` 8.5.1 - TypeScript bundler for registry component distribution
- `tsx` 4.21.0 - Run TypeScript scripts directly (registry build scripts)
- `tsconfig.scripts.json` - Separate TS config for `src/scripts/`

**Registry Build:**
- `src/scripts/build-registry.mts` - Generates `src/__registry__/registry.autogenerated.json`
- `shadcn build` - Builds distributable registry from generated JSON
- Command: `pnpm registry:build`

**Capture Pipeline:**
- `puppeteer-core` 24.37.3 - Headless Chrome for component screenshots
- `@skyra/gifenc` 1.0.1 - GIF encoding
- `pngjs` 7.0.0 - PNG image processing
- Scripts: `src/scripts/capture.ts`, `src/scripts/capture-components.ts`
- Separate dev server at port 1409 with `ENV_TYPE=capture`

**Dev Utilities:**
- `lint-staged` 16.2.7 - Pre-commit hook linting
- `rimraf` 6.1.3 - Cross-platform file deletion
- `taze` 19.9.2 - Dependency update checker (`npx taze`)
- `colorette` 2.0.20 - Terminal color output for scripts

## Configuration

**Environment:**
- Validated at Next.js startup via Zod schema in `next.config.ts`
- Required: `GITHUB_API_TOKEN`
- Optional: `GITHUB_USERNAME`, `GITHUB_REPO_NAME`, `TURBO_TOKEN`, `TURBO_TEAM`, `BLOB_READ_WRITE_TOKEN`, `API_TOKEN`, `RESEND_API_KEY`
- Local dev: `.env.local` (not committed)
- `ENV_TYPE=capture` for screenshot capture mode

**Build Config Files:**
- `next.config.ts` - Image optimization, security headers, URL redirects/rewrites
- `tsconfig.json` - Strict TypeScript, `@/*` path alias → `src/*`
- `tsconfig.scripts.json` - TypeScript config for build scripts
- `biome.json` - Linting/formatting (extends `ultracite/core`)
- `postcss.config.mjs` - PostCSS with `@tailwindcss/postcss`
- `.nvmrc` - Node v25.6.0

**Security Headers (set in `next.config.ts`):**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Image Configuration:**
- Remote patterns: `avatars.githubusercontent.com`, `cuzeacflorin.fr`
- Formats: AVIF, WebP
- Cache TTL: 30 days
- SVG allowed with sandboxed CSP

## Platform Requirements

**Development:**
- Node.js v25.6.0 (from `.nvmrc`)
- pnpm v10.29.3 as package manager
- `GITHUB_API_TOKEN` env var required (build fails without it)
- `.env.local` with required variables

**Production:**
- Deployment target: Vercel (inferred from `@vercel/*` packages, `TURBO_TEAM`/`TURBO_TOKEN`)
- Image formats: AVIF and WebP served automatically
- Environment variables required at deploy time

---

*Stack analysis: 2026-02-17*
