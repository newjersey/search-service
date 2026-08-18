# @newjersey/search-ui

React hooks and accessible components for faceted search: `useSearch` manages filter/sort/search/page state, syncs it to the URL, and fetches results; `SearchFilters`/`CheckboxGroupFilter`, `SortControl`, and `Pagination` are optional pre-built components for the filter panel, sort control, and pagination.

## Install

    npm install @newjersey/search-ui

React (`^18` or `^19`) is a peer dependency — install it in your app if it isn't there already.

## Usage

    import { useSearch, SearchFilters, SortControl, Pagination, defineFacetUI } from '@newjersey/search-ui'

    const grantsFacetUIConfig = defineFacetUI({
      status: { label: 'Status', control: 'checkboxGroup' },
      category: { label: 'Category', control: 'checkboxGroup' },
    })

    const sortOptions = [
      { value: 'deadline-asc', label: 'Deadline: soonest first', field: 'deadline', direction: 'asc' },
      { value: 'deadline-desc', label: 'Deadline: latest first', field: 'deadline', direction: 'desc' },
    ]

    function GrantsPage() {
      const { status, results, filters, setFilter, sort, setSort, page, setPage, pageSize } = useSearch(
        grantsFacetUIConfig,
        { endpoint: '/api/grants/search' },
      )

      return (
        <>
          <SearchFilters
            config={grantsFacetUIConfig}
            filters={filters}
            facetCounts={results?.facetCounts}
            onFilterChange={setFilter}
          />
          <SortControl label="Sort by" options={sortOptions} value={sort} onChange={setSort} />
          {/* render results yourself — see the full example for loading/error/empty states */}
          {results && (
            <Pagination page={page} pageSize={pageSize} total={results.total} onPageChange={setPage} />
          )}
        </>
      )
    }

By default, URL state syncs via the plain browser History API. If you want your framework's router to notice the change too (e.g. Next.js), pass a custom `urlAdapter` implementing `SearchUrlAdapter` — see `../../examples/grants-search/src/nextUrlAdapter.ts` for a working example.

Only `multiSelect` facets are supported in v1 — there's no pre-built range-filter UI (see the implementation plan for why).

Full working example: `../../examples/grants-search`.
