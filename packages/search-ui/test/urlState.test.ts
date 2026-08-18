import { beforeEach, describe, expect, it } from "vitest";
import { defineFacetUI } from "../src/config.js";
import {
  browserHistoryAdapter,
  decodeSearchStateFromParams,
  encodeSearchStateToParams,
} from "../src/urlState.js";

const config = defineFacetUI({
  status: { label: "Status", control: "checkboxGroup" },
  category: { label: "Category", control: "checkboxGroup" },
});

describe("encodeSearchStateToParams", () => {
  it("encodes active multiSelect filters as comma-separated values", () => {
    const params = encodeSearchStateToParams(config, { filters: { status: ["open", "closed"] } });
    expect(params.get("status")).toBe("open,closed");
  });

  it("omits a filter key entirely when its selection is empty", () => {
    const params = encodeSearchStateToParams(config, { filters: { status: [] } });
    expect(params.has("status")).toBe(false);
  });

  it("encodes sort as field:direction", () => {
    const params = encodeSearchStateToParams(config, {
      filters: {},
      sort: { field: "deadline", direction: "asc" },
    });
    expect(params.get("sort")).toBe("deadline:asc");
  });

  it('encodes the search term under "q"', () => {
    const params = encodeSearchStateToParams(config, { filters: {}, search: "schools" });
    expect(params.get("q")).toBe("schools");
  });

  it("omits page when it is 1 (the default)", () => {
    const params = encodeSearchStateToParams(config, { filters: {}, page: 1 });
    expect(params.has("page")).toBe(false);
  });

  it("includes page when it is greater than 1", () => {
    const params = encodeSearchStateToParams(config, { filters: {}, page: 3 });
    expect(params.get("page")).toBe("3");
  });
});

describe("decodeSearchStateFromParams", () => {
  it("decodes a comma-separated filter value back into a string array", () => {
    const request = decodeSearchStateFromParams(config, new URLSearchParams("status=open,closed"));
    expect(request.filters.status).toEqual(["open", "closed"]);
  });

  it("ignores query params for facet keys not present in config", () => {
    const request = decodeSearchStateFromParams(config, new URLSearchParams("nonsense=foo"));
    expect(request.filters.nonsense).toBeUndefined();
  });

  it("decodes sort back into a SortSpec", () => {
    const request = decodeSearchStateFromParams(config, new URLSearchParams("sort=deadline:asc"));
    expect(request.sort).toEqual({ field: "deadline", direction: "asc" });
  });

  it("ignores a malformed sort param", () => {
    const request = decodeSearchStateFromParams(config, new URLSearchParams("sort=nonsense"));
    expect(request.sort).toBeUndefined();
  });

  it('decodes the search term from "q"', () => {
    const request = decodeSearchStateFromParams(config, new URLSearchParams("q=schools"));
    expect(request.search).toBe("schools");
  });

  it("decodes page as a number", () => {
    const request = decodeSearchStateFromParams(config, new URLSearchParams("page=3"));
    expect(request.page).toBe(3);
  });

  it("round-trips encode then decode back to the original state", () => {
    const original = {
      filters: { status: ["open"], category: ["education", "health"] },
      sort: { field: "deadline", direction: "asc" as const },
      search: "schools",
      page: 2,
    };
    const params = encodeSearchStateToParams(config, original);
    const decoded = decodeSearchStateFromParams(config, params);
    expect(decoded).toEqual(original);
  });
});

describe("browserHistoryAdapter", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("getSearchParams reads from window.location.search", () => {
    window.history.replaceState(null, "", "/?status=open");
    expect(browserHistoryAdapter.getSearchParams().get("status")).toBe("open");
  });

  it("setSearchParams writes params into the URL without a page reload", () => {
    browserHistoryAdapter.setSearchParams(new URLSearchParams("status=open"));
    expect(window.location.search).toBe("?status=open");
  });

  it("setSearchParams clears the query string entirely when params are empty", () => {
    window.history.replaceState(null, "", "/?status=open");
    browserHistoryAdapter.setSearchParams(new URLSearchParams());
    expect(window.location.search).toBe("");
  });
});
