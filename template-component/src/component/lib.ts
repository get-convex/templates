import { v } from "convex/values";
import {
  action,
  internalMutation,
  mutation,
  query,
} from "./_generated/server.js";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
      text: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("notes")
      .withIndex("byCreatedAt")
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    text: v.string(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      text: args.text,
      createdAt: Date.now(),
    });
    return noteId;
  },
});

// Internal mutation that can be called from actions
export const addInternal = internalMutation({
  args: {
    text: v.string(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      text: args.text,
      createdAt: Date.now(),
    });
    return noteId;
  },
});

export const addWithValidation = action({
  args: {
    text: v.string(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args): Promise<any> => {
    // Simulate some external validation or API call
    // In a real app, this might call an external API like OpenAI, Stripe, etc.
    if (args.text.trim().length === 0) {
      throw new Error("Note text cannot be empty");
    }
    // Call the internal mutation
    // We use a lazy import to avoid circular reference issues
    const { internal } = await import("./_generated/api.js");
    const noteId = await ctx.runMutation(internal.lib.addInternal, {
      text: args.text.trim(),
    });
    return noteId;
  },
});
