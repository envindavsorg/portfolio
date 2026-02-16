# Technology Stack

**Analysis Date:** 2026-02-16

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase with strict type checking enabled
- JavaScript (JSX/TSX) - React components and scripts

**Secondary:**
- Markdown/MDX - Blog content and documentation
- CSS - Styling via Tailwind CSS directives

## Runtime

**Environment:**
- Node.js v25.6.0 (specified in `.nvmrc`)
- Compatible with v20 or v22+ as noted in CLAUDE.md

**Package Manager:**
- pnpm v10.29.3
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js 16.1.6 - App Router with Turbopack support
  - Runs on port 1408 for development
  - Transpiles `next-mdx-remote` package
- React 19.2.4 - UI rendering with latest features
- React DOM 19.2.4 - DOM rendering companion

**Styling:**
- Tailwind CSS v4 - PostCSS-based (via `@tailwindcss/postcss`)
- Tailwind Typography v0.5.19 - Rich text styling for blog/MDX
- `@tailwindcss/oxide` - Rust-based CSS engine (trusted dependency)

**UI Components & Libraries:**
- shadcn/ui - Reusable component registry at `src/registry/`
- Radix UI v1.4.3 - Headless component primitives
- `@radix-ui/react-checkbox` v1.3.3
- `@radix-ui/react-icons` v1.3.2
- `@radix-ui/react-popover` v1.1.15
- `@radix-ui/react-select` v2.2.6
- `@radix-ui/react-slot` v1.2.4
- `@radix-ui/react-visually-hidden` v1.2.4

**Content & MDX:**
- `next-mdx-remote` v5.0.0 - Remote MDX rendering
- `remark` v15.0.1 - Markdown AST processor
- `remark-gfm` v4.0.1 - GitHub Flavored Markdown support
- `remark-mdx` v3.1.1 - MDX in remark
- `rehype-raw` v7.0.0 - Parse HTML in markdown
- `rehype-slug` v6.0.0 - Add slugs to headings
- `rehype-pretty-code` v0.14.1 - Syntax highlighting
- `rehype-external-links` v3.0.0 - Rewrite external links
- `shiki` 3.22.0 - Syntax highlighter engine

**Animation & Interaction:**
- `motion` v12.34.0 - Framer Motion for animations
- `react-confetti` v6.4.0 - Celebration animation
- `react-fast-marquee` v1.6.5 - Scrolling marquee component
- `rough-notation` v0.5.1 - Rough hand-drawn annotations
- `embla-carousel-react` v8.6.0 - Carousel component

**Forms & Validation:**
- `react-hook-form` v7.71.1 - React form library
- `@hookform/resolvers` v5.2.2 - Form validation adapters
- `zod` v4.3.6 - TypeScript-first schema validation
- `react-number-format` v5.4.4 - Number input formatting

**State Management:**
- `jotai` v2.17.1 - Primitive atom-based state
- `zustand` (mentioned in keywords) - Lightweight store option

**UI Utilities:**
- `class-variance-authority` v0.7.1 - CVA for component variants
- `clsx` v2.1.1 - Conditional class names
- `tailwind-merge` v3.4.0 - Merge Tailwind CSS classes
- `cmdk` v1.1.1 - Command menu component
- `sonner` v2.0.7 - Toast notifications
- `vaul` v1.1.2 - Drawer component
- `embla-carousel-react` v8.6.0 - Carousel

**Particle Effects:**
- `@tsparticles/engine` v3.9.1 - Particle engine (trusted dependency)
- `@tsparticles/react` v3.0.0 - React integration
- `@tsparticles/slim` v3.9.1 - Slim bundle

**Icons & Assets:**
- `@phosphor-icons/react` v2.1.10 - Phosphor icon set
- Flag icons - Included in `/public/assets/`

**Other Utilities:**
- `dayjs` v1.11.19 - Date manipulation
- `es-toolkit` v1.44.0 - ES utility collection
- `consola` v3.4.2 - Logging utility
- `tslog` v4.10.2 - Structured logging
- `schema-dts` v1.1.5 - Schema.org type definitions
- `poline` v0.13.0 - Polyline simplification
- `react-use-measure` v2.1.7 - Measure DOM elements
- `react-hotkeys-hook` v5.2.4 - Keyboard shortcuts
- `@uidotdev/usehooks` v2.4.1 - Custom React hooks
- `@number-flow/react` v0.5.11 - Animated number display
- `vcard-creator` v0.7.2 - vCard generation
- `react-markdown` v10.1.0 - Markdown renderer
- `gray-matter` v4.0.3 - YAML frontmatter parsing
- `fumadocs-core` v16.5.2 - Documentation utilities

## Testing & Quality

