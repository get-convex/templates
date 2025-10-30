import { afterEach, beforeEach, describe, test, vi } from "vitest";
import { initConvexTest } from "./setup.test.js";
import { api } from "./_generated/api.js";

describe("example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  test("addOne", async () => {
    const t = initConvexTest();
    await t.mutation(api.example.addOne, {});
  });
});
