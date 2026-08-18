import type { SearchRequest } from "@newjersey/search-core";
import type { SelectQueryBuilder } from "kysely";
import type { SearchConfig } from "./config.js";

export function applySort(
  query: SelectQueryBuilder<any, any, any>,
  config: SearchConfig,
  request: SearchRequest,
): SelectQueryBuilder<any, any, any> {
  if (!request.sort) return query;
  const column = config.sort[request.sort.field];
  return query.orderBy(column, request.sort.direction);
}
