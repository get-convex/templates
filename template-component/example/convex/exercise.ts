import { internalMutation, components } from "./_generated/server.js";
import { Client } from "../../src/client/index.js";

const counter = new Client(components.counter, { shards: { beans: 100 } });

export const usingClient = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    await counter.add(ctx, "accomplishments");
    await counter.add(ctx, "beans", 2);
    const count = await counter.get(ctx, "beans");
    return count;
  },
});

export const directCall = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    await ctx.runMutation(components.counter.public.add, {
      name: "pennies",
      count: 250,
    });
    await ctx.runMutation(components.counter.public.add, {
      name: "beans",
      count: 3,
      shards: 100,
    });
    const count = await ctx.runQuery(components.counter.public.get, {
      name: "beans",
    });
    return count;
  },
});
