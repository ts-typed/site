# ts-typed/site

The documentation and marketing website for [TS Typed](https://ts-typed.com) — `@ts-typed/compiler`, `@ts-typed/nestjs`, and `@ts-typed/validators`.

This is a standalone Angular 22 app (SSR via `@angular/ssr`), not a submodule of the main [ts-typed/ts-typed](https://github.com/ts-typed/ts-typed) repository. Full documentation content lives under `public/docs/{en,pt}/*.md`; each package's own README keeps a concise summary.

## Stack

- Angular 22, standalone components, SSR (`provideServerRendering`)
- Tailwind CSS v4 (`@tailwindcss/postcss`), dark mode by default
- `@ngx-translate/core` + `@ngx-translate/http-loader` for i18n (English + Portuguese, auto-detected from the browser's language)
- `ngx-markdown` to render the documentation content, authored as plain Markdown files in `public/docs/`

## Development

```bash
npm install
npm run start   # dev server, http://localhost:4200
npm run build   # production build (browser + server bundles)
```

## Structure

- `src/app/pages/landing/` — the marketing landing page (hero, features, metrics, install snippet).
- `src/app/pages/docs/` — the documentation layout (sidebar + routed doc pages).
- `src/app/services/metrics.service.ts` — fetches GitHub stars + npm monthly downloads client-side, summed across all three packages.
- `src/app/services/language.service.ts` — language detection/persistence (`en`/`pt`, defaulting to `en`).
- `public/docs/en/`, `public/docs/pt/` — the actual documentation content, one Markdown file per section.
- `public/i18n/en.json`, `public/i18n/pt.json` — UI string translations (nav, landing copy, doc section titles).

## Deployment

Deployment (Cloudflare, DNS for `ts-typed.com`) is handled separately — this repository only contains the application itself.

## License

Apache-2.0
