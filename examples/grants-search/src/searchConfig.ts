import { defineSearchConfig } from "@newjersey/search-query";

export const grantsSearchConfig = defineSearchConfig({
  table: "grants",
  filters: {
    status: { column: "status", type: "multiSelect" },
    category: { column: "category", type: "multiSelect" },
  },
  sort: { deadline: "application_deadline", amount: "funding_amount" },
  search: { columns: ["title", "description"] },
});
