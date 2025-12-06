import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server.js";
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
    return await ctx.db.get(args.commentId);
  },
});
