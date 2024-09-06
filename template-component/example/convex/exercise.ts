import { internalMutation, components } from "./_generated/server.js";
import { Client, defineCounter } from "../../src/client/index.js";

const counter = new Client(components.counter, { shards: { beans: 100 } });

const usersCounter = defineCounter(components.counter, "users", 100);

export const usingClient = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    await counter.add(ctx, "accomplishments");
    await counter.add(ctx, "beans", 2);
    const count = await counter.count(ctx, "beans");
    return count;
  },
});

export const usingFunctions = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    await usersCounter.inc(ctx);
    await usersCounter.inc(ctx);
    await usersCounter.dec(ctx);
    return usersCounter.count(ctx);
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
    const count = await ctx.runQuery(components.counter.public.count, {
      name: "beans",
    });
    return count;
  },
});
