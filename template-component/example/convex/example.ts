import { mutation } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { ShardedCounter } from "@example/sharded-counter";

const shardedCounter = new ShardedCounter(components.shardedCounter, {});

export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await shardedCounter.add(ctx, "accomplishments");
  },
});

// Direct re-export of component's API.
export const { add, count } = shardedCounter.api();
