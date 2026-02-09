# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
pnpm i

# Development server (runs on http://localhost:1408)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check-types

# Linting and formatting (uses Biome.js)
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format:write

# Component Registry
pnpm registry:build  # Build registry for distribution
```

## Project Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with custom registry
- **Linting**: Biome.js (extends ultracite config)
- **Content**: MDX/Markdown for blog posts
- **Package Manager**: pnpm (v9+)
- **Node**: v20 or v22+

### Directory Structure

```
src/
├── app/              # Next.js App Router
│   ├── (app)/        # Main app route group
│   ├── (llms)/       # LLM-specific routes
│   ├── api/          # API routes
│   ├── og/           # OG image generation
│   └── rss/          # RSS feed
├── features/         # Feature-based organization
│   ├── blog/         # Blog functionality
│   ├── context/      # Context menu features
│   ├── navigation/   # TopBar components (NavBar, Footer)
│   ├── profile/      # User profile data and components
│   └── root/         # Root-level features
├── components/       # Reusable components
│   ├── ui/           # shadcn UI components
│   ├── icons/        # Icon components (including flag icons)
│   ├── text/         # TextAnimate components
│   └── animations/   # Animation components
├── registry/         # Custom shadcn registry
│   ├── apple-hello-effect/
│   ├── flip-sentences/
│   ├── theme-switcher/
│   └── wheel-picker/
├── lib/              # Utility libraries
│   ├── octokit.ts    # GitHub API client
│   ├── fonts.ts      # Font configuration
│   ├── logger.ts     # Logging utility
│   ├── utils.ts      # General utilities (cn, etc.)
│   └── rehype-*.ts   # MDX processing plugins
├── actions/          # Server Actions
│   └── data.action.ts
├── config/           # Configuration
│   ├── theme.ts       # Site metadata and navigation
│   └── registry.ts   # Registry configuration
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── styles/           # Global styles
```

### Key Architectural Patterns

**Feature-Based Organization**: Code is organized by feature domain (blog, navigation, profile) rather than technical type. Each feature contains its own components, hooks, and logic.

**Server Actions**: GitHub data fetching uses Server Actions (see `src/actions/data.action.ts`). These are async functions that run on the server and can be called from Client Components.

**Dynamic Imports**: Heavy components like context menus and scroll-to-top are dynamically imported in layouts to optimize initial bundle size.

**Custom Registry System**: The project includes a custom shadcn registry at `src/registry/` for distributing reusable components. Components can be added to other projects via:

```bash
npx shadcn@latest add @envindavsorg/theme-switcher
npx shadcn@latest add @envindavsorg/apple-hello-effect
```

**MDX Processing Pipeline**: Blog posts use a custom MDX pipeline with:

- `rehype-component.ts` - Component injection into MDX
- `rehype-npm-command.ts` - Package manager command blocks
- `remark-code-import.js` - Code import from files
- Syntax highlighting via `shiki`

**GitHub Integration**: The project integrates with GitHub API using Octokit (configured in `src/lib/octokit.ts`) to fetch user data and repository information.

## Code Style

- **Formatting**: Tabs for indentation, 80 character line width
- **Quotes**: Single quotes for JavaScript/TypeScript
- **Semicolons**: Always use semicolons
- **Import Aliases**: Use `@/*` for imports from `src/`
- **Class Names**: Use `cn()` utility from `@/lib/utils` for merging Tailwind classes
- **Component Naming**: PascalCase for components, features use named exports

## Configuration Files

- **Biome**: `biome.json` - Linting and formatting rules (extends ultracite)
- **TypeScript**: `tsconfig.json` - Strict mode enabled, `@/*` path alias
- **Site Config**: `src/config/theme.ts` - TopBar, metadata, GitHub repo info
- **Registry Config**: `src/config/registry.ts` - Component registry configuration
- **Environment**: `.env.local` - Required for GitHub token and app URL

## Important Notes

- **Port**: Development server runs on port 1408 (not default 3000)
- **Registry Build**: Run `pnpm registry:build` after modifying components in `src/registry/`
- **Tailwind v4**: Uses the new Tailwind CSS v4 (PostCSS-based)
- **React 19**: Project uses React 19 (ensure compatibility)
- **Font Loading**: Custom fonts configured in `src/lib/fonts.ts`
- **Greeting System**: Multi-language greeting effects in `/public/assets/` (hello, bonjour, hola)
