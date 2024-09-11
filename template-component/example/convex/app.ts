import { components, mutation, query } from "./_generated/server.js";
import { defineCounter } from "@convex-dev/counter";

const example = defineCounter(components.counter, "example", 0);

export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await example.inc(ctx);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx, _args) => {
    return await example.count(ctx);
  },
});
