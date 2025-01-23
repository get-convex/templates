import { internalMutation, query, mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { ShardedCounter } from "@convex-dev/sharded-counter";

const shardedCounter = new ShardedCounter(components.shardedCounter, {
  shards: { beans: 10, users: 100 },
});
const numUsers = shardedCounter.for("users");

export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await numUsers.inc(ctx);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx, _args) => {
    return await numUsers.count(ctx);
  },
});

export const usingClient = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await shardedCounter.add(ctx, "accomplishments");
    await shardedCounter.add(ctx, "beans", 2);
    const count = await shardedCounter.count(ctx, "beans");
    return count;
  },
});

export const usingFunctions = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await numUsers.inc(ctx);
    await numUsers.inc(ctx);
    await numUsers.dec(ctx);
    return numUsers.count(ctx);
  },
});

export const directCall = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await ctx.runMutation(components.shardedCounter.lib.add, {
      name: "pennies",
      count: 250,
    });
    await ctx.runMutation(components.shardedCounter.lib.add, {
      name: "beans",
      count: 3,
      shards: 100,
    });
    const count = await ctx.runQuery(components.shardedCounter.lib.count, {
      name: "beans",
    });
    return count;
  },
});

// Direct re-export of component's API.
export const { add, count } = shardedCounter.api();
