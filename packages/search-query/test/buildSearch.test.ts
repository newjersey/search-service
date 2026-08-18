import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Kysely } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applySearch } from "../src/buildSearch.js";
import { defineSearchConfig } from "../src/config.js";
import { seedGrants, startTestDb, stopTestDb } from "./testDb.js";

const config = defineSearchConfig({
  table: "grants",
  filters: {},
  sort: {},
  search: { columns: ["title", "description"] },
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

describe("applySearch", () => {
  it("matches an exact word via full-text search", async () => {
    const query = applySearch(db.selectFrom("grants").selectAll(), config, {
      filters: {},
      search: "schools",
    });
    const rows = await query.execute();
    expect(rows.map((r: any) => r.title)).toEqual(["Education Grant"]);
  });

  it("matches a typo via trigram similarity", async () => {
    const query = applySearch(db.selectFrom("grants").selectAll(), config, {
      filters: {},
      search: "shcools",
    });
    const rows = await query.execute();
    expect(rows.map((r: any) => r.title)).toEqual(["Education Grant"]);
  });

  it("leaves the query unchanged when no search term is given", async () => {
    const query = applySearch(db.selectFrom("grants").selectAll(), config, { filters: {} });
    const rows = await query.execute();
    expect(rows).toHaveLength(3);
  });
});
