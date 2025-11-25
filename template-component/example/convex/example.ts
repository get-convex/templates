import { action, mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { SampleComponent } from "@example/sample-component";
import { v } from "convex/values";
import { Auth } from "convex/server";

export const sampleComponent = new SampleComponent(components.sampleComponent);

// Example of using the component's Class-based client
export const addComment = mutation({
  args: { text: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.add(ctx, {
      text: args.text,
      targetId: args.targetId,
      userId: await getAuthUserId(ctx),
    });
  },
});

// Example of calling the component's raw API directly.
export const listComments = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.sampleComponent.lib.list, {
      targetId: args.targetId,
    });
  },
});

export const translateComment = action({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.translate(ctx, args.commentId);
  },
});

// Here is an alternative way to use the component's methods directly by re-exporting
// the component's API:
export const { list, add, translate } = sampleComponent.api({
  auth: async (ctx, operation) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null && operation.type !== "read") {
      throw new Error("Unauthorized");
    }
    return userId;
  },
});

// You can also register HTTP routes for the component. See http.ts for an example.

async function getAuthUserId(ctx: { auth: Auth }) {
  return (await ctx.auth.getUserIdentity())?.subject ?? "anonymous";
}
