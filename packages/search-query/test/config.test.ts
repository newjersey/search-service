import { describe, it, expect } from 'vitest'
import { defineSearchConfig } from '../src/config.js'

describe('defineSearchConfig', () => {
  it('returns the config unchanged', () => {
    const config = defineSearchConfig({
      table: 'grants',
      filters: {
        status: { column: 'status', type: 'multiSelect' },
      },
      sort: {},
      search: { columns: ['title'] },
    })
    expect(config.table).toBe('grants')
    expect(config.filters.status).toEqual({ column: 'status', type: 'multiSelect' })
  })
})