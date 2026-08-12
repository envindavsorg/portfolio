# Coding Conventions

**Analysis Date:** 2026-08-12

> Superseded the 2026-02-17 snapshot, which documented kebab-case hooks, Biome and a
> `src/features/` layout — none of which apply now.

## Naming Patterns

**Files:**

- Components: PascalCase (`Panel.tsx`, `WritingsToC.tsx`, `HashGenerator.tsx`)
- Hooks: camelCase with a `use` prefix (`useMediaQuery.ts`, `useConfig.ts`) — the
  old kebab-case names are gone
- Libraries: kebab-case (`feed-routes.ts`, `rate-limit.ts`, `zod-config.ts`)
- Server actions: `<name>.action.ts`
- Scripts: `<name>.mts` / `<name>.ts` in `src/scripts/`
- Unit tests: `<module>.test.ts` beside the module
- e2e specs: `<topic>.spec.ts` in `e2e/`

`unicorn/filename-case` is disabled, so the convention is upheld by review, not by
the linter.

**Symbols:**

- Components and types: PascalCase
- Functions and variables: camelCase
- Module-level constants: SCREAMING_SNAKE_CASE (`GLOBAL_DATA`, `HASH_ALGORITHMS`,
  `CSP_DIRECTIVES`, `MAX_LINES`)
- Booleans read as predicates (`isStuck`, `hasInput`, `prefersReducedMotion`)
- `data-slot="…"` on primitives, used both for styling hooks and as the only handle
  tests have on decorative elements

## Code Style

- **Formatting is not negotiable:** oxfmt via `pnpm fix`, enforced pre-commit by
  lefthook. Do not hand-format.
- Named exports everywhere; `export default` only where a framework demands it
  (pages, layouts, route configs).
- Arrow function components, typed with an explicit props interface.
- Props interfaces are named `<Component>Props` and declared just above the
  component.
- No `any`. `unknown` plus a narrowing helper when a type is genuinely open.
- Prefer `for…of` over `reduce` (`unicorn/no-array-reduce` is on).
- Destructure rather than repeat member access (`unicorn/prefer-destructuring`).
- Do not read a member straight off an `await` — assign first
  (`unicorn/no-await-expression-member`).
- Regexes carry the `u` flag; escape `]` and `-` inside classes accordingly.

## Import Organization

oxfmt sorts imports. The resulting order is: external packages, then `@/…` aliases,
then relative paths, with `import type` merged into the same groups.

- Always `@/*` for anything outside the current folder; relative paths only within
  a feature folder.
- Prefer `import type` — it keeps modules testable. `lib/search.ts` imports
  `Content` as a type on purpose: importing values from `content.ts` would drag the
  MDX pipeline and the component registry into every test run.
- Client-side Zod schemas import `z` from `@/lib/zod-config`, never from `zod`.

## React Patterns

- **Server Components by default.** `'use client'` goes on the smallest component
  that genuinely needs interactivity.
- **RSC boundary:** `Feature.tsx` (async, fetches) + `FeatureContent.tsx`
  (`'use client'`, receives plain props).
- `useCallback` / `useMemo` where identity matters despite the React Compiler; the
  compiler is not an excuse for unstable props into memoised children.
- Effects clean up. Listeners are removed, timers cleared, and async results are
  discarded when the input changed while they were in flight (see `HashGenerator`).
  `AbortController` + `{ signal }` is the preferred form for listener cleanup.
- `dynamic(async () => …)` for heavy widgets that are not needed on first paint.
- No `Slot`/`asChild` from radix; when a component needs `asChild`, wrap Base UI's
  `render` prop as `base/Collapsible.tsx` does.

## Class Names

- `cn()` from `@/lib/utils` for every conditional or merged class list.
- Variants through `class-variance-authority`, defined next to the component.
- Long class lists are split into logical `cn()` arguments (layout, then typography,
  then state) rather than one unreadable string.
- Tailwind only. There is no CSS file besides `globals.css`, and `@apply` is not
  used.

## Error Handling

- Remote calls return a typed fallback and log; they do not throw at the caller.
- Content validation throws at build time on purpose.
- Catch blocks are specific: swallow only what is expected, and never swallow into
  silence — `logger` gets the failure.
- User-facing errors go through Paraglide messages, never hardcoded strings.
- Rejections that are part of normal operation (rate limit, invalid token) are
  return values, not exceptions.

## Logging

`src/lib/logger.ts` exports a `tslog` logger (`minLevel` 3 in production, 0
otherwise). Use it in server code. `consola` is available for scripts. No bare
`console.*` in application code.

## Constants

- Module-level, SCREAMING_SNAKE_CASE, declared above first use.
- Static section data lives in a `content.ts` next to its section.
- Magic numbers get a name and, where the reason is not obvious, a comment
  (`REVEAL_AFTER_SCREENS`, `EXCERPT_LENGTH`, `MAX_HEADINGS`).
- `as const` on literal tuples that also drive a type
  (`HASH_ALGORITHMS`, `PACKAGE_MANAGERS`).

## Module Design

- One concern per module; extract to `src/lib/` as soon as logic is worth a test.
- Keep `src/lib/` modules free of React and, where possible, of the filesystem —
  that is what makes them testable.
- Side effects at import time are a bug, with one deliberate exception:
  `lib/zod-config.ts` applies a global Zod setting and re-exports `z` so the import
  is used and ordering is guaranteed.
- Clients for external services are built lazily when their credentials are
  optional (`getResend()`), because constructing them at module scope throws before
  any guard can run.

## Global Types

Ambient declarations live in `src/types/*.d.ts` as **top-level** declarations, with
no `declare global` wrapper: those files are scripts, not modules. Adding an
`export {}` turns them into modules, and the formatter then strips it — silently
disabling every global in the file.

## Comments

Comments in this codebase are written in **French** and explain *why*, never *what*.
The bar is: a comment earns its place if it records a decision, a constraint or a
trap that the code cannot express — a workaround for a library limitation, an
accessibility obligation, a bug that a naive rewrite would reintroduce. Restating
the code is noise.

JSDoc blocks go on exported functions whose contract is not obvious from the
signature.
