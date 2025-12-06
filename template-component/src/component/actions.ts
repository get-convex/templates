import { v } from "convex/values";
import { action } from "./_generated/server.js";
import { internal } from "./_generated/api.js";

export const translate = action({
  args: {
    commentId: v.id("comments"),
    baseUrl: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const comment = (await ctx.runQuery(internal.queries.getComment, {
      commentId: args.commentId,
    })) as { text: string; userId: string } | null;
    if (!comment) {
      throw new Error("Comment not found");
    }
    const response = await fetch(
      `${args.baseUrl}/api/translate?english=${encodeURIComponent(comment.text)}`,
    );
    const data = await response.text();
    await ctx.runMutation(internal.mutations.updateComment, {
      commentId: args.commentId,
      text: data,
    });
    return data;
  },
});
