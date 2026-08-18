import type { SearchRequest } from '@newjersey/search-core'
import type { FacetUIConfig } from './config.js'

export function encodeSearchStateToParams(
  config: FacetUIConfig,
  request: SearchRequest,
): URLSearchParams {
  const params = new URLSearchParams()

  for (const key of Object.keys(config)) {
    const values = request.filters[key]
    if (values && values.length > 0) {
      params.set(key, values.join(','))
    }
  }

  if (request.sort) {
    params.set('sort', `${request.sort.field}:${request.sort.direction}`)
  }

  if (request.search) {
    params.set('q', request.search)
  }

  if (request.page && request.page > 1) {
    params.set('page', String(request.page))
  }

  return params
}

export function decodeSearchStateFromParams(
  config: FacetUIConfig,
  params: URLSearchParams,
): SearchRequest {
  const filters: Record<string, string[]> = {}
  for (const key of Object.keys(config)) {
    const raw = params.get(key)
    if (raw) {
      filters[key] = raw.split(',').filter((v) => v.length > 0)
    }
  }

  const request: SearchRequest = { filters }

  const sortParam = params.get('sort')
  if (sortParam) {
    const [field, direction] = sortParam.split(':')
    if (field && (direction === 'asc' || direction === 'desc')) {
      request.sort = { field, direction }
    }
  }

  const search = params.get('q')
  if (search) {
    request.search = search
  }

  const pageParam = params.get('page')
  if (pageParam) {
    const parsed = Number(pageParam)
    if (Number.isInteger(parsed) && parsed > 0) {
      request.page = parsed
    }
  }

  return request
}

export interface SearchUrlAdapter {
  getSearchParams: () => URLSearchParams
  setSearchParams: (params: URLSearchParams) => void
}

export const browserHistoryAdapter: SearchUrlAdapter = {
  getSearchParams: () => new URLSearchParams(window.location.search),
  setSearchParams: (params) => {
    const query = params.toString()
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
  },
}