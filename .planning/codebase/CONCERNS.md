# Codebase Concerns

**Analysis Date:** 2026-08-12

> Superseded the 2026-02-17 snapshot. Its items are resolved: the dark-mode script is
> injected once, GitHub failures no longer break the build, and there is now a test
> suite. The concerns below are the current ones.

---

## Tech Debt

**`pnpm-lock.yaml` is git-ignored**

- Files: `.gitignore` (listed under "# debug", next to `pnpm-debug.log*`, which
  suggests a copy-paste rather than a decision)
- Impact: installs are not reproducible. CI resolves versions on every run, so a
  breaking upstream release lands without any change to the repository, and the
  pnpm cache in `actions/setup-node` cannot be used (it derives its key from the
  lockfile). Vercel builds have the same exposure.
- Fix: commit the lockfile and switch CI to `--frozen-lockfile`. This is a
  repository-policy change, hence flagged rather than applied.

**`BLOB_READ_WRITE_TOKEN` is declared but unused**

- Files: `src/env.ts`
- Impact: dead configuration. It belonged to the removed Vercel Blob follower
  count, and its presence suggests a feature that no longer exists.

**Testing Library is installed but unused**

- Files: `package.json`, `vitest.setup.ts`
- Impact: four `@testing-library/*` packages and jsdom carried for no test. Either
  add component tests or drop the dependencies.

**`import/no-cycle` is disabled**

- Files: `oxlint.config.ts`
- Impact: oxlint 1.68 OOMs on the `(fr)`/`en` re-export graph, so the rule is off
  and a genuine import cycle would now go unnoticed. Worth re-enabling when oxlint
  can handle the graph.

**No `.env.example`**

- Impact: the required variables are documented in CLAUDE.md and INTEGRATIONS.md
  only. A fresh clone cannot be started from the repository alone.

---

## Security Considerations

**`script-src` keeps `'unsafe-inline'`**

- Files: `next.config.ts`
- Why: the App Router streams the RSC payload through dozens of inline `<script>`
  tags whose content changes per page and per build, and pages add inline JSON-LD.
  Nonces would require a middleware and therefore dynamic rendering — the opposite
  of this site's static-first design. Hashes cannot be precomputed for content that
  changes every build.
- Consequence: the CSP does not defend against injected inline script. It does close
  `base-uri`, `object-src`, `form-action`, `frame-ancestors` and the load origins,
  all of which are real attack surfaces.
- Guard: `e2e/csp.spec.ts` fails if any directive blocks a legitimate resource, and
  fails if the page's scripts did not load (a dead page reports no violations).

**No CSP reporting**

- Files: `next.config.ts`
- Impact: no `report-to` / `report-uri`, so a violation in production is invisible.
  Only the e2e suite catches policy mistakes, and only for the pages it lists.

**Rate limiting is in-process**

- Files: `src/lib/rate-limit.ts`, `src/actions/send-cv.action.ts`
- Impact: on serverless each instance keeps its own window, so the effective limits
  are multiplied by the number of live instances. It stops casual abuse, not a
  determined sender. A shared store (KV, Redis) would be needed for a real limit.

**No error tracking**

- Impact: a section that throws renders its `SectionBoundary` fallback and reports
  nothing off-platform. Failures are only visible in Vercel logs, if someone looks.

**Service worker version is bumped by hand**

- Files: `public/sw.js`
- `VERSION` gates cache names, and nothing forces it to change on deploy.
  Correctness does not depend on it — HTML is network-first and static assets are
  content-hashed, so a stale cache holds unused entries rather than wrong ones —
  but old caches survive longer than needed.

---

## Performance Bottlenecks

**The search index ships in every page's RSC payload**

- Files: `src/components/layout/navbar/NavBar.tsx`, `src/lib/search.ts`
- The navbar is site chrome, so its props are serialised into every page. `SearchDoc`
  is deliberately compact (title, description, tags, headings, 400-char excerpt)
  after full `Content` objects — entire MDX bodies — were being embedded. It still
  grows linearly with the number of posts; past a few dozen it will need to move
  behind a fetch.

**MDX plugins read component sources at build time**

