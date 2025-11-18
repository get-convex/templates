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

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notes").order("desc").collect();
  },
});

export const getNote = internalQuery({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.union(
    v.null(),
    v.object({
      text: v.string(),
      userId: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.noteId);
  },
});
export const add = mutation({
  args: {
    text: v.string(),
    userId: v.string(),
  },
  returns: v.id("notes"),
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      text: args.text,
      userId: args.userId,
    });
    return noteId;
  },
});
export const updateNote = internalMutation({
  args: {
    noteId: v.id("notes"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.noteId, { text: args.text });
  },
});

export const convertToPirateTalk = action({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // $ curl 'https://pirate.monkeyness.com/api/translate?english=What%20is%20an%20API?'
    const note = (await ctx.runQuery(internal.lib.getNote, {
      noteId: args.noteId,
    })) as { text: string; userId: string } | null;
    if (!note) {
      throw new Error("Note not found");
    }
    const response = await fetch(
      `https://pirate.monkeyness.com/api/translate?english=${encodeURIComponent(note.text)}`,
    );
    const data = await response.text();
    await ctx.runMutation(internal.lib.updateNote, {
      noteId: args.noteId,
      text: data,
    });
    return data;
  },
});

export const getLastNote = httpActionGeneric(async (ctx, _request) => {
  const notes = await ctx.runQuery(api.lib.list, {});
  const lastNote = notes[0] ?? null;
  return new Response(JSON.stringify(lastNote), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
