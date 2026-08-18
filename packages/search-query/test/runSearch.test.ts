import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startTestDb, stopTestDb, seedGrants } from './testDb.js'
import { runSearch } from '../src/runSearch.js'
import { defineSearchConfig } from '../src/config.js'
import { InvalidSearchRequestError } from '../src/errors.js'
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import type { Kysely } from 'kysely'

const config = defineSearchConfig({
  table: 'grants',
  filters: {
    status: { column: 'status', type: 'multiSelect' },
    category: { column: 'category', type: 'multiSelect' },
  },
  sort: { amount: 'funding_amount' },
  search: { columns: ['title', 'description'] },
})

let db: Kysely<any>
let container: StartedPostgreSqlContainer

beforeAll(async () => {
  const started = await startTestDb()
  db = started.db
  container = started.container
  await seedGrants(db)
})

afterAll(async () => {
  await stopTestDb(db, container)
})

describe('runSearch', () => {
  it('returns filtered, sorted rows with a total count and facet counts', async () => {
    const result = await runSearch(db, config, {
      filters: { status: ['open'] },
      sort: { field: 'amount', direction: 'asc' },
    })
    expect(result.rows.map((r: any) => r.title)).toEqual(['Education Grant', 'Infrastructure Grant'])
    expect(result.total).toBe(2)
    expect(Object.fromEntries(result.facetCounts.status.map((c) => [c.value, c.count]))).toEqual({
      open: 2,
      closed: 1,
    })
  })

  it('paginates results', async () => {
    const result = await runSearch(db, config, {
      filters: {},
      sort: { field: 'amount', direction: 'asc' },
      page: 1,
      pageSize: 2,
    })
    expect(result.rows).toHaveLength(2)
    expect(result.total).toBe(3)
  })

  it('rejects an unknown filter key before touching the database', async () => {
    await expect(runSearch(db, config, { filters: { nonsense: ['x'] } })).rejects.toThrow(
      InvalidSearchRequestError,
    )
  })
})