# Architecture

**Analysis Date:** 2026-02-16

## Pattern Overview

**Overall:** Feature-Based Layered Architecture with Server Components and Client Interactivity

**Key Characteristics:**
- Feature-first organization by domain (homepage sections, navigation, writings, LLM routes)
- Next.js 15 App Router with Server and Client Components mixed strategically
- Server Actions for data fetching (GitHub API, blog posts)
- Jotai for client-side state management (theme, config)
- Dynamic imports for performance optimization
- Content-driven with MDX/Markdown processing pipeline

## Layers

**Presentation Layer (Components & Features):**
- Purpose: UI rendering and user interaction
- Location: `src/components/`, `src/features/`
- Contains: React components (TSX), UI elements (buttons, icons, animations), feature-specific layouts
- Depends on: Lib utilities, hooks, providers
- Used by: Pages, layouts

**Feature Layer (Domain Organization):**
- Purpose: Encapsulate feature-specific code (homepage sections, navigation, blog, LLMs)
- Location: `src/features/(homepage)/`, `src/features/(navigation)/`, `src/features/(writings)/`
- Contains: Feature components, content files (TS), effect components (animations)
- Depends on: Components, utilities, server actions
- Used by: App pages and layouts

**Server Actions & Data Fetching:**
- Purpose: Server-side logic and external API integration
- Location: `src/actions/github/`, `src/actions/blog/`, `src/actions/linkedin/`
- Contains: Server Functions marked with `'use server'`, caching logic
- Depends on: Octokit client, blog utilities, Next.js caching
- Used by: Client components via async calls

**Routing Layer (App Router):**
- Purpose: Define application routes and page rendering
- Location: `src/app/`, `src/app/(content)/`, `src/app/(llms)/`, `src/app/(other)/`
- Contains: Page components, layouts, API routes, metadata generation
- Depends on: Features, server actions, components
- Used by: Next.js runtime for serving pages

**Library & Utilities Layer:**
- Purpose: Reusable functions and integrations
- Location: `src/lib/`, `src/hooks/`, `src/utils/`
- Contains: GitHub integration, blog processing, logging, UI utilities, custom hooks
- Depends on: External packages (octokit, tslog, dayjs, gray-matter)
- Used by: All higher layers

**Provider & State Layer:**
- Purpose: Application-wide configuration and state management
- Location: `src/providers/`
- Contains: Theme provider, progress provider, analytics, Jotai Providers
- Depends on: Third-party providers (Next.js, Jotai)
- Used by: Root layout via Providers wrapper

**Configuration & Data Layer:**
- Purpose: Static configuration and type definitions
- Location: `src/content/data/`, `src/schemas/`, `src/types/`
- Contains: Global data (user info, social links), TypeScript interfaces, validation schemas
- Depends on: None
- Used by: All layers for consistent data structure

## Data Flow

**Page Load Flow (Server → Client):**

1. Root layout (`src/app/layout.tsx`) initializes Providers (theme, analytics, state)
2. Page layout (`src/app/(content)/layout.tsx`) renders NavBar and Particles
3. Feature components render, triggering Server Actions if needed
4. Server Actions fetch GitHub data (cached via `unstable_cache`)
5. Data transforms through lib functions (`fillHoles`, `groupByWeeks`, `contributionLevelToNumber`)
6. Client components hydrate with state from Jotai atoms
7. Animations trigger (Cover carousel, TextAnimate, Particles)

**Blog/Article Load Flow:**

1. Route handler (`src/app/(content)/(writings)/blog/[slug]/page.tsx`) calls `getPostBySlug`
2. `getPostBySlug` reads MDX from `src/content/articles/[slug].mdx`
3. `readMDXFile` parses frontmatter via gray-matter
4. Content passes through MDX processing pipeline:
   - `rehype-component.ts` - injects custom components
   - `rehype-npm-command.ts` - formats package manager commands
   - `remark-component.ts` - processes Remark plugins
5. Metadata extracted and returned to component
6. Page renders with LLM action buttons (ViewOptions, LLMCopyButton)

**State Management Flow:**

1. User sets theme via FaviconSwitcher or ThemeProvider
2. Theme stored in Jotai atom (`useConfig` hook)
3. localStorage persists state via `atomWithStorage`
4. Theme changes trigger favicon and meta-color updates
5. Dark mode script in root layout runs before hydration to prevent flashing

**GitHub Integration Flow:**

1. Server Action `getGitHubData` runs on server
2. Octokit sends GraphQL query (DATA_QUERY from `src/queries/github/data.query.ts`)
3. Response cached for 3600s via `unstable_cache` with tag 'github-user-data'
4. Contribution data flattened and transformed
5. Component receives contribution calendar and commit graph data

## Key Abstractions

