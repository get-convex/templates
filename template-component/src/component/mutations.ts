import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server.js";

export const add = mutation({
  args: {
    text: v.string(),
    userId: v.string(),
    targetId: v.string(),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      text: args.text,
      userId: args.userId,
      targetId: args.targetId,
    });
    return commentId;
  },
});

export const updateComment = internalMutation({
  args: {
    commentId: v.id("comments"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, { text: args.text });
  },
});
