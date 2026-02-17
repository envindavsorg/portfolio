# Coding Conventions

**Analysis Date:** 2026-02-17

## Naming Patterns

**Files:**
- Components: PascalCase (`Card.tsx`, `Particles.tsx`, `Button.tsx`, `Header.tsx`)
- Utilities: kebab-case or camelCase (`utils.ts`, `logger.ts`, `octokit.ts`, `open-graph.ts`, `sound-manager.ts`)
- Hooks: kebab-case with `use-` prefix (`use-copy-to-clipboard.ts`, `use-media-query.ts`, `use-browser.ts`)
- Actions: camelCase with `.action.ts` or `.action.tsx` suffix (`data.action.ts`, `post.action.tsx`, `followers.action.ts`)
- GraphQL queries: `[name].query.ts` suffix (`data.query.ts`)
- Rehype/remark plugins: `rehype-[name].ts`, `remark-[name].ts`
- Content data: `content.ts` inside feature directories; global data in `src/content/data/`
- Type definitions: lowercase with `.d.ts` extension (`default.d.ts`, `icons.d.ts`, `data.d.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `Card`, `Particles`, `LLMCopyButton`, `Header`)
- Utility functions: camelCase (e.g., `cn()`, `copyText()`, `downloadFile()`, `getPrompt()`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleCopy`, `handlePlay`, `handleMouseEnter`)
- Fetch/data utilities: `get` prefix for public, `fetch` prefix for private (e.g., `getGitHubData`, `fetchGitHubData`, `getAllPosts`, `getPostBySlug`)

**Variables:**
- `SCREAMING_SNAKE_CASE` for module-level constants (e.g., `CACHE_TAG`, `CACHE_REVALIDATE`, `FONT_PATH`, `PAGE_BADGES`, `PROJECTS`, `ICONS`)
- camelCase for local and state variables (e.g., `buttonText`, `timeoutId`, `fontsCache`)
- `SCREAMING_SNAKE_CASE` for animation variant objects (e.g., `BODY_VARIANTS`, `TAIL_VARIANTS`)

**Types:**
- `interface` for object shapes with named exports (e.g., `CommitData`, `GitHubData`, `HeaderPronounceProps`)
- `type` for unions and aliases (e.g., `ContributionLevel`, `ThemeType`, `PageType`, `Browser`)
- Props interfaces named `[ComponentName]Props` (e.g., `ButtonProps`, `ViewOptionsProps`, `DocsLayoutProps`)
- Generic parameters: single uppercase letter or PascalCase (e.g., `T`, `Props`)

**Directories:**
- Feature groups use route-group-style parentheses: `(homepage)`, `(navigation)`, `(writings)`
- Sub-features: lowercase (`header`, `about`, `projects`, `commits`, `stack`)

## Code Style

**Formatting (enforced by Biome.js):**
- Indentation: Tabs (not spaces), configured as `"indentStyle": "tab"` in `biome.json`
- Line width: 80 characters for JS/TS; 120 for CSS
- Single quotes for strings: `"quoteStyle": "single"`
- Semicolons always required: `"semicolons": "always"`
- Config: `biome.json` (extends `ultracite/core`)

**Linting:**
- Biome.js recommended rules enabled
- `useSortedClasses` (warn level) sorts Tailwind classes in `className`, `classList`, `clsx()`, `cva()`, `tw()`, `cn()` calls with safe auto-fix
- `organizeImports` auto-sorts import groups on save
- Disabled rules include: `noStaticElementInteractions`, `noSvgWithoutTitle` (a11y), `noImportantStyles`, `noExcessiveCognitiveComplexity` (complexity), `useExhaustiveDependencies` (correctness), `noDangerouslySetInnerHtml` (security), `noNestedTernary`, `noParameterAssign` (style), `noImgElement`, `noBarrelFile` (performance), `noArrayIndexKey`, `useAwait` (suspicious)

**TypeScript:**
- Strict mode enabled (`"strict": true`, `"strictNullChecks": true`)
- Target: ES2017, module resolution: bundler
- `@/*` path alias maps to `src/`
- `import type` for type-only imports (enforced; required by `"isolatedModules": true`)

## Import Organization

Biome's `organizeImports` auto-manages imports (`assist.actions.source.organizeImports: "on"`).

**Order (auto-managed):**
1. External library type imports (`import type { Metadata } from 'next'`)
2. External library default and named imports
3. Internal `@/` alias imports (alphabetical within group)
4. Relative imports (`./ComponentName`)
5. Side-effect imports (`import '@/styles/globals.css'`)

**Example:**
```typescript
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import type React from 'react';
import ConsentManager from '@/components/manager/ConsentManager';
import GLOBAL_DATA from '@/content/data/global';
import { cn } from '@/lib/utils';
```

**Path Aliases:**
- `@/*` — maps to `src/` (use for all cross-directory imports)
- Never use long relative paths (`../../../lib/utils`); always use `@/lib/utils`

**Type-only imports:**
- Always use `import type` when importing only types/interfaces
- Example: `import type { ComponentProps } from 'react'`, `import type React from 'react'`

## React Patterns

**Server vs Client Components:**
- Server Components by default (no directive needed)
- `'use client'` at top of files using hooks, browser APIs, or interactivity
- `'use server'` at top of Server Action files

**Component Exports:**
- Named exports for all feature components and shared components (e.g., `export const Button = ...`, `export const Header = ...`)
- Default exports only for Next.js pages and layouts (required by framework)

**Component Definition Style:**
- Arrow functions: `export const ComponentName = () => (...)`
- `forwardRef` used when ref forwarding needed; set `displayName` on such components
- Example from `src/components/buttons/Button.tsx`: `Button.displayName = 'Button'`

