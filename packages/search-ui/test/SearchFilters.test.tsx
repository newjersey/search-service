import type { FacetCounts } from "@newjersey/search-core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchFilters } from "../src/components/SearchFilters.js";
import { defineFacetUI } from "../src/config.js";

const config = defineFacetUI({
  status: { label: "Status", control: "checkboxGroup" },
  category: { label: "Category", control: "checkboxGroup" },
});

describe("SearchFilters", () => {
  it("renders one labeled checkbox group per configured facet", () => {
    const facetCounts: FacetCounts = {
      status: [{ value: "open", count: 2 }],
      category: [{ value: "education", count: 1 }],
    };
    render(
      <SearchFilters
        config={config}
        filters={{}}
        facetCounts={facetCounts}
        onFilterChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "open (2)" })).toBeInTheDocument();
  });

  it("renders an empty group with no checkboxes when facet counts are not yet loaded", () => {
    render(
      <SearchFilters
        config={config}
        filters={{}}
        facetCounts={undefined}
        onFilterChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("calls onFilterChange with the facet key when a checkbox in that group changes", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const facetCounts: FacetCounts = { status: [{ value: "open", count: 2 }], category: [] };
    render(
      <SearchFilters
        config={config}
        filters={{}}
        facetCounts={facetCounts}
        onFilterChange={onFilterChange}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "open (2)" }));
    expect(onFilterChange).toHaveBeenCalledWith("status", ["open"]);
  });
});
