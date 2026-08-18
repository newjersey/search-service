export interface FacetCount {
  value: string;
  count: number;
}

export type FacetCounts = Record<string, FacetCount[]>;

export interface SearchResult<TRow> {
  rows: TRow[];
  total: number;
  facetCounts: FacetCounts;
}
