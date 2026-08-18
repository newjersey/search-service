import type { SelectQueryBuilder } from 'kysely'
import type { MultiSelectFilterValue, SearchRequest } from '@newjersey/search-core'
import type { SearchConfig } from './config.js'

export function applyFilters(
  query: SelectQueryBuilder<any, any, any>,
  config: SearchConfig,
  request: SearchRequest,
  excludeKey?: string,
): SelectQueryBuilder<any, any, any> {
  let result = query
  for (const [key, value] of Object.entries(request.filters)) {
    if (key === excludeKey) continue
    const fieldConfig = config.filters[key]
    const values = value as MultiSelectFilterValue
    if (values.length === 0) continue
    result = result.where(fieldConfig.column, 'in', values)
  }
  return result
}