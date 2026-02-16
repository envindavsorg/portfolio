# External Integrations

**Analysis Date:** 2026-02-16

## APIs & External Services

**GitHub:**
- Service: GitHub GraphQL API for user data
- What it's used for: Fetching repository data, contributions calendar, followers, stars, commits
  - SDK/Client: `octokit` v5.0.5
  - Configuration: `src/lib/octokit.ts`
  - Auth: `GITHUB_API_TOKEN` environment variable
  - Usage:
    - `src/actions/github/data.action.ts` - Fetch user profile, repos, contributions (cached 1 hour)
    - `src/actions/github/commit.action.ts` - Get commit history
    - `src/features/(homepage)/7_commits/Commits.tsx` - Display recent commits
    - `src/components/ui/contribution-graph/ContributionGraph.tsx` - Render contribution calendar
  - Query file: `src/queries/github/data.query` (GraphQL queries)

**Resend:**
- Service: Transactional email service
- What it's used for: Sending CV/resume via email with PDF attachment
  - SDK/Client: `resend` v6.9.1
  - Auth: `RESEND_API_KEY` environment variable
  - Endpoint: `src/app/api/send/route.ts`
  - Features:
    - React component email templates via `@react-email/components`
    - PDF attachment from `public/documents/resume.pdf`
    - Sender: Portfolio owner email (configured in `src/content/data/global`)
    - Validation: Zod schema in `src/schemas/email.schema`
  - Email template: `src/features/(homepage)/4_cv/CvTemplate` (React component)

**Cloudflare:**
- Service: Cloudflare Speed Test
- What it's used for: Network speed measurement widget
  - SDK/Client: `@cloudflare/speedtest` v1.7.0
  - Usage: `src/features/(writings)/utils/SpeedTest.tsx`
  - Embedded in blog/content pages

## Data Storage

**Databases:**
- Type: None (static site)
- Content storage: Markdown/MDX files in `src/content/`
  - Blog posts in content directory with YAML frontmatter
  - Static data in `src/content/data/global.ts`

**File Storage:**
- Service: Vercel Blob (for media/data files)
  - Client: `@vercel/blob` v2.2.0
  - Auth: `BLOB_READ_WRITE_TOKEN` environment variable
  - Usage: `src/actions/linkedin/followers.action.ts` - Stores LinkedIn follower count as JSON
  - Filename: `linkedin-followers.json`
  - Cached for 1 hour with tag-based revalidation
  - Static files: `public/documents/resume.pdf`, `public/assets/greeting-messages/`

**Caching:**
- Strategy: Next.js `unstable_cache` with revalidation
  - GitHub data cache: 1 hour (`src/actions/github/data.action.ts`)
  - LinkedIn data cache: 1 hour (`src/actions/linkedin/followers.action.ts`)
- Edge Cache: HTTP headers set in routes (300 seconds default on health endpoint)

## Authentication & Identity

**Auth Provider:**
- Type: Custom GitHub token authentication
  - Implementation: Token-based (not OAuth user login)
  - Use: Server-side API calls only
  - Token stored in: `GITHUB_API_TOKEN` environment variable
  - Scope: Public GitHub API queries (read-only)

**Tracking & Consent:**
- Service: c15t Consent Manager
  - Client: `@c15t/nextjs` v1.8.3
  - Components:
    - `src/components/manager/ConsentManager.tsx` (server)
    - `src/components/manager/ConsentManagerClient.tsx` (client-side options)
  - Purpose: GDPR compliance for analytics and tracking

**LinkedIn:**
- Service: LinkedIn (indirect via Vercel Blob storage)
- What it's used for: Display follower count
  - Implementation: Manual data sync to Vercel Blob (not API integration)
  - Data format: JSON with count and updatedAt timestamp
  - Fallback: Returns count: 0 if no data available

## Monitoring & Observability

**Analytics:**
- Service: Vercel Analytics
  - Client: `@vercel/analytics/react` v1.6.1
  - Integration: `src/providers/analytics/Analytics.tsx`
  - Mode: Auto (tracks Core Web Vitals, page views)
  - Debug mode enabled
  - Lazy-loaded via dynamic import for performance

**Performance Monitoring:**
- Service: Vercel Speed Insights
  - Client: `@vercel/speed-insights/react` v1.3.1
  - Integration: `src/providers/analytics/Analytics.tsx`
  - Tracks: Real user performance metrics
  - Debug enabled in development only

**Error Tracking:**
- Type: Not detected (no Sentry, Rollbar, or similar)
- Logging: Custom `tslog` v4.10.2 for server-side logging
  - Utility: `src/lib/logger.ts`
  - Used in: Error handling, data fetch failures
  - Example: LinkedIn data fetch error logging in `src/actions/linkedin/followers.action.ts`

**Logging:**
- Framework: `tslog` with `consola` v3.4.2
- Pattern: Server-side logging for data actions and API routes
- Example usage: `logger.error()` for fetch failures

