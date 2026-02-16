# Codebase Structure

**Analysis Date:** 2026-02-16

## Directory Layout

```
src/
├── app/                          # Next.js App Router
│   ├── (content)/                # Content route group (main site)
│   │   ├── (homepage)/           # Homepage section
│   │   ├── (writings)/           # Blog, components, utils pages
│   │   │   ├── blog/
│   │   │   ├── components/
│   │   │   ├── utils/
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── (llms)/                   # LLM-specific routes
│   │   ├── (content)/            # Markdown content served to LLMs
│   │   │   ├── about.md
│   │   │   ├── experience.md
│   │   │   ├── projects.md
│   │   │   ├── certifications.md
│   │   │   └── blog.mdx/
│   │   └── llms.txt/
│   ├── (other)/                  # Other routes group
│   │   └── og/                   # OG image preview
│   ├── api/                      # API routes
│   │   ├── health/
│   │   ├── rss/
│   │   ├── og/
│   │   ├── send/
│   │   └── vcard/
│   ├── layout.tsx                # Root layout with providers
│   ├── not-found.tsx             # 404 page
│   ├── manifest.ts               # PWA manifest
│   ├── robots.ts                 # robots.txt generation
│   └── sitemap.ts                # sitemap.xml generation
├── features/                     # Feature-based modules (domain logic)
│   ├── (homepage)/               # Homepage feature sections
│   │   ├── 1_cover/              # Cover/greeting carousel
│   │   │   ├── effects/          # Hello, Bonjour, Hola animations
│   │   │   └── Cover.tsx
│   │   ├── 2_header/
│   │   ├── 3_overview/
│   │   ├── 4_cv/
│   │   ├── 5_contact/
│   │   ├── 6_about/
│   │   ├── 7_commits/
│   │   ├── 8_stack/
│   │   ├── 9_articles/
│   │   ├── 10_certifications/
│   │   ├── 11_tools/
│   │   ├── 12_experiences/
│   │   ├── 13_projects/
│   │   └── 14_branding/
│   ├── (navigation)/             # Navigation components
│   │   ├── navbar/
│   │   │   ├── elements/
│   │   │   ├── data.ts
│   │   │   └── NavBar.tsx
│   │   └── footer/
│   └── (writings)/               # Blog/content utilities
│       └── utils/
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── Divider.tsx
│   │   ├── Panel.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── contribution-graph/   # Custom GitHub contribution graph
│   │   └── ... (shadcn components)
│   ├── animations/               # Animation components
│   │   ├── Particles.tsx
│   │   └── Terminal.tsx
│   ├── text/                     # Text animation components
│   │   └── TextAnimate.tsx
│   ├── buttons/                  # Button variants
│   │   ├── Button.tsx
│   │   └── CopyButton.tsx
│   ├── carousel/                 # Carousel components
│   │   ├── Carousel.tsx
│   │   ├── CarouselContent.tsx
│   │   ├── CarouselItem.tsx
│   │   ├── CarouselNext.tsx
│   │   └── CarouselPrevious.tsx
│   ├── icons/                    # Icon components (flag icons, custom icons)
│   │   ├── ArrowLeftIcon.tsx
│   │   ├── CodeIcon.tsx
│   │   ├── GitHubIcon.tsx
│   │   └── ... (40+ icon components)
│   ├── stack/                    # Technology stack icons
│   │   ├── React.tsx
│   │   ├── Next.tsx
│   │   ├── JavaScript.tsx
│   │   └── ... (50+ tech stack icons)
│   ├── markdown/                 # Markdown/MDX rendering
│   │   ├── markdown.tsx
│   │   └── mdx.tsx
│   ├── overlays/                 # Modal/overlay components
│   │   ├── Command.tsx
│   │   ├── Dialog.tsx
│   │   ├── Drawer.tsx
│   │   └── Sonner.tsx
│   ├── manager/                  # Managers/controllers
│   │   ├── ConsentManager.tsx
│   │   └── ConsentManagerClient.tsx
│   └── favicon/
│       └── FaviconSwitcher.tsx
├── lib/                          # Core utilities and integrations
│   ├── octokit.ts                # GitHub API client setup
│   ├── github.ts                 # GitHub helpers (contribution levels, calendar grouping)
│   ├── logger.ts                 # tslog logger instance
│   ├── utils.ts                  # Core utilities (cn, dayjs, copyText, downloadFile)
│   ├── utils.server.ts           # Server-only utilities
│   ├── open-graph.ts             # OG image generation helpers
│   ├── palette.ts                # Color palette utilities
│   ├── registry.ts               # Registry configuration
│   ├── sound-manager.ts          # Audio playback wrapper
│   ├── lorem-ipsum.ts            # Lorem ipsum generator
│   ├── blog/                     # Blog-specific utilities
│   │   ├── posts.ts              # MDX file reading and parsing
│   │   ├── read.ts               # Reading time calculation
│   │   └── llm.ts                # LLM-specific blog logic
│   ├── rehype-*.ts               # MDX processing plugins
│   │   ├── rehype-component.ts   # Custom component injection
│   │   ├── rehype-npm-command.ts # Package manager command blocks
│   │   └── rehype-add-query-params.ts
│   ├── remark-component.ts       # Remark plugin for components
│   └── fonts.ts                  # Custom font configuration
├── actions/                      # Server Actions
│   ├── github/
│   │   ├── data.action.ts        # Fetch GitHub user data and contributions
│   │   └── commit.action.ts      # Fetch commit history
│   ├── blog/
│   │   └── post.action.tsx       # Blog post actions (LLM buttons)
│   └── linkedin/
│       └── followers.action.ts   # LinkedIn follower count
├── providers/                    # Context providers
│   ├── Providers.tsx             # Composed providers wrapper
│   ├── modules/
│   │   ├── ThemeProvider.tsx     # Theme (light/dark mode)
│   │   └── ProgressProvider.tsx  # Page transition progress
│   ├── analytics/
│   │   └── Analytics.tsx         # Analytics tracking (Vercel Analytics)
│   └── utils/
│       └── Compose.tsx           # Higher-order provider composer
├── hooks/                        # Custom React hooks
│   ├── use-config.ts             # Jotai state for package manager prefs
│   ├── use-copy-to-clipboard.ts
│   ├── use-email-form.ts
│   ├── use-browser.ts
│   ├── use-media-query.ts
│   └── use-meta-color.ts
├── queries/                      # GraphQL queries
│   └── github/
│       ├── data.query.ts         # User contributions query
│       └── commit.query.ts       # Commit query
├── content/                      # Content data
│   ├── data/
│   │   ├── global.ts             # User info, social links, keywords
│   │   └── theme.ts              # Theme colors and metadata
│   └── articles/                 # Blog posts (MDX files)
│       ├── my-work-journey.mdx
│       ├── flip-sentences-component.mdx
│       ├── theme-switcher-component.mdx
│       ├── base64-encode-decode.mdx
│       └── internet-speed-test.mdx
├── registry/                     # Custom shadcn registry
│   ├── index.ts
│   ├── registry-components.ts
│   ├── registry-blocks.ts
│   ├── registry-examples.ts
│   ├── registry-hook.ts
│   ├── registry-lib.ts
│   ├── apple-hello-effect/       # Distributable component
│   ├── flip-sentences/           # Distributable component
│   ├── theme-switcher/           # Distributable component
│   └── examples/                 # Example implementations
├── schemas/                      # Validation schemas (Zod)
│   └── email.schema.ts           # Email form validation
├── types/                        # TypeScript type definitions
│   ├── data.d.ts                 # Global interfaces (USER, WORK, SOCIAL, etc.)
│   ├── default.d.ts
│   ├── icons.d.ts
│   └── particles.d.ts
├── styles/                       # Global styles
│   └── globals.css               # Tailwind directives
├── __registry__/                 # Registry configuration
│   └── index.tsx
├── scripts/                      # Build and utility scripts
│   ├── capture.ts                # Screenshot capture
│   └── capture-components.ts
└── fonts/                        # Font files

public/
├── favicons/                     # Light and dark theme favicons
├── images/                       # Static images (avatar, OG, etc.)
└── assets/                       # Audio files (hello, bonjour, hola)
```

