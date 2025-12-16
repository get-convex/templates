import { v } from "convex/values";
import { httpActionGeneric } from "convex/server";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server.js";
import { api, internal } from "./_generated/api.js";
import schema from "./schema.js";

const commentValidator = schema.tables.comments.validator.extend({
  _id: v.id("comments"),
  _creationTime: v.number(),
});

export const list = query({
  args: {
    targetId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(commentValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("targetId", (q) => q.eq("targetId", args.targetId))
      .order("desc")
      .take(args.limit ?? 100);
  },
});

export const getComment = internalQuery({
  args: {
    commentId: v.id("comments"),
  },
  returns: v.union(v.null(), commentValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("comments", args.commentId);
  },
});
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
    await ctx.db.patch("comments", args.commentId, { text: args.text });
  },
});

export const translate = action({
  args: {
    commentId: v.id("comments"),
    baseUrl: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const comment = (await ctx.runQuery(internal.lib.getComment, {
      commentId: args.commentId,
    })) as { text: string; userId: string } | null;
    if (!comment) {
      throw new Error("Comment not found");
    }
    const response = await fetch(
      `${args.baseUrl}/api/translate?english=${encodeURIComponent(comment.text)}`,
    );
    const data = await response.text();
    await ctx.runMutation(internal.lib.updateComment, {
      commentId: args.commentId,
      text: data,
    });
    return data;
  },
});