## Health Checks & Monitoring

**Health Endpoint:**
- Route: `src/app/api/health/route.ts`
- Runtime: Edge function
- Status: Always returns `200 OK` with "OK" body
- Headers: Cache-Control 300s, security headers, health status header
- Purpose: Deployment and uptime monitoring

## CI/CD & Deployment

**Hosting:**
- Platform: Vercel (inferred from Vercel SDK integrations)
- Environment: `VERCEL_URL` available in production
- Image domains allowed: `avatars.githubusercontent.com`, `cuzeacflorin.fr`

**Build Pipeline:**
- Build command: `next build`
- Start command: `next start`
- Environment validation: Zod schema in `next.config.ts` runs at build time
- Errors: Build fails if required env vars missing

**Performance Optimization:**
- Dynamic imports for heavy components (Analytics, Speed Insights)
- Image optimization: AVIF, WebP formats with multiple sizes
- CSS optimization: Tailwind CSS v4 with Rust oxide engine
- Bundle splitting: Next.js App Router with code splitting

## Environment Configuration

**Required env vars:**
- `GITHUB_API_TOKEN` - GitHub GraphQL authentication
- `GITHUB_USERNAME` - GitHub username for data fetching
- `GITHUB_REPO_NAME` - Repository name for contribution data

**Optional env vars:**
- `RESEND_API_KEY` - Email service (for CV sending)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage (for LinkedIn data)
- `NEXT_PUBLIC_APP_URL` - Public app URL (falls back to `VERCEL_URL`)
- `NODE_ENV` - development/production (default: development)
- `ENV_TYPE` - capture/normal (for screenshot/demo mode)
- `API_TOKEN` - Generic API token (optional)
- `TURBO_TOKEN` - Turbo Cache auth (optional)
- `TURBO_TEAM` - Turbo Cache team (optional)

**Secrets location:**
- `.env.local` - Local development secrets (not committed)
- Vercel dashboard - Production secrets at deployment

**Environment Validation:**
- Location: `next.config.ts` (runs at build time)
- Schema: Zod validation object
- Behavior: Exits with error code 1 if validation fails
- Output: Human-readable tree error messages via `z.treeifyError()`

## Webhooks & Callbacks

**Incoming Webhooks:**
- None detected - Portfolio is read-only from external services

**Outgoing Webhooks:**
- Email webhooks: Resend service sends emails on-demand (not webhook-based)
- No background job processing detected

**API Routes:**
- `POST /api/send` - Email endpoint (accepts firstName, recipientEmail)
- `GET /api/health` - Health check
- `GET /api/rss` - RSS feed generation
- `GET /api/vcard` - vCard contact export
- `GET /api/og` - Open Graph image generation

## Image Processing & Screenshots

**OG Image Generation:**
- Route: `src/app/api/og/route.tsx`
- Engine: Headless browser via `puppeteer-core` v24.37.2
- GIF encoding: `@skyra/gifenc` v1.0.1
- Image processing: `sharp` v0.34.5
- Usage: Dynamic social media preview images

**Component Screenshots:**
- Script: `src/scripts/capture-components.ts`
- Mode: `ENV_TYPE=capture` flag
- Port: 1409 (separate from main dev server on 1408)
- Tools: Puppeteer for rendering, sharp for processing

## vCard & Contact Export

**vCard Service:**
- Route: `src/app/api/vcard/route.ts`
- Library: `vcard-creator` v0.7.2
- Data source: `src/content/data/global` (profile info)
- Format: Standard vCard 3.0/4.0
- Use case: Contact import to phone/address book

## RSS Feed

**RSS Generation:**
- Route: `src/app/api/rss/route.ts`
- Content: Blog posts from `src/content/` with metadata
- Format: Standard RSS 2.0
- Caching: Server-generated per request (no caching specified)

## Third-Party Component Registries

**shadcn Registry:**
- Location: `src/registry/` directory
- Custom components distributed via:
  ```bash
  npx shadcn@latest add @envindavsorg/theme-switcher
  npx shadcn@latest add @envindavsorg/apple-hello-effect
  ```
- Registry config: `src/config/registry.ts`
- Auto-generated index: `src/__registry__/registry.autogenerated.json` (via `pnpm registry:build`)

## Data Sources

**Blog Content:**
- Location: Markdown/MDX files (exact path: `src/content/blog/` or similar)
- Processing: Custom MDX pipeline with remark/rehype
- Plugins:
  - `rehype-component.ts` - Inject custom components
  - `rehype-npm-command.ts` - Render package manager commands
  - `remark-code-import.ts` - Import code from files
- Syntax highlighting: Shiki 3.22.0

**Static Content:**
- Profile data: `src/content/data/global.ts` (TypeScript object)
- Skills, experience, social links defined as data structures
- Greeting files: `public/assets/` (multilingual messages)

---

*Integration audit: 2026-02-16*
