# Architecture

**Analysis Date:** 2026-02-17

## Pattern Overview

**Overall:** Feature-based Next.js App Router with Server Components, Server Actions, and static MDX content

**Key Characteristics:**
- Route groups (`(content)`, `(llms)`, `(other)`) organize pages by concern without affecting URL structure
- Feature modules under `src/features/` mirror route group naming (`(homepage)`, `(navigation)`, `(writings)`)
- Static content (portfolio data, MDX articles) lives in `src/content/` and is consumed at build/request time by Server Components
- External data (GitHub API) is fetched in Server Actions with `unstable_cache` for 1-hour ISR
- Client Components (`'use client'`) are used only where interactivity is required; all data-fetching components are async Server Components
- Dynamic imports (`next/dynamic`, React `lazy`) for heavy client components deferred from initial bundle

## Layers

**Route Layer:**
- Purpose: URL mapping, metadata generation, JSON-LD structured data injection
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `route.ts` API handlers, `sitemap.ts`, `robots.ts`, `manifest.ts`
- Depends on: Feature layer, lib layer, content layer
- Used by: Next.js router

**Feature Layer:**
- Purpose: Domain-specific UI sections; each feature is a self-contained section of a page
- Location: `src/features/`
- Contains: Named export React components, co-located `content.ts` static data files, sub-components
- Sub-groups: `src/features/(homepage)/` (14 sections), `src/features/(navigation)/` (navbar, footer), `src/features/(writings)/` (blog UI components)
- Depends on: Component layer, lib layer, actions layer, content layer
- Used by: Route layer (imported directly into `page.tsx`)

**Actions Layer:**
- Purpose: Server-side data fetching with caching, marked `'use server'`
- Location: `src/actions/`
- Contains: `src/actions/github/data.action.ts`, `src/actions/github/commit.action.ts`, `src/actions/github/followers.action.ts`, `src/actions/linkedin/`, `src/actions/blog/post.action.tsx`
- Depends on: `src/lib/octokit.ts`, `src/queries/`, `src/lib/github.ts`
- Used by: Feature layer Server Components

**Component Layer:**
- Purpose: Reusable, generic UI primitives and compositions
- Location: `src/components/`
- Contains: shadcn/ui components in `src/components/ui/`, buttons, icons, animations, markdown renderer (`src/components/markdown/mdx.tsx`), overlays, carousel
- Depends on: `src/lib/utils.ts` for `cn()`, Tailwind CSS v4
- Used by: Feature layer, route layer

**Content Layer:**
- Purpose: Static site data and MDX blog articles
- Location: `src/content/`
- Contains: `src/content/data/global.ts` (user/work/social data as `GLOBAL_DATA`), `src/content/articles/` (MDX files)
- Depends on: Nothing (pure data)
- Used by: Feature layer, route layer, lib layer (blog post parsing)

**Lib Layer:**
- Purpose: Utilities, external client wrappers, MDX processing pipeline
- Location: `src/lib/`
- Contains: `octokit.ts` (GitHub GraphQL client), `open-graph.ts`, `logger.ts`, `utils.ts`, `utils.server.ts`, `blog/posts.ts`, `blog/read.ts`, `blog/llm.ts`, MDX plugins (`rehype-component.ts`, `rehype-npm-command.ts`, `rehype-add-query-params.ts`, `remark-code-import.js`, `remark-component.ts`)
- Depends on: External packages (octokit, tslog, dayjs, gray-matter)
- Used by: Actions layer, feature layer, route layer

**Queries Layer:**
- Purpose: GraphQL query strings for GitHub API
- Location: `src/queries/github/`
- Contains: `data.query.ts`, `commit.query.ts`
- Depends on: Nothing
- Used by: Actions layer

**Providers Layer:**
- Purpose: React context and global state setup for client-side concerns
- Location: `src/providers/`
- Contains: `Providers.tsx` (root composition via `Compose` utility), `modules/ThemeProvider.tsx`, `modules/ProgressProvider.tsx`, `analytics/Analytics.tsx`, `utils/Compose.tsx`
- Depends on: Jotai, next-themes, `@vercel/analytics`, `@vercel/speed-insights`
- Used by: Root layout `src/app/layout.tsx`

