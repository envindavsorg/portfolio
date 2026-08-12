# External Integrations

**Analysis Date:** 2026-08-12

> Superseded the 2026-02-16 snapshot: the `/api/send` route and the Vercel Blob
> follower count it documented no longer exist.

## APIs & External Services

**GitHub (GraphQL)**

- Used for: contribution calendar, stars, followers/following, per-repo language
  breakdown, and the latest commit on the widget repo
- Client: `octokit` 5, wrapped in `src/lib/octokit.ts` (exports the bound
  `graphql` function, not the whole client)
- Auth: `GITHUB_API_TOKEN`
- Callers: `src/actions/data.action.ts`, `src/actions/commit.action.ts`
- Caching: `unstable_cache`, 1 h revalidate, around the fetch **only**
- Failure mode: typed zeroed fallback and a logged error. Nothing throws, so an
  expired token degrades the widgets instead of breaking the build — which is what
  allows CI to build with a placeholder token
- Forks are excluded from the language statistics: they would attribute other
  people's code

**Resend (transactional email)**

- Used for: emailing the CV as a PDF attachment
- Client: `resend` 6 with `@react-email/components` / `@react-email/render` for the
  template
- Auth: `RESEND_API_KEY`, optional
- Caller: `src/actions/send-cv.action.ts` (next-safe-action)
- The client is built lazily via `getResend()`. `new Resend(undefined)` throws at
  module scope, which would fire before any in-action guard could check the key
- Protected by three sliding-window limiters: per IP (3 / 10 min), per recipient
  (2 / 24 h) and global (60 / h). The PDF is read once and cached

**Cloudflare Speed Test**

- Used for: the `/utils/internet-speed-test` tool
- Client: `@cloudflare/speedtest`, entirely client-side
- The only cross-origin destination in the CSP: `connect-src` allows
  `https://speed.cloudflare.com`

**Vercel Analytics & Speed Insights**

- `@vercel/analytics`, `@vercel/speed-insights`, mounted lazily in
  `src/components/providers/analytics/Analytics.tsx` and only in production
- Their scripts are served from `/_vercel/*`, i.e. same-origin, so they need no CSP
  exception. Off-platform they 404, which the e2e CSP spec explicitly tolerates

## Data Storage

There is no database. State lives in three places:

- **MDX files on disk** (`src/content/`) — the content, read at build time
- **`src/data/global.ts`** — personal data, the single source of truth for it
- **`localStorage`** via persisted Zustand stores in `src/hooks/`. Stores are
  versioned and carry a `migrate` (see `useConfig.ts`): a stored shape that no
  longer matches the code must be migrated, not trusted

`BLOB_READ_WRITE_TOKEN` is still declared in `src/env.ts` but nothing reads it —
the Vercel Blob integration it belonged to was removed. Rate-limit state is
in-process, which is a real constraint on serverless (see CONCERNS.md).

## Authentication & Identity

There is no user authentication; the site is public and read-only. `API_TOKEN` is
declared as an optional internal secret. All privileged calls happen server-side
with server-only credentials, never exposed to the client — only
`NEXT_PUBLIC_APP_URL` crosses that line, and it holds no secret.

## Monitoring & Observability

- **Logging:** `src/lib/logger.ts` (`tslog`), `minLevel` 3 in production and 0
  otherwise. Server-side failures — especially GitHub ones — are logged rather than
  swallowed
- **Analytics:** Vercel Analytics and Speed Insights, production only
- **No error tracker** (no Sentry or equivalent). A failing section renders its
  fallback and reports nothing off-platform

## Health Checks

`GET /api/health` returns `200 OK` as `text/plain` with an `X-Health-Status: OK`
header and a 5-minute cache. It is a liveness probe only: it does not check GitHub,
Resend or the filesystem, so it stays green while a dependency is down.

## CI/CD & Deployment

- **Hosting:** Vercel. `next build` output, mostly prerendered
- **CI:** `.github/workflows/ci.yml` — types, lint, format and unit tests in one
  job; build and e2e in another, with the Playwright report uploaded as an artifact
- **Other workflows:** `label.yml` (`actions/labeler@v5`, config in
  `.github/labeler.yml`), `stale.yml`, `greetings.yml`, `summary.yml`
  (`actions/ai-inference`)
- `label.yml` is triggered by `pull_request_target`, so the action reads both the
  workflow **and** `.github/labeler.yml` from the base branch. A change to either
  only takes effect once merged into `master`

## Environment Configuration

Declared exclusively in `src/env.ts` (`@t3-oss/env-nextjs`), which `next.config.ts`
imports so validation runs at startup. `SKIP_ENV_VALIDATION` bypasses it.

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_API_TOKEN` | yes | GitHub GraphQL (presence only — an invalid value degrades gracefully) |
| `GITHUB_USERNAME` | no | account queried by the widgets |
| `GITHUB_REPO_NAME` | no | repository for the commit widget |
| `RESEND_API_KEY` | no | CV delivery; without it the action refuses cleanly |
| `BLOB_READ_WRITE_TOKEN` | no | declared, currently unused |
| `API_TOKEN` | no | internal secret |
| `NEXT_PUBLIC_APP_URL` | no | absolute URL base (falls back to `VERCEL_URL`, then the production domain) |
| `TURBO_TEAM` / `TURBO_TOKEN` | no | remote cache |

Never read `process.env` directly in application code.

## Webhooks & Callbacks

None. Nothing external calls into the site; every integration is outbound.

## Image Processing & Screenshots

- **OG images:** `GET /api/og?type=…&title=…` via `ImageResponse`, with fonts under
  `app/api/og/fonts/`. Helpers `openGraphImage` and `BASE_URL` live in
  `src/lib/metadata.ts`
- **Optimisation:** `sharp`, AVIF and WebP, `remotePatterns` limited to
  `cuzeacflorin.fr`, `images.unsplash.com` and `picsum.photos` — the same hosts the
  CSP's `img-src` allows. SVG is allowed but sandboxed by a dedicated
  `images.contentSecurityPolicy`
- **Capture scripts:** `pnpm capture:*` drive `puppeteer-core` against `/og` and
  `/components/<slug>` on port 1409 to regenerate files in `public/images/`
  (`@skyra/gifenc` and `pngjs` handle encoding)

## vCard & Contact Export

`GET /api/vcard` builds a vCard with `vcard-creator` from `GLOBAL_DATA`, including
the embedded `PHOTO`.

## Feeds

- `GET /api/rss` — every category
- `GET /api/rss/[category]` — one feed per category, prerendered through
  `generateStaticParams`, 404 on an unknown category
- `GET /api/feed.json` — JSON Feed 1.1

All three go through `src/lib/feed.ts` (serialisation) and `src/lib/feed-routes.ts`
(shared metadata and response headers), so RSS and JSON Feed always describe the
same content. Responses are `force-static` with `Cache-Control` and
`stale-while-revalidate`.

## Third-Party Component Registries

`src/registry/` publishes theme-switcher, apple-hello-effect and flip-sentences.
`pnpm registry:build` runs the internal generator then `shadcn build`, producing
`src/__registry__/` and `public/r/registry.json`. Paths are configured in
`components.json`.

## Data Sources Summary

| Source | Kind | When |
|---|---|---|
| `src/content/**/*.mdx` | filesystem | build |
| `src/data/global.ts` | module | build |
| `messages/{fr,en}.json` | compiled by Paraglide | build |
| GitHub GraphQL | HTTP | request, cached 1 h |
| Cloudflare Speed Test | HTTP | client, on demand |
| Resend | HTTP | server action |
| `localStorage` | browser | client |