**Linting & Formatting:**
- Biome.js v2.3.14 - Unified linter and formatter
  - Config: `biome.json` extends `ultracite` config
  - Formatter: Tabs for indentation, 80-char line width, single quotes, always semicolons
  - Linter: ESM-based rules with custom overrides

**Type Checking:**
- TypeScript 5.9.3 - Strict mode with `noEmit` option
- Config: `tsconfig.json` with `@/*` path alias

**Utilities:**
- `prettier` v3.8.1 - Fallback formatter
- `eslint` - Not directly used (Biome replaces it)

## Build & Dev Tools

**Build System:**
- Next.js 16.1.6 with Turbopack
- `tsup` v8.5.1 - TypeScript bundler for libraries
- `tsx` v4.21.0 - TypeScript executor (used for scripts)

**Development Tools:**
- `lint-staged` v16.2.7 - Run linters on staged files
- `rimraf` v6.1.2 - Cross-platform rm -rf
- `taze` v19.9.2 - Check dependency updates
- `shadcn` v3.8.4 - Component registry CLI
- `unist-builder` v4.0.0 - AST builder
- `unist-util-visit` v5.1.0 - AST visitor
- `strip-indent` v4.1.1 - Remove indentation
- `pngjs` v7.0.0 - PNG image processing
- `puppeteer-core` v24.37.2 - Headless browser (for screenshots)
- `@skyra/gifenc` v1.0.1 - GIF encoder for captures
- `sharp` v0.34.5 - Image processing library
- `colorette` v2.0.20 - Terminal colors
- `depcheck` - Dependency checker (via `pnpm deps`)

## Key Dependencies

**Critical for Integration:**
- `octokit` v5.0.5 - GitHub GraphQL API client
  - Configured in `src/lib/octokit.ts`
  - Requires `GITHUB_API_TOKEN` environment variable
- `resend` v6.9.1 - Transactional email service
  - Requires `RESEND_API_KEY` environment variable
  - Used in `src/app/api/send/route.ts`
- `@vercel/blob` v2.2.0 - File storage
  - Requires `BLOB_READ_WRITE_TOKEN` environment variable
  - Used in `src/actions/linkedin/followers.action.ts`
- `@vercel/analytics` v1.6.1 - Analytics tracking
  - Dynamically imported in `src/providers/analytics/Analytics.tsx`
- `@vercel/speed-insights` v1.3.1 - Performance monitoring
  - Dynamically imported in `src/providers/analytics/Analytics.tsx`

**Performance & Monitoring:**
- `@bprogress/next` v3.2.12 - Page progress bar
- `@c15t/nextjs` v1.8.3 - Consent manager (GDPR/tracking)
- `@cloudflare/speedtest` v1.7.0 - Speed test engine
- `@react-email/components` v1.0.7 - Email templating
- `@react-email/render` v2.0.4 - Email rendering

## Configuration

**Environment:**
- Configuration via `.env.local` (present, not committed)
- Environment validation in `next.config.ts` using Zod schema
- Required variables:
  - `GITHUB_API_TOKEN` - GitHub API authentication
  - `GITHUB_USERNAME` - GitHub username for data queries
  - `GITHUB_REPO_NAME` - Repository name for contribution data
- Optional variables:
  - `RESEND_API_KEY` - Email service
  - `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage
  - `API_TOKEN` - Generic API token
  - `TURBO_TOKEN` - Turbo Cache authentication
  - `TURBO_TEAM` - Turbo Cache team
  - `NEXT_PUBLIC_APP_URL` - Public app URL
  - `ENV_TYPE` - Environment type (e.g., "capture" for screenshots)

**Build:**
- `next.config.ts` - Next.js configuration
  - Image remote patterns: `avatars.githubusercontent.com`, `cuzeacflorin.fr`
  - URL rewrites for blog/components routes
  - Security headers (X-Frame-Options, X-Content-Type-Options, CSP)
- `tsconfig.json` - TypeScript strict mode, ES2017 target
- `postcss.config.mjs` - PostCSS with Tailwind CSS v4
- `tsconfig.scripts.json` - Separate config for build scripts

## Platform Requirements

**Development:**
- Node.js v25.6.0 (or v20/v22+)
- pnpm v10.29.3 or compatible
- Minimum 2GB RAM for Turbopack compilation

**Production:**
- Deployment target: Vercel (inferred from Vercel integrations)
- Edge runtime support in select routes (e.g., `/api/health`)
- Environment variables required at deployment time

**Browser Support:**
- Modern browsers (ES2017 target)
- CSS Grid, Flexbox, CSS Custom Properties
- CSS Scroll Snap for carousels

---

*Stack analysis: 2026-02-16*
