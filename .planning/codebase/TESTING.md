# Testing Patterns

**Analysis Date:** 2026-02-16

## Test Framework

**Status:** Testing framework not detected

**Note:** This codebase does not currently have Jest, Vitest, or any automated test suite configured. No `.test.ts`, `.spec.ts`, or test configuration files found in the project.

**Build/Type Checking:**
- TypeScript type checking: `pnpm types` (runs `tsc --noEmit --pretty`)
- Linting: `pnpm lint` (via Biome.js)
- Formatting check: `pnpm format:check` (via Biome.js)

**Run Commands:**
```bash
# Type checking
pnpm types                # Check TypeScript types without building

# Linting
pnpm lint                 # Run Biome linting check
pnpm lint:fix             # Fix linting issues

# Formatting
pnpm format               # Format with Biome
pnpm format:fix           # Fix formatting with Biome

# Combined checks
pnpm check                # Run linting with unsafe fixes
```

## Testing Strategy

**Current Approach:**
- No automated unit or integration tests configured
- Validation via TypeScript strict mode (`strict: true` in `tsconfig.json`)
- Input validation using Zod schemas
- Manual testing via development server

**Type Safety:**
- Strict TypeScript configuration enabled
- `strictNullChecks: true` prevents null/undefined errors
- Type-driven development using interfaces for props and data structures

**Validation:**
- Zod schemas for runtime validation (e.g., `src/schemas/email.schema.ts`)
- Schema validation in API routes before processing
- Error handling with validation issue reporting

**Example Validation Pattern** (`src/app/api/send/route.ts`):
```typescript
const validation = emailSchema.safeParse(body);
if (!validation.success) {
	return Response.json(
		{
			error: 'Données invalides',
			details: validation.error.issues,
		},
		{ status: 400 }
	);
}
```

## Code Safety Mechanisms

**TypeScript Strict Mode:**
- Enforces type annotations on function parameters and return values
- Prevents implicit `any` types
- Requires null/undefined handling

**Zod Schema Validation:**
- Email schema with min/max length constraints
- Custom error messages for validation failures
- `safeParse()` returns validation result without throwing

**Environment Variable Safety:**
- Required env vars: `GITHUB_API_TOKEN`, `GITHUB_USERNAME`, `GITHUB_REPO_NAME`, `RESEND_API_KEY`
- `.env.local` file required (not committed)
- Type-safe access via `process.env`

**Server Action Caching:**
- `unstable_cache()` with cache tags for invalidation
- Revalidation time set explicitly (e.g., 3600 seconds)
- Data fetching wrapped with cache configuration

## API Route Error Handling

**Pattern:** All API routes follow consistent error handling (`src/app/api/`)

```typescript
// Health check with cache headers (src/app/api/health/route.ts)
const headers = {
	'Cache-Control': 'public, max-age=300, s-maxage=300',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'X-Health-Status': 'OK',
	'Content-Type': 'text/plain',
} as const;

export const GET = (): NextResponse =>
	new NextResponse('OK', { status: 200, headers });

// Email API with validation and error handling (src/app/api/send/route.ts)
export const POST = async (request: Request): Promise<Response> => {
	try {
		const body = (await request.json()) satisfies BodyData;
		const validation = emailSchema.safeParse(body);
		if (!validation.success) {
			return Response.json(
				{
					error: 'Données invalides',
					details: validation.error.issues,
				},
				{ status: 400 }
			);
		}
		// Process request
		if (error) {
			return Response.json(
				{ error: "Erreur lors de l'envoi du mail !" },
				{ status: 500 }
			);
		}
		return Response.json({ message: 'Email envoyé avec succès ! ' });
	} catch {
		return Response.json(
			{ error: 'Une erreur serveur est survenue !' },
			{ status: 500 }
		);
	}
};
```

## Server Actions Testing

**Approach:** Server Actions include error handling and logging

