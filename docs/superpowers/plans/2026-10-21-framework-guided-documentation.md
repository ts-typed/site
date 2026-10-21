# Framework-guided documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the TS Typed documentation practical to navigate, with global concepts, framework-specific expandable submenus, guided previous/next navigation, and contextual concept links.

**Architecture:** A typed documentation catalog becomes the sole source of truth for global/framework pages, route resolution, sidebar ordering, footer neighbors, and deepening links. Angular routes distinguish global Markdown from framework Markdown; a shared layout renders the catalog in desktop and mobile navigation. Content is organized by locale and context, with specialised components retained only where the existing visual page is intentional.

**Tech Stack:** Angular 22 standalone components, Angular Router/SSR, Signals, Vitest, Tailwind CSS, ngx-markdown.

**Spec:** `docs/superpowers/specs/2026-10-21-framework-guided-documentation-design.md`

## Global Constraints

- Do not commit, push, publish, or change packages/CLI repositories.
- Keep Portuguese and English page matrices equivalent.
- Do not invent final CLI options or commands; reconcile those examples only after the parallel CLI work finishes.
- Global URLs remain `/:lang/docs/:version/:slug`; framework URLs are `/:lang/docs/:version/:framework/:slug`.
- Global navigation stays visible; TypeScript, Express, and NestJS are accessible expandable groups.
- Use strict TypeScript, standalone OnPush components, signal-derived state, and no unsafe URL interpolation.

## Review Focus

- A legacy ambiguous URL such as `/pt/docs/0.1/requests` must not accidentally display a global or arbitrary framework page.
- A framework page must never resolve content from a different version or language.
- Footer “next” after the last framework page must move to the documented global deepening flow, not a missing route.
- Sidebar and footer must resolve order from the same catalog, including when a page is unavailable for a framework.
- Keyboard users must be able to expand/collapse framework groups and activate every navigation target.

## File Structure

- `src/app/docs-catalog.ts`: typed catalog, route/content resolution and pure navigation helpers.
- `src/app/pages/docs/document-navigation.component.ts`: reusable footer with previous/next and contextual deepening links.
- `src/app/pages/docs/framework-choice.component.ts`: safe resolver UI for ambiguous legacy framework links.
- `src/app/pages/docs/docs-layout.component.ts`: desktop/mobile global navigation plus expandable framework groups.
- `src/app/pages/docs/doc-page.component.ts`: Markdown resolution from catalog and page-level footer.
- `src/app/app.routes.ts`: explicit global, framework and legacy-ambiguity routes.
- `public/docs/{en,pt}/...`: global content; `public/docs/{en,pt}/{framework}/...`: framework-specific content.
- `src/app/pages/docs/*.spec.ts`: catalog, routing, layout and footer behavior tests.

### Task 1: Create the documentation catalog

**Files:**
- Create: `src/app/docs-catalog.ts`
- Create: `src/app/docs-catalog.spec.ts`
- Modify: `src/app/docs-sections.ts`

**Interfaces:**
- Produces: `DocumentationFramework`, `DocumentationPage`, `findDocumentationPage`, `getNavigationItems`, `getDocumentNeighbors`, `getDeepeningLinks` and safe route/content-path builders.
- Consumes: `DocumentationVersion` and the supported language contract.

- [ ] **Step 1: Write failing catalog tests**

Cover global-vs-framework resolution, framework submenu contents, safe rejection of unknown framework/slug, framework completion returning to its configured global follow-up, and deepening links resolving to global pages.

- [ ] **Step 2: Run the catalog tests to verify they fail**

Run: `npm test -- --run src/app/docs-catalog.spec.ts`

Expected: FAIL because the catalog does not exist.

- [ ] **Step 3: Implement the typed catalog and migrate the old flat section list**

Use literal unions and readonly metadata. Model ordering, titles, context, content filenames, footer flow, and at most three deepening references per page in one source of truth.

- [ ] **Step 4: Run the catalog tests to verify they pass**

Run: `npm test -- --run src/app/docs-catalog.spec.ts`

Expected: PASS.

### Task 2: Add canonical routing and safe legacy handling

