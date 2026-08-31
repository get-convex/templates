import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: {
    session: v.object({
      id: v.string(),
      surveyed_user_id: v.any(),
      form_id: v.string(),
      status: v.string(),
    }),
  },

  handler: async (ctx, args) => {
    const response = await ctx.db.insert("session", args.session);

    return { response: response };
  },
});