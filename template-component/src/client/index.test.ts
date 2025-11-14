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

const sampleComponent = new SampleComponent(components.sampleComponent, {});

export const testQuery = query({
  args: {},
  handler: async (ctx) => {
    return await sampleComponent.list(ctx);
  },
});

export const testMutation = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.add(ctx, args.text);
  },
});

export const testAction = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.addWithValidation(ctx, args.text);
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
    const c = new SampleComponent(components.sampleComponent);
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      await c.add(ctx, "My first note");
      const notes = await c.list(ctx);
      expect(notes).toHaveLength(1);
      expect(notes[0].text).toBe("My first note");
    });
  });
  test("should work from a test function", async () => {
    const t = initConvexTest(schema);
    const noteId = await t.mutation(testApi.testMutation, {
      text: "Test note",
    });
    expect(noteId).toBeDefined();
  });
  test("should work with action", async () => {
    const t = initConvexTest(schema);
    const noteId = await t.action(testApi.testAction, {
      text: "  Action note  ",
    });
    expect(noteId).toBeDefined();
    const notes = await t.query(testApi.testQuery, {});
    expect(notes[0].text).toBe("Action note");
  });
});