**Server Action Pattern:**
- Purpose: Encapsulate server-side logic callable from client components
- Examples: `src/actions/github/data.action.ts`, `src/actions/blog/post.action.tsx`, `src/actions/linkedin/followers.action.ts`
- Pattern: Functions marked with `'use server'`, use `unstable_cache` for revalidation, return typed data structures

**Feature Module:**
- Purpose: Self-contained domain logic with components and utilities
- Examples: `src/features/(homepage)/1_cover/`, `src/features/(navigation)/navbar/`
- Pattern: Directory per feature containing feature component + subcomponents + content files + effects

**MDX Content Pipeline:**
- Purpose: Transform Markdown content into interactive React components
- Examples: Blog posts at `src/content/articles/`, processed via `src/lib/rehype-*.ts`
- Pattern: Files define metadata (frontmatter) + content; rehype plugins inject interactive elements

**Custom Hook for State:**
- Purpose: Encapsulate state logic with Jotai
- Example: `src/hooks/use-config.ts` manages package manager and installation type preferences
- Pattern: `useAtom` wrapping `atomWithStorage` for localStorage persistence

**Carousel Component System:**
- Purpose: Reusable carousel with Embla integration
- Examples: Cover carousel at `src/features/(homepage)/1_cover/Cover.tsx`, carousel controls at `src/components/carousel/`
- Pattern: Carousel wrapper with content and navigation items; API state management

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Initial page load
- Responsibilities: Set up global styles, fonts, JSON-LD schema, Providers, dark mode script, ConsentManager

**Content Layout:**
- Location: `src/app/(content)/layout.tsx`
- Triggers: Routes under (content) group
- Responsibilities: Render NavBar, particles animation, main content wrapper

**Homepage:**
- Location: `src/app/(content)/(homepage)/page.tsx`
- Triggers: Route to `/`
- Responsibilities: Compose feature sections (Cover, Header, Overview, CV, etc.), generate metadata, set up schema

**Blog Page:**
- Location: `src/app/(content)/(writings)/blog/page.tsx`
- Triggers: Route to `/blog`
- Responsibilities: List all blog posts, filter by category, generate metadata

**Blog Post Dynamic Page:**
- Location: `src/app/(content)/(writings)/blog/[slug]/page.tsx`
- Triggers: Route to `/blog/[slug]`
- Responsibilities: Fetch post by slug, render MDX, inject LLM action buttons, generate OG image

**API Routes:**
- Health Check: `src/app/api/health/route.ts` - Service availability
- RSS Feed: `src/app/api/rss/route.ts` - Blog feed generation
- OG Image: `src/app/api/og/route.tsx` - Dynamic Open Graph image generation
- VCard: `src/app/api/vcard/route.ts` - Contact information export
- Email: `src/app/api/send/route.ts` - Contact form submission

**LLM Routes:**
- Location: `src/app/(llms)/(content)/` with dynamic routes for about.md, experience.md, etc.
- Triggers: LLM-specific endpoints for structured content
- Responsibilities: Serve profile data in markdown format for LLM context

## Error Handling

**Strategy:** Defensive error handling with try-catch, fallbacks, and user-friendly messages via toast notifications

**Patterns:**

- Server Actions wrap API calls in try-catch, return typed responses with error states
- Client components use `useOptimistic` with state transitions for loading/error states (e.g., `LLMCopyButton`)
- Clipboard API has fallback warning via logger when not supported
- Sound manager wraps audio playback with try-catch
- Copy-to-clipboard includes error toast: `toast.error()` on failure, success on completion
- Not found handler renders custom 404 page with navigation back to home (`src/app/not-found.tsx`)
- Graph requests log failures via `logger.error()` with context

## Cross-Cutting Concerns

**Logging:** Logger singleton in `src/lib/logger.ts` using tslog library. Environment-aware minLevel (production: 3, dev: 0). Used for errors, warnings, and debugging.

**Validation:** Zod schemas for environment variables (next.config.ts), email forms (src/schemas/email.schema.ts). Gray-matter for frontmatter validation in MDX files.

**Authentication:** None required for public portfolio. GitHub token stored as environment variable for API access only.

**Caching:** Next.js `unstable_cache` for GitHub data queries (3600s revalidate). Static generation for blog posts at build time. Image optimization with multiple formats and device sizes.

**Styling:** Tailwind CSS v4 with custom utilities via `cn()` helper. Theme variables managed via CSS custom properties. Dark mode toggle persists in Jotai atom and localStorage.

**Performance:** Dynamic imports for heavy components (Toaster, Analytics, context menus). Lazy loading of icons (lazy import within ViewOptions). Image optimization with next/image and multiple formats.

---

*Architecture analysis: 2026-02-16*
