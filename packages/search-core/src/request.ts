import type { FilterValue } from './filters.js'
import type { SortSpec } from './sort.js'

export interface SearchRequest {
  filters: Record<string, FilterValue>
  sort?: SortSpec
  search?: string
  page?: number
  pageSize?: number
}
