/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
import { api } from "./_generated/api.js";
import { modules } from "./setup.test.js";

describe("component lib", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("add and subtract", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.lib.add, { name: "beans", count: 10 });
    expect(await t.query(api.lib.count, { name: "beans" })).toEqual(10);
  });
});
