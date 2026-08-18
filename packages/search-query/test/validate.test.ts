import type { SearchRequest } from "@newjersey/search-core";
import { describe, expect, it } from "vitest";
import { defineSearchConfig } from "../src/config.js";
import { InvalidSearchRequestError } from "../src/errors.js";
import {
  DEFAULT_PAGE_SIZE,
  MAX_FILTER_VALUES,
  MAX_OFFSET,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  resolvePagination,
  validateFilters,
  validateSearch,
  validateSort,
} from "../src/validate.js";

const config = defineSearchConfig({
  table: "grants",
  filters: {
    status: { column: "status", type: "multiSelect" },
  },
  sort: { deadline: "application_deadline" },
  search: { columns: ["title", "description"] },
});

describe("validateFilters", () => {
  it("accepts a known multiSelect filter with string array values", () => {
    const request: SearchRequest = { filters: { status: ["open", "closed"] } };
    expect(() => validateFilters(config, request)).not.toThrow();
  });

  it("throws InvalidSearchRequestError for an unknown filter key", () => {
    const request: SearchRequest = { filters: { nonsense: ["x"] } };
    expect(() => validateFilters(config, request)).toThrow(InvalidSearchRequestError);
  });

  it("throws when a multiSelect filter value is not a string array", () => {
    const request = { filters: { status: "open" } } as unknown as SearchRequest;
    expect(() => validateFilters(config, request)).toThrow(InvalidSearchRequestError);
  });

  it("accepts a filter array at exactly MAX_FILTER_VALUES", () => {
    const request: SearchRequest = {
      filters: { status: Array.from({ length: MAX_FILTER_VALUES }, (_, i) => `v${i}`) },
    };
    expect(() => validateFilters(config, request)).not.toThrow();
  });

  it("throws InvalidSearchRequestError when a filter array exceeds MAX_FILTER_VALUES", () => {
    const request: SearchRequest = {
      filters: { status: Array.from({ length: MAX_FILTER_VALUES + 1 }, (_, i) => `v${i}`) },
    };
    expect(() => validateFilters(config, request)).toThrow(InvalidSearchRequestError);
  });
});

describe("validateSearch", () => {
  it("accepts a request with no search term", () => {
    const request: SearchRequest = { filters: {} };
    expect(() => validateSearch(request)).not.toThrow();
  });

  it("accepts a search term at exactly MAX_SEARCH_LENGTH", () => {
    const request: SearchRequest = { filters: {}, search: "a".repeat(MAX_SEARCH_LENGTH) };
    expect(() => validateSearch(request)).not.toThrow();
  });

  it("throws InvalidSearchRequestError when the search term exceeds MAX_SEARCH_LENGTH", () => {
    const request: SearchRequest = { filters: {}, search: "a".repeat(MAX_SEARCH_LENGTH + 1) };
    expect(() => validateSearch(request)).toThrow(InvalidSearchRequestError);
  });
});

describe("validateSort", () => {
  it("accepts a known sort field", () => {
    const request: SearchRequest = { filters: {}, sort: { field: "deadline", direction: "asc" } };
    expect(() => validateSort(config, request)).not.toThrow();
  });

  it("throws InvalidSearchRequestError for an unknown sort field", () => {
    const request: SearchRequest = { filters: {}, sort: { field: "nonsense", direction: "asc" } };
    expect(() => validateSort(config, request)).toThrow(InvalidSearchRequestError);
  });
});

describe("resolvePagination", () => {
  it("defaults page to 1 and pageSize to DEFAULT_PAGE_SIZE when not provided", () => {
    expect(resolvePagination({ filters: {} })).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      offset: 0,
    });
  });

  it("clamps a requested pageSize above MAX_PAGE_SIZE down to MAX_PAGE_SIZE", () => {
    const result = resolvePagination({ filters: {}, pageSize: MAX_PAGE_SIZE + 500 });
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("ignores a non-positive requested page and falls back to 1", () => {
    const result = resolvePagination({ filters: {}, page: -3 });
    expect(result.page).toBe(1);
  });

  it("computes offset from page and pageSize", () => {
    const result = resolvePagination({ filters: {}, page: 3, pageSize: 20 });
    expect(result.offset).toBe(40);
  });

  it("clamps offset to MAX_OFFSET when page and pageSize would exceed it", () => {
    const result = resolvePagination({ filters: {}, page: 999_999, pageSize: MAX_PAGE_SIZE });
    expect(result.offset).toBe(MAX_OFFSET);
  });
});
