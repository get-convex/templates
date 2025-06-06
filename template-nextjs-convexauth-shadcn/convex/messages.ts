import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("messages").order("desc").take(100);
    // Add the author's name to each message.
    return Promise.all(
      messages.map(async (message) => {
        const { name, email } = (await ctx.db.get(message.userId))!;
        return { ...message, author: name ?? email! };
      }),
    );
  },
});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }
    // Send a new message.
    await ctx.db.insert("messages", { body, userId });
  },
});
