import { afterEach, beforeEach, describe, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

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
