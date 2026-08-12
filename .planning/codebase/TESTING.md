# Testing Patterns

**Analysis Date:** 2026-08-12

> The 2026-02-16 snapshot recorded "testing framework not detected". There are now
> 106 unit tests and 58 end-to-end tests, and CI runs both.

## Test Framework

**Unit — Vitest 4** (`vitest.config.ts`, `vitest.setup.ts`), jsdom environment,
Testing Library available (`@testing-library/react`, `/dom`, `/jest-dom`,
`/user-event`).

**End-to-end — Playwright 1.60** (`playwright.config.ts`), Chromium only,
`baseURL` `http://localhost:1408`, `trace: "on-first-retry"`, 2 retries in CI.

```bash
pnpm test          # vitest run
pnpm test:watch    # vitest
pnpm test:e2e      # playwright test
pnpm types         # tsc --noEmit (needs pnpm i18n:compile on a fresh clone)
pnpm lint          # oxlint
pnpm format        # oxfmt --check
pnpm check         # lint + format
```

Two environment escape hatches on the e2e side:

- `PLAYWRIGHT_WEB_SERVER` replaces the default `pnpm preview` when a build already
  exists (CI uses it to avoid building twice).
- `PLAYWRIGHT_CHROMIUM_PATH` points at an already-installed Chromium when the local
  build differs from the one `@playwright/test` expects.

## Testing Strategy

**What is unit tested:** the pure modules in `src/lib/` — `search`, `related`,
`feed`, `github-stats`, `rate-limit`, `jwt`, `diff`, `hash`, `tags`, `metadata`.

**Reference values come from outside the code under test.** Hash expectations were
computed with Node's `crypto` / Python, not by calling the function being tested. A
test that recomputes with the same implementation asserts nothing.

**What is end-to-end tested:** everything that only exists in a browser — keyboard
behaviour, scroll, client-side filtering, CSP, response headers.

| Spec | Covers |
|---|---|
| `e2e/i18n.spec.ts` | both trees render in the right language, no hydration errors, locale switch |
| `e2e/csp.spec.ts` | CSP and HSTS headers, plus every page type loaded with a `securitypolicyviolation` listener |
| `e2e/search.spec.ts` | ⌘K palette: shortcuts, body-only full-text matches, diacritic-insensitivity, navigation, EN index |
| `e2e/feeds.spec.ts` | RSS 2.0 and JSON Feed shape, per-category filtering, XML escaping, plain-text mirror in both languages |
| `e2e/reading.spec.ts` | related posts, table of contents, ←/→ navigation, progress bar, back to top, tablist keyboard contract |
| `e2e/utils-tools.spec.ts` | JWT decoder, hash generator, diff viewer |

**Testing across a network boundary is avoided.** Nothing in the suite calls GitHub
or Resend. The build tolerates an invalid `GITHUB_API_TOKEN`, which is what lets CI
run with a placeholder.

## Code Safety Mechanisms

Beyond the test suites, several guards fail loudly rather than degrade quietly:

- `compile-i18n.mts` compares compiled message count against `messages/fr.json` and
  exits 1 on a mismatch — a plugin that fails to load otherwise produces an empty
  bundle and a green build with every label missing.
- `assertValidDates` rejects frontmatter dates that are not real `YYYY-MM-DD` days.
  Zod's coercion turned `2026-02-30` into March 2nd and quietly reordered the feed.
- `src/env.ts` validates environment variables at startup.
- `lefthook` runs `pnpm fix` pre-commit and `pnpm types` pre-push.

## Traps Worth Knowing

Recorded because each one cost a debugging session:

- **A dead page passes a CSP test.** If the scripts never load, no violation is ever
  reported. `csp.spec.ts` therefore also fails when any `.js` request returns ≥ 400
  or errors — excluding `/_vercel/*`, which legitimately 404s off-platform.
- **A stale server invalidates everything.** Running the suite against a `next start`
  from a previous build serves HTML referencing chunks that no longer exist. Always
  restart the server after a rebuild, and confirm the served HTML references chunks
  that exist on disk.
- **`getByRole("alert")` always matches one extra element:** Next.js keeps an empty
  `<div role="alert">` route announcer mounted. Scope to `p[role="alert"]`.
- **MDX bodies use `#` for sections,** so a content page has several `<h1>`, and the
  article body brings its own `<pre>` and `<li>` elements. Scope, or use `.first()`.
- **Animated tab panels coexist briefly.** `AnimatePresence` keeps the outgoing panel
  mounted, so `getByRole("tabpanel")` transiently resolves to two elements. Wait for
  the count to settle to 1 before asserting.
- **Anchors are not always valid CSS selectors.** A heading id like
  `4-mes-règles` starts with a digit; use `[id="…"]`. Fragments also arrive
  percent-encoded, so compare with `decodeURIComponent`.
- **`|` a regex with the `i` flag can widen a text locator** past the element you
  meant. Prefer a precise, unambiguous substring.
- **Masked exit codes.** `pnpm build | tail` reports the exit status of `tail`. Use
  `set -o pipefail` or check `${PIPESTATUS[0]}`.

## Build Verification

`pnpm build` is part of the definition of done, and verification happens against
build output rather than source where it matters — no `<a>` nested in a `<button>`,
tab roles actually present in the HTML, the EN mirror actually serving English, the
font preload count actually reduced.

## CI

`.github/workflows/ci.yml`, on pull requests and pushes to `master`:

1. **checks** — install, `i18n:compile`, `types`, `lint`, `format`, `test`
2. **e2e** — install, install Chromium, `build`, `test:e2e` (serving the build
   already produced), then upload the Playwright HTML report as an artifact

Installs use `--no-frozen-lockfile` and skip the pnpm cache because
`pnpm-lock.yaml` is git-ignored in this repository. Committing the lockfile would
make CI both reproducible and faster.

## Gaps

- No component-level tests: Testing Library is installed but unused. The e2e suite
  covers the interactive behaviour instead.
- No visual regression testing.
- Only Chromium is exercised. No Firefox or WebKit project is configured.
- `send-cv.action.ts` is not tested end to end; only its rate limiter is unit
  tested. Doing more would mean calling Resend.
- No accessibility scanner (axe) in the pipeline — a11y is asserted case by case in
  `reading.spec.ts` and `utils-tools.spec.ts`.
