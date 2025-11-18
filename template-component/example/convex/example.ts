import { action, mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { SampleComponent } from "@example/sample-component";
import { v } from "convex/values";

export const sampleComponent = new SampleComponent(components.sampleComponent, {
  getUserIdCallback: (_ctx) => {
    return "user123";
  },
});

// Example of using the component's methods directly
export const addNote = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.add(ctx, args.text);
  },
});

export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    return await sampleComponent.list(ctx);
  },
});

export const convertToPirateTalkAction = action({
  args: { noteId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.convertToPirateTalk(ctx, args.noteId);
  },
});

// Here is an alternative way to use the component's methods directly by re-exporting
// the component's API:
export const { list, add, convertToPirateTalk } = sampleComponent.api();

// You can also register HTTP routes for the component. See http.ts for an example.
