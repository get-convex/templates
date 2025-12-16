import { describe, expect, test } from "vitest";
import { exposeApi } from "./index.js";
import { anyApi, type ApiFromModules } from "convex/server";
import { components, initConvexTest } from "./setup.test.js";

export const { add, list } = exposeApi(components.sampleComponent, {
  auth: async (ctx, _operation) => {
    return (await ctx.auth.getUserIdentity())?.subject ?? "anonymous";
  },
  baseUrl: "https://pirate.monkeyness.com",
});

const testApi = (
  anyApi as unknown as ApiFromModules<{
    "index.test": {
      add: typeof add;
      list: typeof list;
    };
  }>
)["index.test"];

describe("client tests", () => {
  test("should be able to use client", async () => {
    const t = initConvexTest().withIdentity({
      subject: "user1",
    });
    const targetId = "test-subject-1";
    await t.mutation(testApi.add, {
      text: "My first comment",
      targetId: targetId,
    });
    const comments = await t.query(testApi.list, { targetId });
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe("My first comment");
  });
});
