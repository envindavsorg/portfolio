# Coding Conventions

**Analysis Date:** 2026-02-16

## Naming Patterns

**Files:**
- Components: PascalCase (`Card.tsx`, `Particles.tsx`, `Button.tsx`)
- Utilities: camelCase (`utils.ts`, `logger.ts`, `octokit.ts`)
- Hooks: camelCase with `use` prefix (`useCopyToClipboard.ts`, `useMediaQuery.ts`)
- Actions: camelCase with `.action.ts` suffix (`data.action.ts`, `commit.action.ts`, `followers.action.ts`)
- Schemas: camelCase with `.schema.ts` suffix (`email.schema.ts`)
- Type definitions: camelCase with `.d.ts` extension (`default.d.ts`, `icons.d.ts`)

**Functions:**
- Component functions: PascalCase (e.g., `Card`, `Particles`, `LLMCopyButton`)
- Utility functions: camelCase (e.g., `cn()`, `copyText()`, `downloadFile()`, `getPrompt()`)
- Helper functions: camelCase with descriptive verbs (e.g., `contributionLevelToNumber()`, `eachDayOfInterval()`, `nextDay()`)
- Event handlers: camelCase with `handle` or `on` prefix (e.g., `handleCopy()`, `handleChange()`)

**Variables:**
- Constants: UPPER_SNAKE_CASE for truly constant values (e.g., `CACHE_TAG`, `CACHE_REVALIDATE`, `PROTOCOL_REGEX`, `DEFAULT_MONTH_LABELS`)
- camelCase for local/state variables (e.g., `buttonText`, `timeoutId`, `buttonVariants`)
- Readonly/immutable objects: camelCase (e.g., `headers`, `cache`, `ICONS`)
- Type names: PascalCase (e.g., `PromptType`, `SparklesProps`, `BodyData`)

**Types:**
- Interfaces: PascalCase (e.g., `CommitData`, `GitHubData`, `LLMCopyButtonProps`)
- Type unions: PascalCase with descriptive names (e.g., `ContributionLevel`, `ThemeType`)
- Generic type parameters: Single uppercase letter or PascalCase (e.g., `T`, `Props`)

## Code Style

**Formatting:**
- Tool: Biome.js (configured in `biome.json`)
- Indentation: Tabs (configured as `indentStyle: "tab"`)
- Line width: 80 characters (configured as `lineWidth: 80`)
- CSS line width: 120 characters (extended for CSS)

**Linting:**
- Tool: Biome.js with extended `ultracite/core` configuration
- Key rules enabled:
  - `useSortedClasses` (warn level) - Sorts Tailwind classes in `className`, `classList`, `clsx()`, `cva()`, `tw()`, `cn()` calls with safe auto-fix
  - `useMaxParams` (warn level) - Maximum 6 parameters per function
  - Recommended rules from ultracite core configuration
- Disabled rules for flexibility:
  - `noImportantStyles` - Allows `!important` in CSS
  - `noDangerouslySetInnerHtml` - Permits dangerously setting HTML
  - `noBarrelFile` - Permits barrel exports
  - `noNestedTernary` - Allows nested ternaries
  - `noArrayIndexKey` - Allows array indices as React keys
  - `useAwait` - Doesn't enforce await in async functions

**Quotes:**
- Single quotes for JavaScript/TypeScript
- Configured via `"quoteStyle": "single"`

**Semicolons:**
- Always use semicolons
- Configured via `"semicolons": "always"`

## Import Organization

**Order:**
1. Type imports from external libraries (`import type { ... } from 'next'`)
2. Default imports from external libraries (`import Script from 'next/script'`)
3. Named imports from external libraries (grouped by module)
4. Type imports from internal paths (`import type { ComponentProps } from 'react'`)
5. Imports from `@/*` aliases (internal application imports)
6. Relative imports (if any)
7. Side-effect imports (CSS, configuration)

**Examples:**
```typescript
// File: src/app/layout.tsx
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import type React from 'react';
import ConsentManager from '@/components/manager/ConsentManager';
import GLOBAL_DATA from '@/content/data/global';
import { cn } from '@/lib/utils';
import { Providers } from '@/providers/Providers';
```

**Path Aliases:**
- Primary alias: `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- All imports use absolute paths from `@/` rather than relative paths

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations and API calls
- Error objects are logged using `logger.error()` from `tslog`
- API routes return `Response.json()` with appropriate HTTP status codes and error objects
- Server Actions use `try-catch` with error logging (see `data.action.ts`)
- Client-side clipboard operations catch and handle clipboard unavailability
- GraphQL queries wrapped in try-catch for error capture

**Examples:**
```typescript
// API Error Handling (src/app/api/send/route.ts)
export const POST = async (request: Request): Promise<Response> => {
	try {
		const body = (await request.json()) satisfies BodyData;
		const validation = emailSchema.safeParse(body);
		if (!validation.success) {
			return Response.json(
				{ error: 'Données invalides', details: validation.error.issues },
				{ status: 400 }
			);
		}
		// ... operation logic
		if (error) {
			return Response.json(
				{ error: "Erreur lors de l'envoi du mail !" },
				{ status: 500 }
			);
		}
	} catch {
		return Response.json(
			{ error: 'Une erreur serveur est survenue !' },
			{ status: 500 }
		);
	}
};

