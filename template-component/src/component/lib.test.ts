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
  test("example lib test", async () => {
    const t = convexTest(schema, modules);
    const targetId = "test-subject-1";
    const commentId = await t.mutation(api.lib.add, {
      text: "Hello, world!",
      userId: "user1",
      targetId,
    });
    expect(commentId).toBeDefined();
    const comments = await t.query(api.lib.list, { targetId });
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toEqual("Hello, world!");
  });
});