**Props:**
- Inline destructuring in function signature
- Spread `...props` for HTML element passthrough
- Optional props use `?` and have defaults (e.g., `asChild = false`, `size = 28`, `isComponent = false`)
- Accept `className` prop to allow overrides

**Hooks:**
- `useCallback` for event handlers and dependency array stability
- `useRef` for mutable values that must not trigger re-renders (e.g., `isPlayingRef`, `isControlledRef`)
- `useMemo` for expensive derived values and stable object references
- `useOptimistic` for optimistic UI updates
- Custom hooks: default exports, kebab-case filenames with `use-` prefix

**Animation variants:**
- Define as `SCREAMING_SNAKE_CASE` constants with `as const`:
```typescript
const BODY_VARIANTS: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: { opacity: [0, 1], pathLength: [0, 1] },
} as const;
```

**CVA (class-variance-authority):**
- Used for component variants (e.g., `buttonVariants` in `src/components/buttons/Button.tsx`)
- Export both the component and the `variants` function (e.g., `export { Button, buttonVariants }`)

## Class Names

**Always use `cn()`** from `@/lib/utils` to merge Tailwind classes:

```typescript
import { cn } from '@/lib/utils';

// Simple merge with conditional
<div className={cn('base-class', isActive && 'bg-accent', className)} />

// Multi-line for complex classes
className={cn(
  'h-8',
  'before:absolute before:-left-[100vw] before:-z-1 before:h-full',
  'before:bg-[repeating-linear-gradient(...)]',
)}
```

**Sorted classes:** Biome enforces sorted Tailwind classes via `useSortedClasses` (warn level, safe auto-fix).

## Error Handling

**Strategy:** Try/catch for all async operations. Graceful fallbacks for browser APIs. `logger` for server-side errors; `console.error` for client-side audio/media failures.

**Patterns:**

```typescript
// Async with logger fallback (src/lib/utils.ts)
try {
  await navigator.clipboard.writeText(text);
  return true;
} catch (error) {
  logger.error('Copy failed !', error);
  return false;
}
```

```typescript
// Try/catch/finally for stateful cleanup (src/features/(homepage)/header/HeaderPronounce.tsx)
try {
  setIsPlaying(true);
  await soundManager.playAudio(pronunciation);
} catch (error) {
  console.error('Audio playback failed', error);
} finally {
  setIsPlaying(false);
}
```

```typescript
// Silent fallback for non-critical parse errors (src/lib/utils.ts)
try {
  const url = new URL(urlString, dummyBase);
  return result;
} catch (_error) {
  return urlString; // fallback to original
}
```

**Conventions:**
- Prefix unused error variables with `_` (e.g., `catch (_error)`) to suppress lint warnings
- Use `notFound()` from `next/navigation` for missing resources in pages/generateMetadata
- API routes return `Response.json()` with HTTP status codes and French error messages
- Server-side errors logged with `logger.error()`, client-side media errors with `console.error()`

## Logging

**Framework:** `tslog` via `src/lib/logger.ts`

```typescript
import { logger } from '@/lib/logger';

logger.warn('Clipboard not supported in this browser !');
logger.error('Error generating OG image:', error);
```

**Configuration:**
- `minLevel: 3` (warn and above) in production
- `minLevel: 0` (all logs) in development
- Named logger: `'Mon portfolio - Cuzeac Florin'`
- Import from `@/lib/logger` — never use bare `console.log` in server-side code

## Constants

**Module-level constants:** `SCREAMING_SNAKE_CASE`:

```typescript
const CACHE_TAG = 'github-user-data';
const CACHE_REVALIDATE = 3600;
const FONT_PATH = join(process.cwd(), 'src', 'assets', 'fonts');
```

**Object maps with derived types:**
```typescript
const PAGE_BADGES = {
  homepage: "Page d'accueil",
  blog: 'Blog',
} as const;

type PageType = keyof typeof PAGE_BADGES;
```

## Module Design

**Exports:**
- Named exports throughout for all utilities, hooks, and components
- Default exports only for Next.js pages and layouts
- Server Actions: named async function exports

**Barrel Files:**
- Permitted (`noBarrelFile: off` in `biome.json`)
- Not consistently used across features; components in `src/components/ui/` may use barrels
- Import by direct path when no barrel exists

**Data files:**
- Global data in `src/content/data/global.ts` as default export (`GLOBAL_DATA`)
- Feature-specific data in `content.ts` files within feature directories (e.g., `src/features/(homepage)/projects/content.ts`)

## Global Types

Shared domain types declared in `src/types/*.d.ts` using `declare global {}`:
- `src/types/default.d.ts` — all domain types (`Post`, `GitHubData`, `CommitData`, `PostMetadata`, etc.)
- `src/types/data.d.ts` — user/profile data shapes (`USER`, `OVERVIEW`, `SOCIAL`, `WORK`)
- `src/types/icons.d.ts` — animated icon interfaces (`AnimatedIconHandle`, `AnimatedIconProps`)
- `src/types/particles.d.ts` — animation component types

Global types are available project-wide without imports. Use local `interface [Name]Props` for component-scoped types only.

## Comments

**When to Comment:**
- Section grouping headers in type definition files (e.g., `// types for GitHub commit data`)
- Non-obvious logic annotations (e.g., `// Type for weekday (0 = Sunday, 6 = Saturday)`)

**No JSDoc:** TypeScript types serve as documentation. JSDoc/TSDoc is not used.

**No inline comments** in component logic; code is expected to be self-documenting.

---

*Convention analysis: 2026-02-17*
