'use client'

import { Suspense } from 'react'
import { useSearch, SearchFilters, SortControl, Pagination } from '@newjersey/search-ui'
import type { SortOption } from '@newjersey/search-ui'
import { grantsFacetUIConfig } from '../../src/facetUIConfig'
import { useNextUrlAdapter } from '../../src/nextUrlAdapter'

interface Grant {
  id: number
  title: string
  description: string
  status: string
  category: string
  funding_amount: number
  application_deadline: string
}

const sortOptions: SortOption[] = [
  { value: 'deadline-asc', label: 'Deadline: soonest first', field: 'deadline', direction: 'asc' },
  { value: 'deadline-desc', label: 'Deadline: latest first', field: 'deadline', direction: 'desc' },
  { value: 'amount-desc', label: 'Funding amount: highest first', field: 'amount', direction: 'desc' },
  { value: 'amount-asc', label: 'Funding amount: lowest first', field: 'amount', direction: 'asc' },
]

export default function GrantsSearchPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <GrantsSearchContent />
    </Suspense>
  )
}

function GrantsSearchContent() {
  const urlAdapter = useNextUrlAdapter()
  const { status, results, error, filters, setFilter, sort, setSort, page, setPage, pageSize } = useSearch<Grant>(
    grantsFacetUIConfig,
    {
      endpoint: '/api/grants/search',
      urlAdapter,
    },
  )

  return (
    <div>
      <h1>Grants</h1>

      <SearchFilters
        config={grantsFacetUIConfig}
        filters={filters}
        facetCounts={results?.facetCounts}
        onFilterChange={setFilter}
      />

      <SortControl label="Sort by" options={sortOptions} value={sort} onChange={setSort} />

      {status === 'loading' && <p>Loading…</p>}

      {status === 'error' && <p role="alert">Something went wrong: {error?.message}</p>}

      {status === 'success' && results && results.rows.length === 0 && <p>No grants match your filters.</p>}

      {status === 'success' && results && results.rows.length > 0 && (
        <ul>
          {results.rows.map((grant) => (
            <li key={grant.id}>
              <h2>{grant.title}</h2>
              <p>{grant.description}</p>
            </li>
          ))}
        </ul>
      )}

      {status === 'success' && results && (
        <Pagination page={page} pageSize={pageSize} total={results.total} onPageChange={setPage} />
      )}
    </div>
  )
}