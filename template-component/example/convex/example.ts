import { action, mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { translate } from "@example/sample-component";
import { v } from "convex/values";
import { getAuthUserId } from "./auth.js";

export const addComment = mutation({
  args: { text: v.string(), postId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    // A real app might check who can comment on what.
    if (!userId) {
      throw new Error("Unauthorized");
    }
    return await ctx.runMutation(components.sampleComponent.lib.add, {
      text: args.text,
      targetId: args.postId,
      userId,
    });
  },
});

export const listComments = query({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    // A real app might check who can see what.
    return await ctx.runQuery(components.sampleComponent.lib.list, {
      targetId: args.postId,
    });
  },
});

export const translateComment = action({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    await translate(ctx, components.sampleComponent, args.commentId);
    /** Or by calling the component directly:
    return await ctx.runAction(components.sampleComponent.lib.translate, {
      baseUrl: process.env.BASE_URL ?? "https://pirate.monkeyness.com",
      commentId: args.commentId,
    });
    */
  },
});
