# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Dev server on http://localhost:1408
pnpm build                # Production build
pnpm preview              # Build + serve on port 1408
pnpm types                # Type checking (tsc --noEmit)
pnpm lint                 # Biome check
pnpm lint:fix             # Biome check --fix
pnpm format               # Biome format check
pnpm format:fix           # Biome format --fix
pnpm check                # Biome check --fix --unsafe (full auto-fix)
pnpm registry:build       # Build component registry for distribution
```

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with custom registry
- **Linting**: Biome.js (extends ultracite config)
- **Content**: MDX via `next-mdx-remote` + `fumadocs-core` for TOC
- **State**: Jotai for atoms, React Hook Form + Zod for forms
- **Animation**: Motion (Framer Motion v12+)
- **Package Manager**: pnpm (v10+)
- **React**: 19

## Project Architecture

### Route Structure

```
src/app/
├── (content)/                    # Main visible site
│   ├── (root)/page.tsx           # Homepage (/) - one-pager assembling feature sections
│   └── (writings)/               # Content routes: /blog, /components, /utils
│       ├── blog/[slug]/
│       ├── components/[slug]/
│       └── utils/[slug]/
├── (llms)/                       # Plain-text mirror of all content for AI ingestion
│   ├── llms.txt/route.ts         # /llms.txt - markdown index
│   ├── about.md/route.ts         # /about.md, /experience.md, etc.
│   └── blog.mdx/[slug]/route.ts  # /blog/:slug.mdx (raw MDX)
├── api/
│   ├── og/route.tsx              # Dynamic OG image generation (ImageResponse)
│   ├── send/route.ts             # CV email delivery via Resend
│   ├── rss/route.ts              # RSS feed
│   ├── vcard/route.ts            # VCard download
│   └── health/route.ts
└── (other)/og/page.tsx           # Dev preview page for OG images
```

### Feature Organization

Features live in `src/features/` grouped by route context:

- `(homepage)/` - Homepage sections: about, branding, commits, contact, cover, cv, experiences, header, overview, projects
- `(navigation)/` - NavBar + Footer (site-wide chrome)
- `(root)/` - Shared sections: articles, certs, stack, tools
- `(writings)/` - Blog reading UI: CodeBlockCommand, ComponentPreview, TagsFilter, KeyboardShortcuts, inline utils (Base64, ColorGenerator, JSONFormatter, SpeedTest, etc.)

**RSC boundary pattern**: Each feature uses a `Feature.tsx` (async RSC shell that fetches data) + `FeatureContent.tsx` (`'use client'` component receiving data as props).

**Static data co-location**: Typed arrays for projects, experiences, tools, certs, stack live in `content.ts` files alongside their feature components.

### Content System

Blog posts are MDX files in `src/content/articles/`. Frontmatter includes a `category` field that routes to the correct section:

- `article` → `/blog/[slug]`
- `components` → `/components/[slug]`
- `utils` → `/utils/[slug]`

Posts are read from the filesystem (no database). MDX processing uses custom rehype plugins in `src/lib/`: `rehype-component.ts` (component injection), `rehype-npm-command.ts` (package manager blocks), `remark-code-import.js` (code imports). Syntax highlighting via `shiki`.

### Global Data

`src/content/data/global.ts` exports `GLOBAL_DATA` - the single source of truth for all personal data (name, bio, social links, work history, CV info). Never hardcode personal data elsewhere.

### Server Actions

Actions are split by domain in `src/actions/`:

- `github/data.action.ts` - Contributions, stars, followers (GraphQL via Octokit)
- `github/commit.action.ts` - Latest commit data
- `linkedin/followers.action.ts` - Reads follower count from Vercel Blob

All use `unstable_cache` with 1-hour revalidation. GitHub queries live in `src/queries/github/`.

### LLM Content Mirror

The `(llms)/` route group is a first-class feature: every piece of content has a parallel `.md`/`.mdx` route serving raw text for AI tools. The "Copy Markdown" button on articles fetches from this mirror.

### Custom Registry

Distributable components at `src/registry/` (theme-switcher, apple-hello-effect, flip-sentences). After modifying, run `pnpm registry:build` which generates `src/__registry__/` files and `public/r/registry.json`.

## Code Style

- **Formatting**: Tabs, 80 char width (120 for CSS)
- **Quotes**: Single quotes, always semicolons
- **Imports**: Use `@/*` alias for `src/`, Biome auto-organizes imports
- **Class Names**: Use `cn()` from `@/lib/utils` for merging Tailwind classes
- **Tailwind**: Biome enforces sorted classes via `useSortedClasses` rule
- **Components**: PascalCase, named exports

## Environment Variables

Required in `.env.local` (no `.env.example` exists):

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_API_TOKEN` | Yes | GitHub PAT for Octokit GraphQL |
| `GITHUB_USERNAME` | No | GitHub username |
| `GITHUB_REPO_NAME` | No | Repo for commit widget |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob (LinkedIn followers) |
| `RESEND_API_KEY` | No | Email delivery for CV |
| `API_TOKEN` | No | Internal API auth |

Env validation runs at startup via Zod schema in `next.config.ts`. Only `GITHUB_API_TOKEN` is strictly required.

## Important Notes

- **Port**: Dev server on 1408 (not 3000)
- **OG Images**: Dynamic via `GET /api/og?type=blog&title=...`, helper at `src/lib/open-graph.ts`
- **Sound**: `src/lib/sound-manager.ts` plays sounds on certain interactions
- **CV delivery**: PDF at `public/documents/resume.pdf`, emailed via Resend with React Email template
- **Dynamic imports**: Heavy components (context menus, scroll-to-top) are lazy-loaded in layouts
