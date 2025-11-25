import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  test("addComment and listComments", async () => {
    const t = initConvexTest();
    const targetId = "test-subject-1";
    const commentId = await t.mutation(api.example.addComment, {
      text: "My comment",
      targetId,
    });
    expect(commentId).toBeDefined();
    const comments = await t.query(api.example.listComments, { targetId });
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe("My comment");
  });

  test("translateComment", async () => {
    const t = initConvexTest();
    const targetId = "test-subject-1";
    const commentId = await t.mutation(api.example.addComment, {
      text: "My comment",
      targetId,
    });
    expect(commentId).toBeDefined();
    await t.action(api.example.translateComment, {
      commentId: commentId,
    });
    const comments = await t.query(api.example.listComments, { targetId });
    expect(comments[0].text).toBe("My comment");
  });
});
