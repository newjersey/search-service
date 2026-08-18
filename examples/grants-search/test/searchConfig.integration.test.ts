import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { runSearch } from '@newjersey/search-query'
import { grantsSearchConfig } from '../src/searchConfig.js'

let db: Kysely<any>
let container: StartedPostgreSqlContainer

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start()
  db = new Kysely<any>({
    dialect: new PostgresDialect({ pool: new Pool({ connectionString: container.getConnectionUri() }) }),
  })
  await db.schema
    .createTable('grants')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('category', 'text', (col) => col.notNull())
    .addColumn('funding_amount', 'numeric', (col) => col.notNull())
    .addColumn('application_deadline', 'date', (col) => col.notNull())
    .execute()
  await db
    .insertInto('grants')
    .values([
      {
        title: 'Education Grant',
        description: 'Support for schools',
        status: 'open',
        category: 'education',
        funding_amount: 50000,
        application_deadline: '2026-12-01',
      },
      {
        title: 'Health Grant',
        description: 'Support for clinics',
        status: 'closed',
        category: 'health',
        funding_amount: 75000,
        application_deadline: '2026-06-01',
      },
    ])
    .execute()
})

afterAll(async () => {
  await db.destroy()
  await container.stop()
})

describe('grantsSearchConfig', () => {
  it('runs a real search against a Postgres instance matching the documented schema', async () => {
    const result = await runSearch(db, grantsSearchConfig, { filters: { status: ['open'] } })
    expect(result.rows).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.facetCounts.status).toEqual(
      expect.arrayContaining([
        { value: 'open', count: 1 },
        { value: 'closed', count: 1 },
      ]),
    )
  })
})