**Schemas Layer:**
- Purpose: Runtime validation for API inputs
- Location: `src/schemas/`
- Contains: `email.schema.ts` (Zod schema for CV send endpoint)
- Used by: `src/app/api/send/route.ts`

## Data Flow

**GitHub Stats (Commits, Stars, Followers):**

1. Server Component (e.g., `src/features/(homepage)/commits/Commits.tsx`) calls `await getGitHubData()`
2. `getGitHubData` in `src/actions/github/data.action.ts` is wrapped in `unstable_cache` (1h TTL, tag `github-user-data`)
3. Cache miss triggers `octokit` GraphQL query (`src/queries/github/data.query.ts`) against GitHub API using `GITHUB_API_TOKEN`
4. Transformed data returned to Server Component and rendered directly as HTML

**Blog Post Rendering:**

1. Route `src/app/(content)/(writings)/blog/[slug]/page.tsx` calls `getPostBySlug(slug)` from `src/lib/blog/posts.ts`
2. `src/lib/blog/posts.ts` reads `.mdx` files from `src/content/articles/` using Node.js `fs` at request/build time
3. `gray-matter` parses frontmatter; `readingTime` from `src/lib/blog/read.ts` calculates reading stats
4. MDX content rendered by `src/components/markdown/mdx.tsx` using Fumadocs core with Shiki syntax highlighting
5. `generateStaticParams` pre-builds all blog post routes at build time via `getAllPosts()`

**CV Email Send:**

1. User triggers contact form → POST to `src/app/api/send/route.ts`
2. Route validates body with `src/schemas/email.schema` (Zod)
3. Reads `public/documents/resume.pdf` from filesystem
4. Sends email with PDF attachment via Resend SDK (`RESEND_API_KEY`)

**OG Image Generation:**

1. Any page calls `openGraphImage()` from `src/lib/open-graph.ts` in `generateMetadata`
2. Constructs a URL pointing to `/api/og` with type, title, and description params
3. `src/app/api/og/route.tsx` uses `next/og` `ImageResponse` with cached Geist fonts from `src/assets/fonts/`

**State Management:**
- Jotai atoms for client-side UI state (theme, config preferences)
- `next-themes` via `src/providers/modules/ThemeProvider.tsx` for system/dark/light theme
- No server state management library; server data fetched per-request or cached via `unstable_cache`
- Dark mode inline script in `src/app/layout.tsx` runs before hydration to prevent FOUC

## Key Abstractions

**`GLOBAL_DATA` (Content Store):**
- Purpose: Single source of truth for all personal/professional portfolio data
- Examples: `src/content/data/global.ts`
- Pattern: Plain TypeScript object with `satisfies` type guards exported as default; imported directly by any component needing user data

**`unstable_cache` Wrapped Server Actions:**
- Purpose: ISR-style caching for external API calls with cache tag invalidation
- Examples: `src/actions/github/data.action.ts`, `src/actions/github/commit.action.ts`
- Pattern: Inner `fetch*` async function wrapped with `unstable_cache(fn, [tag], { revalidate: 3600, tags: [tag] })`

**Async Server Component Feature Section:**
- Purpose: Each homepage section fetches its own data or uses co-located `content.ts` static data
- Examples: `src/features/(homepage)/commits/Commits.tsx` (async, fetches GitHub), `src/features/(homepage)/projects/Projects.tsx` (sync, uses `content.ts`)
- Pattern: `export const FeatureName = async () => { const data = await getAction(); return <Panel>...</Panel>; }`

**`Panel` Composition:**
- Purpose: Structural wrapper for all homepage sections providing consistent layout and border styling
- Examples: `src/components/Panel.tsx`
- Pattern: Composed via `Panel`, `PanelHeader`, `PanelTitle`, `PanelContent` named sub-components

**`Compose` Provider Utility:**
- Purpose: Reduces React context provider nesting using `reduceRight`
- Examples: `src/providers/utils/Compose.tsx`, used in `src/providers/Providers.tsx`
- Pattern: `const AppProviders = Compose(JotaiProvider, ThemeProvider, ProgressProvider)` produces single nested component

