import { action, mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { exposeApi } from "@example/sample-component";
import { v } from "convex/values";
import { Auth } from "convex/server";

// Environment variables aren't available in the component,
// so we need to pass it in as an argument to the component when necessary.
const BASE_URL = process.env.BASE_URL ?? "https://pirate.monkeyness.com";

export const addComment = mutation({
  args: { text: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runMutation(components.sampleComponent.mutations.add, {
      text: args.text,
      targetId: args.targetId,
      userId: await getAuthUserId(ctx),
    });
  },
});

export const listComments = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.sampleComponent.queries.list, {
      targetId: args.targetId,
    });
  },
});

export const translateComment = action({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runAction(components.sampleComponent.actions.translate, {
      baseUrl: BASE_URL,
      commentId: args.commentId,
    });
  },
});

// Here is an alternative way to use the component's methods directly by re-exporting
// the component's API:
export const { list, add, translate } = exposeApi(components.sampleComponent, {
  auth: async (ctx, operation) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null && operation.type !== "read") {
      throw new Error("Unauthorized");
    }
    return userId;
  },
  baseUrl: BASE_URL,
});

// You can also register HTTP routes for the component. See http.ts for an example.

async function getAuthUserId(ctx: { auth: Auth }) {
  return (await ctx.auth.getUserIdentity())?.subject ?? "anonymous";
}
