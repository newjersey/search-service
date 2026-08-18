# grants-search example

A minimal, working Next.js integration of the NJIA faceted search toolkit — copy the pattern shown here into a real project rather than starting from scratch.

## What this shows

- `src/db.ts` — a Kysely + `pg` connection. Point `GRANTS_DATABASE_URL` at a database role with **read-only access to the `grants` table only** — never your application's full credentials.
- `src/searchConfig.ts` — the backend facet config (`@newjersey/search-query`)
- `src/facetUIConfig.ts` — the frontend facet config (`@newjersey/search-ui`)
- `src/nextUrlAdapter.ts` — a custom `SearchUrlAdapter` so Next's router notices filter changes in the URL, not just the browser's address bar. Because it calls `useSearchParams()`, the page using it must be wrapped in a `<Suspense>` boundary (see `app/grants/page.tsx`) — a standard Next.js App Router requirement, not something specific to this toolkit.
- `app/api/grants/search/route.ts` — the thin API route handler: parse request, call `runSearch`, map errors to status codes
- `app/grants/page.tsx` — the frontend page: `useSearch` + the pre-built `SearchFilters`, `SortControl`, and `Pagination` components, rendering distinct loading/error/empty/results states

## Expected schema

    create table grants (
      id serial primary key,
      title text not null,
      description text not null,
      status text not null,
      category text not null,
      funding_amount numeric not null,
      application_deadline date not null
    );

## Running it

1. Point `GRANTS_DATABASE_URL` at a Postgres database with the `grants` table above (and `pg_trgm` enabled: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`).
2. `npm install && npm run dev`
3. Visit `/grants`.

## Verifying the config against a real database without running the whole app

`test/searchConfig.integration.test.ts` spins up a disposable Postgres via Testcontainers, seeds two rows matching the schema above, and calls `runSearch` directly with `searchConfig.ts` — useful for confirming a config change is valid without needing the frontend or a real long-lived database.

## A note on relative imports here

This example uses `moduleResolution: "bundler"` (Next.js's own convention), not the `NodeNext` setting the three `@newjersey/*` packages use — so relative imports here are written *without* a `.js` extension (e.g. `from '../../src/db'`), unlike inside `packages/*`. Copying the `.js`-extension style from those packages into this app will fail to resolve under Turbopack.
