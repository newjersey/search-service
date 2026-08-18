import { defineFacetUI } from "@newjersey/search-ui";

export const grantsFacetUIConfig = defineFacetUI({
  status: { label: "Status", control: "checkboxGroup" },
  category: { label: "Category", control: "checkboxGroup" },
});
