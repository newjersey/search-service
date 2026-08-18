import type { FacetCounts, SearchRequest } from "@newjersey/search-core";
import type { Kysely } from "kysely";
import { applyFilters } from "./buildFilters.js";
import { applySearch } from "./buildSearch.js";
import type { SearchConfig } from "./config.js";

export async function computeFacetCounts(
  db: Kysely<any>,
  config: SearchConfig,
  request: SearchRequest,
): Promise<FacetCounts> {
  const multiSelectFacets = Object.entries(config.filters).filter(
    ([, fieldConfig]) => fieldConfig.type === "multiSelect",
  );

  // Run every facet's count query concurrently, not one at a time — total
  // latency should track the slowest single facet query, not the sum of all
  // of them, regardless of how many facets a project configures.
  const entries = await Promise.all(
    multiSelectFacets.map(async ([facetKey, fieldConfig]) => {
      let query = db.selectFrom(config.table);
      query = applyFilters(query, config, request, facetKey);
      query = applySearch(query, config, request);

      const rows = await query
        .select(fieldConfig.column)
        .select((eb) => eb.fn.countAll().as("count"))
        .groupBy(fieldConfig.column)
        .execute();

      const counts = rows.map((row: any) => ({
        value: String(row[fieldConfig.column]),
        count: Number(row.count),
      }));
      return [facetKey, counts] as const;
    }),
  );

  return Object.fromEntries(entries);
}
