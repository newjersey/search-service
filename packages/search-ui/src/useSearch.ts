import type { SearchRequest, SearchResult } from "@newjersey/search-core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FacetUIConfig } from "./config.js";
import type { SearchUrlAdapter } from "./urlState.js";
import {
  browserHistoryAdapter,
  decodeSearchStateFromParams,
  encodeSearchStateToParams,
} from "./urlState.js";

export type SearchFetcher<TRow> = (request: SearchRequest) => Promise<SearchResult<TRow>>;

export type UseSearchOptions<TRow> =
  | { endpoint: string; urlAdapter?: SearchUrlAdapter; pageSize?: number }
  | { fetcher: SearchFetcher<TRow>; urlAdapter?: SearchUrlAdapter; pageSize?: number };

export const DEFAULT_PAGE_SIZE = 20;

export type SearchStatus = "loading" | "error" | "success";

export interface UseSearchResult<TRow> {
  status: SearchStatus;
  results: SearchResult<TRow> | undefined;
  error: Error | undefined;
  filters: Record<string, string[]>;
  setFilter: (key: string, values: string[]) => void;
  sort: SearchRequest["sort"];
  setSort: (sort: SearchRequest["sort"]) => void;
  search: string | undefined;
  setSearch: (term: string | undefined) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

function buildDefaultFetcher<TRow>(endpoint: string): SearchFetcher<TRow> {
  return async (request) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Search request failed with status ${response.status}`);
    }
    return response.json() as Promise<SearchResult<TRow>>;
  };
}

export function useSearch<TRow>(
  config: FacetUIConfig,
  options: UseSearchOptions<TRow>,
): UseSearchResult<TRow> {
  const fetcher =
    "fetcher" in options ? options.fetcher : buildDefaultFetcher<TRow>(options.endpoint);
  const urlAdapter = options.urlAdapter ?? browserHistoryAdapter;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const initialRequest = useRef(
    decodeSearchStateFromParams(config, urlAdapter.getSearchParams()),
  ).current;

  const [filters, setFilters] = useState<Record<string, string[]>>(initialRequest.filters);
  const [sort, setSortState] = useState(initialRequest.sort);
  const [search, setSearchState] = useState(initialRequest.search);
  const [page, setPageState] = useState(initialRequest.page ?? 1);

  const [status, setStatus] = useState<SearchStatus>("loading");
  const [results, setResults] = useState<SearchResult<TRow>>();
  const [error, setError] = useState<Error>();

  // config, fetcher, and urlAdapter are intentionally excluded from the
  // dependency array below: all three are rebuilt every render from
  // `options`/`config`, but only the actual search-state values should
  // trigger a re-fetch.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  useEffect(() => {
    const request: SearchRequest = { filters, sort, search, page, pageSize };

    const params = encodeSearchStateToParams(config, request);
    urlAdapter.setSearchParams(params);

    let cancelled = false;
    setStatus("loading");
    fetcher(request)
      .then((result) => {
        if (cancelled) return;
        setResults(result);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [filters, sort, search, page, pageSize]);

  const setFilter = useCallback((key: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setPageState(1);
  }, []);

  const setSort = useCallback((newSort: SearchRequest["sort"]) => {
    setSortState(newSort);
  }, []);

  const setSearch = useCallback((term: string | undefined) => {
    setSearchState(term);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  return {
    status,
    results,
    error,
    filters,
    setFilter,
    sort,
    setSort,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
  };
}