// Utility Error Handling (src/lib/utils.ts)
export const copyText = async (text: string): Promise<boolean> => {
	if (!navigator?.clipboard) {
		logger.warn('Clipboard not supported in this browser !');
		return false;
	}
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		logger.error('Copy failed !', error);
		return false;
	}
};

// Graceful Fallback Pattern (src/lib/utils.ts)
export const addQueryParams = (
	urlString: string,
	query: Record<string, string>
): string => {
	try {
		const url = new URL(urlString, dummyBase);
		// ... operation
		return isRelative ? url.pathname + url.search : url.toString();
	} catch (_error) {
		return urlString; // Return original on parse failure
	}
};
```

## Logging

**Framework:** `tslog` Logger

**Configuration** (src/lib/logger.ts):
- Logger name: "Mon portfolio - Cuzeac Florin"
- Type: 'pretty' formatting
- Min level in production: 3 (warn/error only)
- Min level in development: 0 (all logs)

**Patterns:**
- Use `logger.warn()` for non-critical issues
- Use `logger.error()` for failures and exceptions
- Logs automatically include context and timestamp

## Comments

**When to Comment:**
- Inline comments explain WHY logic exists, not WHAT it does
- Grouping comments in types organize related definitions
- Helper function comments describe purpose

**Examples:**
```typescript
// Organize type definitions by feature (src/types/default.d.ts)
// SERVER ACTION TYPES
// types for GitHub commit data
interface CommitData { ... }

// types for GitHub data
type ContributionLevel = ...

// Comments explain logic intent (src/components/animations/Particles.tsx)
// Helper function to get each day in an interval
export const eachDayOfInterval = (start: Dayjs, end: Dayjs): Dayjs[] => { ... }

// Disabled features documented with comments
/*
import { Header } from "@/features/(homepage)/2_header/Header";
import { Overview } from "@/features/(homepage)/3_overview/Overview";
*/
```

**JSDoc/TSDoc:**
- JSDoc is not extensively used; inline types via TypeScript interfaces are preferred
- Zod schemas include validation error messages that serve as documentation

## Function Design

**Size:**
- Functions generally kept under 50 lines
- Complex component logic extracted to separate utilities
- Server Actions often wrap data fetching with caching

**Parameters:**
- Maximum 6 parameters per function (linter warning via Biome)
- Props interfaces used for components with multiple parameters
- Destructuring used in parameters for clarity

**Return Values:**
- Explicit return type annotations for all functions
- Promises used for async operations
- Nullable returns signaled with `|` union type or `null`
- Boolean returns for success/failure operations

**Examples:**
```typescript
// Utility with explicit types (src/lib/utils.ts)
export const copyText = async (text: string): Promise<boolean> => { ... }
export const addQueryParams = (
	urlString: string,
	query: Record<string, string>
): string => { ... }

// React component with props interface
interface SparklesProps {
	density?: number;
}
export const Particles = memo(function Sparkles({
	density = 50,
}: SparklesProps) { ... })

// Server Action with caching
export const getGitHubData = unstable_cache(fetchGitHubData, [CACHE_TAG], {
	revalidate: CACHE_REVALIDATE,
	tags: [CACHE_TAG],
});
```

## Module Design

**Exports:**
- Named exports preferred for utilities and functions
- Default exports used for React components in some cases
- Components exported as named exports when part of feature groups
- Server Actions exported as named exports

**Barrel Files:**
- Component libraries use barrel files (e.g., `src/components/ui/`)
- Individual components exported then re-exported from index
- Allowed via Biome configuration (`noBarrelFile: "off"`)

**Example:**
```typescript
// src/components/ui/Card.tsx - Individual component
export const Card = ({ className, ...props }: ComponentProps<'div'>) => (...)
export const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => (...)
```

## Code Patterns

**React Hooks:**
- `useState` for simple state
- `useEffect` for side effects with proper cleanup
- `useMemo` for expensive computations and referential stability
- `useCallback` for stable function references
- `useOptimistic` for optimistic UI updates
- Custom hooks follow `use*` naming convention

**Dynamic Imports:**
- Used for code splitting and performance optimization
- `lazy()` from React for component lazy loading
- Dynamic imports in event handlers for deferred loading

**Component Composition:**
- Props spread (`{...props}`) used for forwarding HTML attributes
- `cn()` utility for merging Tailwind classes
- `data-slot` attributes for component part identification

**Server vs Client:**
- `'use server'` directive for Server Actions
- `'use client'` directive for Client Components
- Server Components preferred by default in App Router

---

*Convention analysis: 2026-02-16*
