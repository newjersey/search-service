# @newjersey/search-query

A Postgres query builder (built on Kysely) that turns a declarative facet config plus a `SearchRequest` into results, a total count, and self-excluding facet counts.

## Install

    npm install @newjersey/search-query kysely pg

## Usage

    import { defineSearchConfig, runSearch } from '@newjersey/search-query'

    const grantsSearchConfig = defineSearchConfig({
      table: 'grants',
      filters: {
        status: { column: 'status', type: 'multiSelect' },
        category: { column: 'category', type: 'multiSelect' },
      },
      sort: { deadline: 'application_deadline' },
      search: { columns: ['title', 'description'] },
    })

    // in your own API route handler:
    const result = await runSearch(db, grantsSearchConfig, request)

`db` is a `Kysely` instance you create and connect yourself — this package never manages credentials or connects to the database on its own. Give it a database role scoped to read access on your searchable tables, not full application credentials.

Only `multiSelect` facets are supported in v1 — range/numeric filters were considered and dropped from scope (see the `search-ui` implementation plan for why).

Full working example, including the route handler: `../../examples/grants-search`.
