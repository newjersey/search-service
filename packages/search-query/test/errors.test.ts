import { describe, expect, it } from "vitest";
import { InvalidSearchRequestError, SearchQueryError } from "../src/errors.js";

describe("InvalidSearchRequestError", () => {
  it("sets its name and message", () => {
    const error = new InvalidSearchRequestError("bad request");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InvalidSearchRequestError");
    expect(error.message).toBe("bad request");
  });
});

describe("SearchQueryError", () => {
  it("sets its name, message, and preserves the cause", () => {
    const cause = new Error("underlying failure");
    const error = new SearchQueryError("query failed", { cause });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("SearchQueryError");
    expect(error.message).toBe("query failed");
    expect(error.cause).toBe(cause);
  });

  it("works without a cause", () => {
    const error = new SearchQueryError("query failed");
    expect(error.name).toBe("SearchQueryError");
    expect(error.cause).toBeUndefined();
  });
});
