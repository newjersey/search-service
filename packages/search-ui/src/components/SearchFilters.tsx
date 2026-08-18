import type { FacetCounts } from "@newjersey/search-core";
import type { FacetUIConfig } from "../config.js";
import { CheckboxGroupFilter } from "./CheckboxGroupFilter.js";

export interface SearchFiltersProps {
  config: FacetUIConfig;
  filters: Record<string, string[]>;
  facetCounts: FacetCounts | undefined;
  onFilterChange: (key: string, values: string[]) => void;
}

export function SearchFilters({
  config,
  filters,
  facetCounts,
  onFilterChange,
}: SearchFiltersProps) {
  return (
    <>
      {Object.entries(config).map(([key, fieldConfig]) => {
        const counts = facetCounts?.[key] ?? [];
        const options = counts.map((count) => ({
          value: count.value,
          label: count.value,
          count: count.count,
        }));
        return (
          <CheckboxGroupFilter
            key={key}
            facetKey={key}
            legend={fieldConfig.label}
            options={options}
            selected={filters[key] ?? []}
            onChange={(values) => onFilterChange(key, values)}
          />
        );
      })}
    </>
  );
}
