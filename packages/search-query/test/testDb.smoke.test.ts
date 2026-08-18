import { afterAll, describe, expect, it } from "vitest";
import { seedGrants, startTestDb, stopTestDb } from "./testDb.js";

describe("test database harness", () => {
  it("starts Postgres, creates the grants table, and seeds three rows", async () => {
    const { db, container } = await startTestDb();
    try {
      await seedGrants(db);
      const rows = await db.selectFrom("grants").selectAll().execute();
      expect(rows).toHaveLength(3);
    } finally {
      await stopTestDb(db, container);
    }
  });
});

afterAll(() => {});