**Files:**
- Create: `src/app/pages/docs/framework-choice.component.ts`
- Create: `src/app/pages/docs/framework-choice.component.spec.ts`
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/pages/docs/doc-page.component.ts`
- Create or modify: route/component specs as needed

**Interfaces:**
- Consumes: catalog route resolution from Task 1.
- Produces: canonical rendering of global/framework pages and a choice screen for ambiguous legacy framework links.

- [ ] **Step 1: Write failing route and chooser tests**

Assert global overview renders without framework, a canonical Nest route resolves only Nest content, and an ambiguous `requests` legacy route exposes the three valid framework choices without accepting an arbitrary return destination.

- [ ] **Step 2: Run focused tests to verify they fail**

Run: `npm test -- --run src/app/pages/docs/framework-choice.component.spec.ts`

Expected: FAIL because the component and routes do not exist.

- [ ] **Step 3: Implement routes and catalog-driven Markdown resolution**

Use route data/params resolved through the catalog, preserve version and language, and render a recoverable unavailable/not-found state instead of a blank Markdown area.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `npm test -- --run src/app/pages/docs/framework-choice.component.spec.ts`

Expected: PASS.

### Task 3: Build global and expandable framework navigation

**Files:**
- Modify: `src/app/pages/docs/docs-layout.component.ts`
- Create: `src/app/pages/docs/docs-layout.component.spec.ts`
- Modify: `src/styles.css`
- Modify: `public/i18n/en.json`
- Modify: `public/i18n/pt.json`

**Interfaces:**
- Consumes: catalog navigation groups from Task 1 and route state from Task 2.
- Produces: equivalent desktop/mobile menus with global links and accessible framework expansion.

- [ ] **Step 1: Write failing layout tests**

Assert global items remain visible, a framework trigger exposes `aria-expanded`, expands its submenu by keyboard/click, marks the active framework/page, and mobile drawer retains equivalent controls.

- [ ] **Step 2: Run layout tests to verify they fail**

Run: `npm test -- --run src/app/pages/docs/docs-layout.component.spec.ts`

Expected: FAIL because framework groups are absent.

- [ ] **Step 3: Implement catalog-driven sidebar and drawer groups**

Use signal state for expansion, retain version selection, and make a group title navigate to its framework overview while its separate control expands/collapses the submenu.

- [ ] **Step 4: Run layout tests to verify they pass**

Run: `npm test -- --run src/app/pages/docs/docs-layout.component.spec.ts`

Expected: PASS.

### Task 4: Add contextual deepening and sequential footer navigation

**Files:**
- Create: `src/app/pages/docs/document-navigation.component.ts`
- Create: `src/app/pages/docs/document-navigation.component.spec.ts`
- Modify: `src/app/pages/docs/doc-page.component.ts`
- Modify: `src/styles.css`
- Modify: `public/i18n/en.json`
- Modify: `public/i18n/pt.json`

**Interfaces:**
- Consumes: catalog neighbors and deepening links from Task 1.
- Produces: accessible previous/next controls and optional localized “Go deeper”/“Aprofunde-se” links.

- [ ] **Step 1: Write failing footer tests**

Assert a typed-boundaries page renders the localized central-concepts hint, a middle page renders both neighbors, the first/last pages omit only the unavailable neighbor, and the final framework page points to its configured global continuation.

- [ ] **Step 2: Run footer tests to verify they fail**

Run: `npm test -- --run src/app/pages/docs/document-navigation.component.spec.ts`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the reusable footer component**

Render no more than three catalog-provided deepening links above the navigation. Build every destination with Angular Router commands, never concatenated unvalidated URLs.

- [ ] **Step 4: Run footer tests to verify they pass**

Run: `npm test -- --run src/app/pages/docs/document-navigation.component.spec.ts`

Expected: PASS.

### Task 5: Author and migrate the practical documentation journey

**Files:**
- Create/modify: `public/docs/en/*.md`, `public/docs/pt/*.md`
- Create: `public/docs/en/{typescript,express,nestjs}/*.md`
- Create: `public/docs/pt/{typescript,express,nestjs}/*.md`
- Modify: `src/app/pages/docs/getting-started.component.ts` and its spec, or replace it when the catalog makes the dedicated component redundant

**Interfaces:**
- Consumes: content paths declared in Task 1.
- Produces: complete PT/EN global and framework-specific page matrix.

- [ ] **Step 1: Write failing content-matrix tests**

For every declared page and locale, assert its Markdown asset exists. Assert the catalog has global overview/first steps/configuration/concepts/Value Objects/optimizations/limitations/performance/benchmarks and framework pages for implementation, errors, responses, examples, and practices where applicable.

- [ ] **Step 2: Run content-matrix tests to verify they fail**

Run: `npm test -- --run src/app/docs-catalog.spec.ts`

Expected: FAIL because the new framework assets are absent.

- [ ] **Step 3: Write and migrate documentation content**

Keep shared API semantics in global pages. Put installation and `init` flow, request/DTO implementation, response optimization, errors, complete examples, and framework practices inside the appropriate framework directory. Mark CLI-dependent copy for final verification rather than guessing unconfirmed flags.

- [ ] **Step 4: Run content-matrix tests to verify they pass**

Run: `npm test -- --run src/app/docs-catalog.spec.ts`

Expected: PASS.

### Task 6: Reconcile the CLI behavior and verify the integrated site

**Files:**
- Modify: affected documentation assets and catalog metadata only when the completed parallel CLI changes require it
- Modify: affected specs to pin verified behavior

**Interfaces:**
- Consumes: completed CLI/package behavior and all previous site tasks.
- Produces: documentation examples verified against the current implementation.

- [ ] **Step 1: Write or update failing assertions for final CLI-dependent behavior**

Cover the exact package installation, `init` choices/defaults, validators opt-in, global filter/handler setup, scripts, and declined-option outcomes exposed by the completed CLI.

- [ ] **Step 2: Run the focused assertions to verify they fail when the site still disagrees**

Run: `npm test -- --run src/app/docs-catalog.spec.ts`

Expected: FAIL only if the current documentation differs from confirmed CLI behavior.

- [ ] **Step 3: Reconcile copy and examples with observed CLI behavior**

Do not add behavior that the CLI does not perform. Record any unsupported requested flow in the implementation ledger as a ruling.

- [ ] **Step 4: Run full verification**

Run: `npm test && npm run build`

Expected: PASS with SSR build complete.

## Plan self-review

- Spec coverage: Tasks 1–4 cover route/catalog/navigation/footer design; Task 5 covers the full content journey; Task 6 covers the required wait-and-reconcile behavior for the parallel CLI work.
- Shared interfaces: Tasks 2–5 consume Task 1 catalog contracts; names and responsibilities are consistent.
- Review focus: each listed failure mode is asserted in Tasks 1–4.
- Constraint deviation: the plan intentionally omits commit steps because the user explicitly prohibited commits and pushes.
