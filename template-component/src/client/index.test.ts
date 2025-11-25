import { describe, expect, test } from "vitest";
import { SampleComponent } from "./index.js";
import { defineSchema } from "convex/server";
import { components, initConvexTest } from "./setup.test.js";

// The schema for the tests
const schema = defineSchema({});

describe("client tests", () => {
  test("should be able to use client", async () => {
    const t = initConvexTest(schema);
    const sampleComponent = new SampleComponent(components.sampleComponent);
    const targetId = "test-subject-1";
    await t.run(async (ctx) => {
      await sampleComponent.add(ctx, {
        text: "My first comment",
        targetId: targetId,
        userId: "user1",
      });
      const comments = await sampleComponent.list(ctx, targetId);
      expect(comments).toHaveLength(1);
      expect(comments[0].text).toBe("My first comment");
    });
  });
});