- Files: `src/lib/rehype-component.ts`, `src/lib/remark-component.ts`
- Turbopack emits an "unexpected file in NFT list" warning as a result. Known,
  accepted, and documented — but it means the build's file graph is not fully
  statically known.

**Tab transitions swallow keyboard input**

- Files: `src/components/primitives/Tabs.tsx`
- `handleTabClick` refuses to switch while the panel is animating (~400 ms). Focus
  and selection now stay in sync, but a held arrow key feels unresponsive. Making
  the animation interruptible would remove the compromise.

---

## Fragile Areas

**`assertValidDates` parses raw frontmatter with a regex**

- Files: `src/lib/content.ts`
- It splits the file on `---` and scans for date fields before `gray-matter` runs,
  because validation has to happen before Zod coerces. Unusual frontmatter
  formatting would slip past it.

**The `(fr)` / `en` duplication**

- Files: `src/app/(fr)/**`, `src/app/en/**`
- The English pages are thin, but every new route needs two files and every new
  string needs two message entries. Drift is the normal failure mode here — the
  English `.mdx` mirror was missing for months, so "Copy Markdown" on `/en` returned
  French source. `e2e/i18n.spec.ts` and `e2e/feeds.spec.ts` now cover the cases that
  drifted.

**`PanelHeader` has two rendering modes**

- Files: `src/components/base/Panel.tsx`
- `sticky` selects between two different trees. The `title` prop used to be dropped
  silently in the non-sticky branch (the "à lire aussi" panel shipped with no
  heading at all); it now renders in both, but a component with two shapes remains
  easy to misuse.

**Arrow-key shortcuts are global**

- Files: `src/components/features/WritingsShortcuts.tsx`
- A `document`-level ←/→ listener changes page. It now bails on
  `event.defaultPrevented` and inside form fields, but any future widget with arrow
  semantics must call `preventDefault()` or it will eject the visitor from the page.

**Two contrast debts remain, listed in `a11y.spec.ts`**

- The theme colour reaches 4.49:1 against the light background where 4.5 is
  required, and a Shiki light-theme token reaches 3.48:1 inside code blocks. Both
  are design tokens: fixing them changes the site's appearance everywhere. They are
  enumerated in the spec so any NEW violation still fails.

**Content pages have several `<h1>`**

- Files: `src/content/**/*.mdx`
- MDX bodies use `#` for their sections, so each page renders a page-title `<h1>`
  plus one per section. The document outline is flat, which is a real accessibility
  and SEO weakness. Fixing it means rewriting every MDX file to start at `##`.

---

## Scaling Limits

- **Content volume:** everything is read from disk at build time and the index is
  embedded in every page. Fine at ~17 posts; the index needs rethinking well before
  a few hundred.
- **Locales:** the two-root-layout pattern does not generalise. A third locale would
  mean a third tree and a third copy of every page.
- **Rate limiting:** in-process, as above.
- **Registry:** `pnpm registry:build` regenerates everything; there is no incremental
  mode.

---

## Dependencies at Risk

- **`@base-ui/react` 1.5** — young library, and the codebase is committed to it
  since radix cannot be reintroduced (its `Slot`/`asChild` breaks hydration under
  React 19.2). Breaking changes would be expensive.
- **`next-mdx-remote` 6** — needs `transpilePackages`, which signals friction with
  the current Next version.
- **`oxlint` / `oxfmt` / `ultracite`** — fast-moving pre-1.0-feel tooling that
  already required disabling `import/no-cycle`.
- **`@inlang/paraglide-js`** — the server-locale approach relies on
  `overwriteGetLocale`, an official workaround rather than a stable API.
- **Zod 4's JIT** — `lib/zod-config.ts` depends on `jitless` remaining available.
- Floating version ranges everywhere (`^`) with no committed lockfile amplify all of
  the above.

---

## Test Coverage Gaps

- No component tests (see Tech Debt).
- Only Chromium is exercised; no Firefox or WebKit project.
- No visual regression testing.
- `send-cv.action.ts` is not covered end to end — only its rate limiter is unit
  tested, since anything further would call Resend.
- No automated accessibility scan; a11y is asserted case by case in the e2e specs.
- The CSP spec covers a fixed list of nine pages, so a new page type is not checked
  until someone adds it.