**LLM-Optimized Routes:**
- Purpose: Machine-readable content for AI assistants following the `llms.txt` convention
- Examples: `src/app/(llms)/llms.txt/route.ts`, `src/app/(llms)/(content)/` with `.md`/`.mdx` files
- Pattern: MDX/Markdown files served as raw text via dedicated route handlers; blog posts served at `[slug].mdx` URL

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All page requests
- Responsibilities: HTML shell, Geist font CSS variables, JSON-LD WebSite/Person schema, dark mode FOUC prevention script, `<Providers>` wrapping, `ConsentManager`, `TooltipProvider`

**Content Layout:**
- Location: `src/app/(content)/layout.tsx`
- Triggers: All content page requests (homepage, blog, components, utils)
- Responsibilities: `NavBar`, `Footer`, background `Particles` animation

**Homepage:**
- Location: `src/app/(content)/(homepage)/page.tsx`
- Triggers: GET `/`
- Responsibilities: Imports and sequences 14 homepage feature sections (Cover, Header, Overview, Contact, Cv, About, Commits, TechStack, Articles, Certifications, Tools, Experiences, Projects, Branding), generates metadata, injects JSON-LD ProfilePage schema

**Blog Index:**
- Location: `src/app/(content)/(writings)/blog/page.tsx`
- Triggers: GET `/blog`
- Responsibilities: Reads and sorts all posts via `getPostsByCategory('article')`, tag-based filtering via URL `?tag=` search param

**Blog Post:**
- Location: `src/app/(content)/(writings)/blog/[slug]/page.tsx`
- Triggers: GET `/blog/:slug`
- Responsibilities: Static param generation, MDX rendering, table of contents via Fumadocs, keyboard navigation, LLM copy/share actions

**API Routes:**
- `src/app/api/og/route.tsx` — Dynamic OG image generation via `next/og`
- `src/app/api/send/route.ts` — CV email sending via Resend SDK
- `src/app/api/rss/route.ts` — RSS feed generation from blog posts
- `src/app/api/vcard/route.ts` — vCard contact download
- `src/app/api/health/route.ts` — Health check endpoint

## Error Handling

**Strategy:** Fail-safe with graceful degradation; errors logged server-side, never exposed to end users

**Patterns:**
- GitHub API Server Actions catch errors and return empty/default data: `src/actions/github/commit.action.ts` returns `{}` on failure
- API routes return structured `Response.json({ error: '...' }, { status: 4xx/5xx })` on validation or runtime failure
- OG image route (`src/app/api/og/route.tsx`) falls back to a generic gradient image if generation throws
- Next.js `notFound()` called in page components when MDX post slug is missing
- `src/lib/logger.ts` uses `tslog` — all log levels in development, warn/error only in production (`minLevel: 3`)
- Client-side clipboard errors caught in `src/actions/blog/post.action.tsx` with `useOptimistic` state transitions (idle → fetching → copied/failed)

## Cross-Cutting Concerns

**Logging:** `tslog` via `src/lib/logger.ts` — structured pretty-print logs; production-safe level filtering (minLevel 3 in production)

**Validation:** Zod schema in `src/schemas/email.schema.ts` for `/api/send` request body; gray-matter frontmatter parsing for MDX posts

**Authentication:** Not applicable — public read-only portfolio; GitHub API access uses `GITHUB_API_TOKEN` env var only

**Analytics:** Vercel Analytics and Speed Insights, lazily loaded in `src/providers/analytics/Analytics.tsx` using React `lazy` + `Suspense`

**Consent:** GDPR consent manager at `src/components/manager/ConsentManager.tsx` wraps the entire app body

**SEO:** Every page generates `Metadata` with `openGraphImage()` helper from `src/lib/open-graph.ts`; JSON-LD structured data injected as inline `<script type="application/ld+json">` in each page component; `src/app/sitemap.ts` auto-generates sitemap from all MDX posts

**MDX Pipeline:** Custom rehype/remark plugins in `src/lib/` process MDX for component injection (`rehype-component.ts`), package manager command formatting (`rehype-npm-command.ts`), query param handling (`rehype-add-query-params.ts`), and code file imports (`remark-code-import.js`)

---

*Architecture analysis: 2026-02-17*
