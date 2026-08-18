import { describe, it, expect } from 'vitest'
import { validateFilters, validateSort, resolvePagination, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '../src/validate.js'
import { defineSearchConfig } from '../src/config.js'
import { InvalidSearchRequestError } from '../src/errors.js'
import type { SearchRequest } from '@newjersey/search-core'

const config = defineSearchConfig({
  table: 'grants',
  filters: {
    status: { column: 'status', type: 'multiSelect' },
  },
  sort: { deadline: 'application_deadline' },
  search: { columns: ['title', 'description'] },
})

describe('validateFilters', () => {
  it('accepts a known multiSelect filter with string array values', () => {
    const request: SearchRequest = { filters: { status: ['open', 'closed'] } }
    expect(() => validateFilters(config, request)).not.toThrow()
  })

  it('throws InvalidSearchRequestError for an unknown filter key', () => {
    const request: SearchRequest = { filters: { nonsense: ['x'] } }
    expect(() => validateFilters(config, request)).toThrow(InvalidSearchRequestError)
  })

  it('throws when a multiSelect filter value is not a string array', () => {
    const request = { filters: { status: 'open' } } as unknown as SearchRequest
    expect(() => validateFilters(config, request)).toThrow(InvalidSearchRequestError)
  })
})

describe('validateSort', () => {
  it('accepts a known sort field', () => {
    const request: SearchRequest = { filters: {}, sort: { field: 'deadline', direction: 'asc' } }
    expect(() => validateSort(config, request)).not.toThrow()
  })

  it('throws InvalidSearchRequestError for an unknown sort field', () => {
    const request: SearchRequest = { filters: {}, sort: { field: 'nonsense', direction: 'asc' } }
    expect(() => validateSort(config, request)).toThrow(InvalidSearchRequestError)
  })
})

describe('resolvePagination', () => {
  it('defaults page to 1 and pageSize to DEFAULT_PAGE_SIZE when not provided', () => {
    expect(resolvePagination({ filters: {} })).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE })
  })

  it('clamps a requested pageSize above MAX_PAGE_SIZE down to MAX_PAGE_SIZE', () => {
    const result = resolvePagination({ filters: {}, pageSize: MAX_PAGE_SIZE + 500 })
    expect(result.pageSize).toBe(MAX_PAGE_SIZE)
  })

  it('ignores a non-positive requested page and falls back to 1', () => {
    const result = resolvePagination({ filters: {}, page: -3 })
    expect(result.page).toBe(1)
  })
})