## Directory Purposes

**src/app/:** Next.js App Router directory. Uses route groups in parentheses for logical organization without affecting URL structure. Defines pages, layouts, and API routes.

**src/features/:** Feature-first organization. Each numbered feature (1_cover through 14_branding) is a self-contained section with its own components and logic. Enables parallel development and clear ownership.

**src/components/:** Reusable UI components used across features. Organized by type (ui, animations, buttons, icons, etc.). Icons split by category (general, stack/tech).

**src/lib/:** Core utilities and integrations. GitHub integration via Octokit, blog processing pipeline, utilities for common tasks, logger setup, and rehype/remark plugins for MDX.

**src/actions/:** Server Actions marked with `'use server'`. Encapsulate server-side logic (GitHub API calls, blog post fetching, LinkedIn followers). Enable client components to call server functions directly.

**src/providers/:** Context providers for application-wide state. Theme provider for dark/light mode, progress bar provider, analytics tracking, and provider composition utility.

**src/hooks/:** Custom React hooks. `use-config` uses Jotai atoms for persistent state. Others handle clipboard, email forms, media queries, browser detection, and theme color.

**src/content/:** Content and data. Global metadata, theme colors, and blog articles in MDX format with YAML frontmatter.

**src/registry/:** Custom shadcn registry for distributing reusable components to other projects via npm/pnpm.

**src/schemas/:** Zod validation schemas for runtime type checking of forms and data.

**src/types/:** TypeScript global interfaces and type definitions.

**src/styles/:** Global CSS with Tailwind directives.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout, sets up Providers, global styles, dark mode script
- `src/app/(content)/layout.tsx`: Content layout with NavBar and Particles
- `src/app/(content)/(homepage)/page.tsx`: Homepage with all feature sections
- `src/app/(content)/(writings)/blog/page.tsx`: Blog listing page
- `src/app/(content)/(writings)/blog/[slug]/page.tsx`: Individual blog post

