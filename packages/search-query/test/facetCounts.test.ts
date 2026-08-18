import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Kysely } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { defineSearchConfig } from "../src/config.js";
import { computeFacetCounts } from "../src/facetCounts.js";
import { seedGrants, startTestDb, stopTestDb } from "./testDb.js";

const config = defineSearchConfig({
  table: "grants",
  filters: {
    status: { column: "status", type: "multiSelect" },
    category: { column: "category", type: "multiSelect" },
  },
  sort: {},
  search: { columns: [] },
});

let db: Kysely<any>;
let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  const started = await startTestDb();
  db = started.db;
  container = started.container;
  await seedGrants(db);
});

afterAll(async () => {
  await stopTestDb(db, container);
});

describe("computeFacetCounts", () => {
  it("counts every value for a multiSelect facet when no filters are active", async () => {
    const counts = await computeFacetCounts(db, config, { filters: {} });
    const byValue = Object.fromEntries(counts.status.map((c) => [c.value, c.count]));
    expect(byValue).toEqual({ open: 2, closed: 1 });
  });

  it("excludes a facet's own active filter when computing its counts", async () => {
    // status=open is active; the status facet's own counts must still reflect BOTH
    // values (open: 2, closed: 1), not collapse to just "open".
    const counts = await computeFacetCounts(db, config, { filters: { status: ["open"] } });
    const byValue = Object.fromEntries(counts.status.map((c) => [c.value, c.count]));
    expect(byValue).toEqual({ open: 2, closed: 1 });
  });

  it("still applies OTHER active filters when computing a facet's counts", async () => {
    // category IN (education, health) excludes Infrastructure Grant (open).
    // The status facet's counts should reflect that exclusion: open: 1, closed: 1.
    const counts = await computeFacetCounts(db, config, {
      filters: { category: ["education", "health"] },
    });
    const byValue = Object.fromEntries(counts.status.map((c) => [c.value, c.count]));
    expect(byValue).toEqual({ open: 1, closed: 1 });
  });

  it("computes counts independently for a second multiSelect facet", async () => {
    const counts = await computeFacetCounts(db, config, { filters: {} });
    const byValue = Object.fromEntries(counts.category.map((c) => [c.value, c.count]));
    expect(byValue).toEqual({ education: 1, health: 1, infrastructure: 1 });
  });
});
