import type { SearchRequest, SearchResult } from "@newjersey/search-core";
import type { Kysely } from "kysely";
import { applyFilters } from "./buildFilters.js";
import { applySearch } from "./buildSearch.js";
import { applySort } from "./buildSort.js";
import type { SearchConfig } from "./config.js";
import { SearchQueryError } from "./errors.js";
import { computeFacetCounts } from "./facetCounts.js";
import { resolvePagination, validateFilters, validateSort } from "./validate.js";

export async function runSearch<TRow>(
  db: Kysely<any>,
  config: SearchConfig,
  request: SearchRequest,
): Promise<SearchResult<TRow>> {
  validateFilters(config, request);
  validateSort(config, request);
  const { page, pageSize } = resolvePagination(request);

  try {
    let baseQuery = db.selectFrom(config.table);
    baseQuery = applyFilters(baseQuery, config, request);
    baseQuery = applySearch(baseQuery, config, request);

    let resultsQuery = applySort(baseQuery.selectAll(), config, request);
    resultsQuery = resultsQuery.limit(pageSize).offset((page - 1) * pageSize);

    const [rows, totalRow, facetCounts] = await Promise.all([
      resultsQuery.execute(),
      baseQuery.select((eb) => eb.fn.countAll().as("count")).executeTakeFirstOrThrow(),
      computeFacetCounts(db, config, request),
    ]);

    return {
      rows: rows as TRow[],
      total: Number((totalRow as any).count),
      facetCounts,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "InvalidSearchRequestError") throw error;
    throw new SearchQueryError("Failed to execute search query", { cause: error });
  }
}
