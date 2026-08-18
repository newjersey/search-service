import type { FilterType } from "@newjersey/search-core";

export interface FilterFieldConfig {
  column: string;
  type: FilterType;
}

export interface SearchFieldConfig {
  columns: string[];
}

export interface SearchConfig {
  table: string;
  filters: Record<string, FilterFieldConfig>;
  sort: Record<string, string>;
  search: SearchFieldConfig;
}

export function defineSearchConfig(config: SearchConfig): SearchConfig {
  return config;
}
