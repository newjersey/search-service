import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckboxGroupFilter } from "../src/components/CheckboxGroupFilter.js";

const options = [
  { value: "open", label: "Open", count: 2 },
  { value: "closed", label: "Closed", count: 1 },
];

describe("CheckboxGroupFilter", () => {
  it("renders each option as an accessible, labeled checkbox inside a labeled group", () => {
    render(
      <CheckboxGroupFilter
        facetKey="status"
        legend="Status"
        options={options}
        selected={[]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Open (2)" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Closed (1)" })).toBeInTheDocument();
  });

  it("reflects the selected prop as checked state", () => {
    render(
      <CheckboxGroupFilter
        facetKey="status"
        legend="Status"
        options={options}
        selected={["open"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Open (2)" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Closed (1)" })).not.toBeChecked();
  });

  it("calls onChange with the value added when an unchecked box is activated via keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxGroupFilter
        facetKey="status"
        legend="Status"
        options={options}
        selected={[]}
        onChange={onChange}
      />,
    );
    await user.tab();
    await user.keyboard("[Space]");
    expect(onChange).toHaveBeenCalledWith(["open"]);
  });

  it("calls onChange with the value removed when a checked box is activated via keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxGroupFilter
        facetKey="status"
        legend="Status"
        options={options}
        selected={["open"]}
        onChange={onChange}
      />,
    );
    await user.tab();
    await user.keyboard("[Space]");
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
