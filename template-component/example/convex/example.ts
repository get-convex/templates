import { action, mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { SampleComponent } from "@example/sample-component";
import { v } from "convex/values";

const sampleComponent = new SampleComponent(components.sampleComponent, {});

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

export const addNoteWithValidation = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.addWithValidation(ctx, args.text);
  },
});

// Direct re-export of component's API.
export const { list, add, addWithValidation } = sampleComponent.api();