**Configuration:**
- `src/content/data/global.ts`: User info, social links, work history, CV
- `src/content/data/theme.ts`: Theme colors and metadata
- `src/features/(navigation)/navbar/data.ts`: Navigation menu items and config

**Core Logic:**
- `src/lib/github.ts`: Contribution calendar processing (groupByWeeks, fillHoles, etc.)
- `src/lib/blog/posts.ts`: MDX file reading, frontmatter parsing, slug resolution
- `src/actions/github/data.action.ts`: Cached GitHub API query for contributions
- `src/lib/octokit.ts`: GitHub Octokit client initialization
- `src/queries/github/data.query.ts`: GraphQL query for user contributions

**Testing/Building:**
- Registry build: `src/registry/index.ts` exports components for distribution
- Capture scripts: `src/scripts/capture.ts` for component screenshots

## Naming Conventions

**Files:**
- Components: PascalCase (`Button.tsx`, `TextAnimate.tsx`)
- Utilities: camelCase (`utils.ts`, `logger.ts`, `github.ts`)
- Server Actions: camelCase with `.action.ts` suffix (`data.action.ts`, `post.action.tsx`)
- Hooks: camelCase with `use-` prefix (`use-config.ts`, `use-media-query.ts`)
- Queries: camelCase with `.query.ts` suffix (`data.query.ts`)
- Schemas: camelCase with `.schema.ts` suffix (`email.schema.ts`)
- Type definitions: lowercase with `.d.ts` suffix (`data.d.ts`, `icons.d.ts`)

**Directories:**
- Feature folders: numbered prefix for ordering (`1_cover`, `2_header`, `3_overview`)
- Route groups: parentheses `(content)`, `(homepage)`, `(llms)`, `(navigation)`
- Functional folders: plural when containing multiple files (`components/`, `hooks/`, `actions/`)

**TypeScript:**
- Interfaces: PascalCase, global interfaces in `types/data.d.ts` (USER, WORK, SOCIAL, etc.)
- Types: camelCase for type aliases
- Enums: Not used; string literals preferred

**CSS Classes:**
- Tailwind utility classes, use `cn()` helper from `src/lib/utils.ts` for conditional merging
- No CSS modules; all styling via Tailwind

## Where to Add New Code

**New Feature Section (on Homepage):**
- Create directory: `src/features/(homepage)/[N]_[name]/`
- Main component: `src/features/(homepage)/[N]_[name]/[Name].tsx` (exported as named export)
- Subcomponents: `src/features/(homepage)/[N]_[name]/components/` or inline
- Data file: `src/features/(homepage)/[N]_[name]/content.ts` if static data needed
- Import in: `src/app/(content)/(homepage)/page.tsx`

**New Reusable Component:**
- Location: `src/components/[category]/[ComponentName].tsx`
- Export as named export with full type annotations
- Add to registry if intended for distribution: `src/registry/registry-components.ts`

**New Server Action:**
- Location: `src/actions/[domain]/[name].action.ts` (or `.action.tsx` for Client Components)
- Mark with `'use server'` directive at top
- Use `unstable_cache` wrapper for queries that should be cached
- Define return type explicitly for type safety
- Import in component and call directly (no need for API route)

**New Hook:**
- Location: `src/hooks/use-[name].ts`
- Export as default export
- Use existing patterns: Jotai atoms for persistent state, standard React hooks for temporary state

**New Utility Function:**
- Location: `src/lib/[domain]/[name].ts` (or `src/lib/[name].ts` if general)
- Use explicit type annotations for parameters and return
- Add to `src/lib/utils.ts` if universally useful (e.g., `cn`, `dayjs`)

**New Blog Post:**
- Location: `src/content/articles/[slug].mdx`
- Include YAML frontmatter with: title, description, createdAt, category (article|components|utils)
- Use `_` for spaces in slug names (e.g., `my-post-title.mdx`)
- Markdown with injected components via rehype plugins

**New API Route:**
- Location: `src/app/api/[route]/route.ts` (or `route.tsx` if returning JSX for OG)
- Export HTTP method functions: `export async function GET()`, `POST()`, etc.
- Use `NextRequest` and `NextResponse` types
- Add caching headers as needed

## Special Directories

**src/__registry__:**
- Purpose: Auto-generated registry index for shadcn/ui
- Generated: Yes (by `pnpm registry:build`)
- Committed: No (in .gitignore typically, but included here)

**src/app/(llms)/(content):**
- Purpose: Serve profile data to LLMs in markdown format
- Route format: `/about.md`, `/experience.md`, `/blog.mdx/[slug]`
- Used by: LLM context when user shares links

**public/favicons/, public/images/, public/assets/:**
- Purpose: Static assets (favicons for theme, images, audio)
- Committed: Yes
- Accessed via: Absolute paths starting with `/`

**node_modules/, .next/:**
- Purpose: Build artifacts and dependencies
- Generated: Yes (by `pnpm i` and `pnpm build`)
- Committed: No

---

*Structure analysis: 2026-02-16*
