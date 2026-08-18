import type { SearchRequest } from '@newjersey/search-core'
import type { SearchConfig } from './config.js'
import { InvalidSearchRequestError } from './errors.js'

export const MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20

export interface ValidatedPagination {
  page: number
  pageSize: number
}

export function validateFilters(config: SearchConfig, request: SearchRequest): void {
  for (const [key, value] of Object.entries(request.filters)) {
    const fieldConfig = config.filters[key]
    if (!fieldConfig) {
      throw new InvalidSearchRequestError(`Unknown filter key: "${key}"`)
    }
    if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
      throw new InvalidSearchRequestError(`Filter "${key}" expects an array of strings`)
    }
  }
}

export function validateSort(config: SearchConfig, request: SearchRequest): void {
  if (request.sort && !config.sort[request.sort.field]) {
    throw new InvalidSearchRequestError(`Unknown sort field: "${request.sort.field}"`)
  }
}

export function resolvePagination(request: SearchRequest): ValidatedPagination {
  const page = request.page && request.page > 0 ? Math.floor(request.page) : 1
  const requestedSize =
    request.pageSize && request.pageSize > 0 ? Math.floor(request.pageSize) : DEFAULT_PAGE_SIZE
  const pageSize = Math.min(requestedSize, MAX_PAGE_SIZE)
  return { page, pageSize }
}