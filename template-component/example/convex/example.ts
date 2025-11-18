import { action, mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { SampleComponent } from "@example/sample-component";
import { v } from "convex/values";

export const sampleComponent = new SampleComponent(components.sampleComponent, {
  getUserIdCallback: (_ctx) => {
    // in a real application, you would use the _ctx to get the user ID
    // from the database or the authentication system.
    //  _ctx.auth.getUserIdentity();
    return "user123";
  },
});

// Example of using the component's methods directly
export const addComment = mutation({
  args: { text: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.add(ctx, args.text, args.targetId);
  },
});

export const listComments = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.list(ctx, args.targetId);
  },
});

export const convertToPirateTalkAction = action({
  args: { commentId: v.string() },
  handler: async (ctx, args) => {
    return await sampleComponent.convertToPirateTalk(ctx, args.commentId);
  },
});

// Here is an alternative way to use the component's methods directly by re-exporting
// the component's API:
export const { list, add, convertToPirateTalk } = sampleComponent.api();

// You can also register HTTP routes for the component. See http.ts for an example.
