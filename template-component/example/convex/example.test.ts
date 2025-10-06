import { afterEach, beforeEach, describe, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";
import { TestConvex } from "convex-test";
import type schema from "./schema";

describe("example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    t = initConvexTest();
  });
  let t: TestConvex<typeof schema>;

  afterEach(async () => {
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    vi.useRealTimers();
  });

  test("addOne", async () => {
    await t.mutation(api.example.addOne, {});
  });
});
