import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Kysely } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyFilters } from "../src/buildFilters.js";
import { defineSearchConfig } from "../src/config.js";
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

describe("applyFilters", () => {
  it("filters rows by a multiSelect column", async () => {
    const query = applyFilters(db.selectFrom("grants").selectAll(), config, {
      filters: { status: ["closed"] },
    });
    const rows = await query.execute();
    expect(rows.map((r: any) => r.title)).toEqual(["Health Grant"]);
  });

  it("combines multiple active filters", async () => {
    const query = applyFilters(db.selectFrom("grants").selectAll(), config, {
      filters: { status: ["open"], category: ["education"] },
    });
    const rows = await query.execute();
    expect(rows.map((r: any) => r.title)).toEqual(["Education Grant"]);
  });

  it("excludes the named facet key from filtering when excludeKey is passed", async () => {
    const query = applyFilters(
      db.selectFrom("grants").selectAll(),
      config,
      { filters: { status: ["closed"] } },
      "status",
    );
    const rows = await query.execute();
    expect(rows).toHaveLength(3);
  });
});
