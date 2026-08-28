import { runSearch } from "@newjersey/search-query";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Kysely } from "kysely";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../../../packages/search-query/test/fixtures/testDb.js";
import { grantsSearchConfig } from "../src/searchConfig.js";

let db: Kysely<any>;
let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  const started = await startTestDb();
  db = started.db;
  container = started.container;
  await db
    .insertInto("grants")
    .values([
      {
        title: "Education Grant",
        description: "Support for schools",
        status: "open",
        category: "education",
        funding_amount: 50000,
        application_deadline: "2026-12-01",
      },
      {
        title: "Health Grant",
        description: "Support for clinics",
        status: "closed",
        category: "health",
        funding_amount: 75000,
        application_deadline: "2026-06-01",
      },
    ])
    .execute();
});

afterAll(async () => {
  await stopTestDb(db, container);
});

describe("grantsSearchConfig", () => {
  it("runs a real search against a Postgres instance matching the documented schema", async () => {
    const result = await runSearch(db, grantsSearchConfig, { filters: { status: ["open"] } });
    expect(result.rows).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.facetCounts.status).toEqual(
      expect.arrayContaining([
        { value: "open", count: 1 },
        { value: "closed", count: 1 },
      ]),
    );
  });
});
