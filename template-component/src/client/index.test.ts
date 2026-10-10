import { describe, expect, expectTypeOf, test } from "vitest";
import { defineTestApp } from "convex-test";
import { exposeApi } from "./index.js";
import { defineSchema } from "convex/server";
import { v } from "convex/values";
import componentTest from "../test.js";
import type { ComponentApi } from "../component/_generated/component.js";

// A small host app for the client, without generated app files or a module glob.
const app = defineTestApp({
  schema: defineSchema({}),
  components: { sampleComponent: componentTest },
});
const { api, createTest } = app.defineModules({
  comments: {
    currentUser: app.query({
      args: {},
      returns: v.union(v.string(), v.null()),
      handler: async (ctx) => {
        return (await ctx.auth.getUserIdentity())?.subject ?? null;
      },
    }),
    ...exposeApi(app.components.sampleComponent, {
      auth: async (ctx, _operation) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");
        return identity.subject;
      },
      baseUrl: "https://pirate.monkeyness.com",
    }),
  },
});

describe("client tests", () => {
  test("should be able to use client", async () => {
    expectTypeOf(app.components.sampleComponent).toEqualTypeOf<
      ComponentApi<"sampleComponent">
    >();
    const t = createTest().withIdentity({ subject: "user1" });
    expect(await t.query(api.comments.currentUser, {})).toBe("user1");
    const targetId = "test-subject-1";
    await t.mutation(api.comments.add, {
      text: "My first comment",
      targetId,
    });
    const comments = await t.query(api.comments.list, { targetId });
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe("My first comment");
    expect(comments[0].userId).toBe("user1");
  });

  test("rejects unauthenticated calls before writing to the component", async () => {
    const t = createTest();
    const targetId = "test-subject-1";
    await expect(
      t.mutation(api.comments.add, { text: "Not allowed", targetId }),
    ).rejects.toThrow("Unauthorized");
    await expect(t.query(api.comments.list, { targetId })).rejects.toThrow(
      "Unauthorized",
    );
    expect(
      await t
        .withIdentity({ subject: "user1" })
        .query(api.comments.list, { targetId }),
    ).toEqual([]);
  });
});
