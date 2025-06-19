import { describe, expect, test } from "vitest";
import { ShardedCounter } from "./index.js";
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

const shardedCounter = new ShardedCounter(components.shardedCounter, {
  shards: {
    beans: 1,
    friends: 2,
  },
  defaultShards: 1,
});

export const testQuery = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await shardedCounter.count(ctx, args.name);
  },
});

export const testMutation = mutation({
  args: { name: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    return await shardedCounter.add(ctx, args.name, args.count);
  },
});

export const testAction = action({
  args: { name: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    return await shardedCounter.add(ctx, args.name, args.count);
  },
});

const testApi: ApiFromModules<{
  fns: {
    testQuery: typeof testQuery;
    testMutation: typeof testMutation;
    testAction: typeof testAction;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>["fns"] = anyApi["index.test"] as any;

describe("ShardedCounter thick client", () => {
  test("should make thick client", async () => {
    const c = new ShardedCounter(components.shardedCounter);
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      await c.add(ctx, "beans", 1);
      expect(await c.count(ctx, "beans")).toBe(1);
    });
  });
  test("should work from a test function", async () => {
    const t = initConvexTest(schema);
    const result = await t.mutation(testApi.testMutation, {
      name: "beans",
      count: 1,
    });
    expect(result).toBe(1);
  });
});
