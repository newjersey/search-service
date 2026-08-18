import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startTestDb, stopTestDb, seedGrants } from './testDb.js'
import { applySort } from '../src/buildSort.js'
import { defineSearchConfig } from '../src/config.js'
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import type { Kysely } from 'kysely'

const config = defineSearchConfig({
  table: 'grants',
  filters: {},
  sort: { amount: 'funding_amount' },
  search: { columns: [] },
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

describe('applySort', () => {
  it('sorts ascending by the mapped column', async () => {
    const query = applySort(db.selectFrom('grants').selectAll(), config, {
      filters: {},
      sort: { field: 'amount', direction: 'asc' },
    })
    const rows = await query.execute()
    expect(rows.map((r: any) => r.title)).toEqual([
      'Education Grant',
      'Health Grant',
      'Infrastructure Grant',
    ])
  })

  it('sorts descending by the mapped column', async () => {
    const query = applySort(db.selectFrom('grants').selectAll(), config, {
      filters: {},
      sort: { field: 'amount', direction: 'desc' },
    })
    const rows = await query.execute()
    expect(rows.map((r: any) => r.title)).toEqual([
      'Infrastructure Grant',
      'Health Grant',
      'Education Grant',
    ])
  })

  it('leaves the query unchanged when no sort is requested', async () => {
    const query = applySort(db.selectFrom('grants').selectAll(), config, { filters: {} })
    const rows = await query.execute()
    expect(rows).toHaveLength(3)
  })
})