**Example** (`src/actions/github/data.action.ts`):
```typescript
'use server';

import { unstable_cache } from 'next/cache';
import { octokit } from '@/lib/octokit';
import { DATA_QUERY } from '@/queries/github/data.query';

const CACHE_TAG = 'github-user-data';
const CACHE_REVALIDATE = 3600;

const fetchGitHubData = async (): Promise<GitHubData> => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const from = new Date(`${currentYear}-01-01T00:00:00Z`);
	const to = new Date(`${currentYear}-12-31T23:59:59Z`);

	// GraphQL query with error boundaries
	const { user } = await octokit<GitHubDataResponse>(DATA_QUERY, {
		owner: process.env.GITHUB_USERNAME,
		repo: process.env.GITHUB_REPO_NAME,
		from: from.toISOString(),
		to: to.toISOString(),
	});

	// Transform data with null checks
	const contributions = user.contributionsCollection.contributionCalendar.weeks
		.flatMap((week) => week.contributionDays)
		.map((day) => ({
			date: day.date,
			count: day.contributionCount,
			level: contributionLevelToNumber(day.contributionLevel),
		}));

	return { login: user.login, name: user.name, ... };
};

export const getGitHubData = unstable_cache(fetchGitHubData, [CACHE_TAG], {
	revalidate: CACHE_REVALIDATE,
	tags: [CACHE_TAG],
});
```

## Component Testing Approach

**Manual Testing:**
Development server runs on port 1408 for manual testing of components and features.

**Type Safety for Components:**
- Props interfaces define expected inputs
- TypeScript prevents invalid prop usage at compile time
- Optional props marked with `?` in interfaces

**Example** (`src/components/animations/Particles.tsx`):
```typescript
interface SparklesProps {
	density?: number;
}

export const Particles = memo(function Sparkles({
	density = 50,
}: SparklesProps) {
	const { resolvedTheme } = useTheme();
	const [ready, setReady] = useState(!!Cached);

	useEffect(() => {
		if (Cached || !canRender()) {
			return;
		}
		// Lazy load particle engine
	}, []);

	// Render only when ready
	if (!(ready && Cached)) {
		return null;
	}

	return <Cached className="size-full" id="tsparticles" options={options} />;
});
```

## Browser Testing

**Compatibility Checks:**
- Reduced motion detection (`prefers-reduced-motion: reduce`)
- Hardware capability checking (`navigator.hardwareConcurrency`)
- Feature detection for APIs (e.g., clipboard API)

**Example** (`src/components/animations/Particles.tsx`):
```typescript
const canRender = (): boolean => {
	if (typeof window === 'undefined') {
		return false; // SSR check
	}
	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;
	return !reducedMotion && (navigator.hardwareConcurrency ?? 2) > 2;
};
```

## Utility Function Testing

**Strategy:** Utilities tested via TypeScript type safety and error handling

**Clipboard Utility Example** (`src/lib/utils.ts`):
```typescript
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
```

**URL Utility Example**:
```typescript
export const addQueryParams = (
	urlString: string,
	query: Record<string, string>
): string => {
	try {
		const url = new URL(urlString, dummyBase);
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, value);
			}
		}
		return isRelative ? url.pathname + url.search : url.toString();
	} catch (_error) {
		return urlString; // Graceful fallback
	}
};
```

## Build Verification

**Registry Build:**
```bash
pnpm registry:build
```
Builds the custom shadcn component registry for distribution.

**Production Build:**
```bash
pnpm build
```
Creates optimized Next.js build with TypeScript checking.

**Type Checking Before Build:**
The `pnpm types` command should be run before commits to catch type errors early.

## Environment Testing

**Required Environment Variables:**
- `GITHUB_API_TOKEN` - GitHub GraphQL API authentication
- `GITHUB_USERNAME` - GitHub username for data fetching
- `GITHUB_REPO_NAME` - Repository name for contribution data
- `RESEND_API_KEY` - Email service API key
- `NEXT_PUBLIC_APP_URL` - Application URL for absolute URL generation

**Development (.env.local):**
All environment variables must be set in `.env.local` (not committed) for local testing.

---

*Testing analysis: 2026-02-16*
