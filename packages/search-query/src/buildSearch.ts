import type { SearchRequest } from "@newjersey/search-core";
import type { SelectQueryBuilder } from "kysely";
import { sql } from "kysely";
import type { SearchConfig } from "./config.js";

// word_similarity('shcools', 'Support for schools') measured at 0.375 against
// this plan's seed data; Postgres's own default (0.6) is tuned for generic use
// and doesn't catch this class of single-transposition typo against a longer,
// multi-word column. 0.3 clears that case with headroom while still scoring
// unrelated rows well below it (measured ~0.125) — not Postgres's default,
// chosen deliberately for typo tolerance against short query terms.
export const TYPO_TOLERANCE_THRESHOLD = 0.3;

export function applySearch(
  query: SelectQueryBuilder<any, any, any>,
  config: SearchConfig,
  request: SearchRequest,
): SelectQueryBuilder<any, any, any> {
  if (!request.search || config.search.columns.length === 0) return query;
  const term = request.search;

  const tsvectorParts = config.search.columns.map((col) => sql`coalesce(${sql.ref(col)}, '')`);
  let tsvectorSource = tsvectorParts[0];
  for (let i = 1; i < tsvectorParts.length; i++) {
    tsvectorSource = sql`${tsvectorSource} || ' ' || ${tsvectorParts[i]}`;
  }
  const fullTextMatch = sql<boolean>`to_tsvector('english', ${tsvectorSource}) @@ plainto_tsquery('english', ${term})`;
  const trigramMatches = config.search.columns.map(
    (col) => sql<boolean>`word_similarity(${term}, ${sql.ref(col)}) > ${TYPO_TOLERANCE_THRESHOLD}`,
  );

  return query.where(({ or }) => or([fullTextMatch, ...trigramMatches]));
}
