import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SampleComponent } from "./index.js";
import type { DataModelFromSchemaDefinition } from "convex/server";
import {
  anyApi,
  queryGeneric,
  mutationGeneric,
  actionGeneric,
} from "convex/server";
import type {
  ApiFromModules,
  ActionBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import { v } from "convex/values";
import { defineSchema } from "convex/server";
import { components, initConvexTest } from "./setup.test.js";

// The schema for the tests
const schema = defineSchema({});
type DataModel = DataModelFromSchemaDefinition<typeof schema>;
// type DatabaseReader = GenericDatabaseReader<DataModel>;
const query = queryGeneric as QueryBuilder<DataModel, "public">;
const mutation = mutationGeneric as MutationBuilder<DataModel, "public">;
const action = actionGeneric as ActionBuilder<DataModel, "public">;

const sampleComponent = new SampleComponent(components.sampleComponent, {
  getUserIdCallback: () => "user1",
});

export const testQuery = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.list(ctx, args.targetId);
  },
});

export const testMutation = mutation({
  args: { text: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.add(ctx, args.text, args.targetId);
  },
});

export const testAction = action({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.convertToPirateTalk(ctx, args.commentId);
  },
});

const testApi: ApiFromModules<{
  fns: {
    testQuery: typeof testQuery;
    testMutation: typeof testMutation;
    testAction: typeof testAction;
  };
}>["fns"] = anyApi["index.test"] as any;

describe("SampleComponent thick client", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("should make thick client", async () => {
    const c = new SampleComponent(components.sampleComponent, {
      getUserIdCallback: () => "user1",
    });
    const t = initConvexTest(schema);
    const targetId = "test-subject-1";
    await t.run(async (ctx) => {
      await c.add(ctx, "My first comment", targetId);
      const comments = await c.list(ctx, targetId);
      expect(comments).toHaveLength(1);
      expect(comments[0].text).toBe("My first comment");
    });
  });
  test("should work from a test function", async () => {
    const t = initConvexTest(schema);
    const targetId = "test-subject-1";
    const commentId = await t.mutation(testApi.testMutation, {
      text: "Test comment",
      targetId,
    });
    expect(commentId).toBeDefined();
  });
  test("should work with action", async () => {
    const t = initConvexTest(schema);
    const targetId = "test-subject-1";
    const commentId = await t.mutation(testApi.testMutation, {
      text: "Test comment",
      targetId,
    });
    const translatedComment = await t.action(testApi.testAction, {
      commentId: commentId,
    });
    expect(translatedComment).toBeDefined();
  });
});
