import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { describe, expect, it, vi } from "vitest";
import { startTestDb, stopTestDb } from "./fixtures/testDb.js";

vi.mock("@testcontainers/postgresql", () => ({
  PostgreSqlContainer: vi.fn(),
}));

describe("startTestDb", () => {
  it("throws an actionable error, preserving the original cause, when no container runtime is available", async () => {
    const runtimeError = new Error("Could not find a working container runtime strategy");
    class FakePostgreSqlContainer {
      start = vi.fn().mockRejectedValue(runtimeError);
    }
    vi.mocked(PostgreSqlContainer).mockImplementation(FakePostgreSqlContainer as any);

    await expect(startTestDb()).rejects.toMatchObject({
      message: expect.stringContaining("Start yours and re-run"),
      cause: runtimeError,
    });
  });
});

describe("stopTestDb", () => {
  it("does nothing when startTestDb never succeeded", async () => {
    await expect(stopTestDb(undefined, undefined)).resolves.toBeUndefined();
  });
});
