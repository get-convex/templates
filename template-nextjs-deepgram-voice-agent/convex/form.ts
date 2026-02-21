import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createForm = mutation({
  args: {
    form_schema: v.object({
      id: v.string(),
      slug: v.string(),
      title: v.string(),
      user_id: v.any(),
      questions: v.array(
        v.object({
          id: v.string(),
          type: v.string(),
          title: v.string(),
          description: v.optional(v.string()),
          options: v.optional(v.array(v.string())),
          required: v.boolean(),
        })
      ),
    }),
  },

  handler: async (ctx, args) => {
    
    const response = await ctx.db.insert("form", args.form_schema);

    return { response: response };
  },
});

export const getUserForms = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("form")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .order("desc")
      .collect();
  },
});

// NEW: Paginated version of getUserForms
export const getUserFormsPaginated = query({
  args: { 
    user_id: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("form")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getForm = query({
  args: {
    id: v.string()
  },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();
   
    if (identity === null) {
      throw new Error("Not authenticated");
    }

   
    
    const user_id= identity?.subject
    const form = await ctx.db
      .query("form")
      .withIndex("by_form_id", (q) => q.eq("id", args.id))
      .filter((q) => q.eq(q.field("user_id"), user_id))
      .first();

    return form ?? null;
  },
});



export const getFormByID = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();
 
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const form = await ctx.db
      .query("form")
      .withIndex("by_form_id", (q) => q.eq("id", args.id))
      .first();

    return form ?? null;
  },
});


export const deleteForm = mutation({
  args: {
    id: v.string(),     
  },
  handler: async (ctx, args) => {

     const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user_id= identity?.subject
    // 1. Find the form where BOTH the custom id and user_id match
    const form = await ctx.db
      .query("form")
      .withIndex("by_form_id", (q) => q.eq("id", args.id))
      .filter((q) => q.eq(q.field("user_id"), user_id))
      .first();

   
    if (!form) {
      throw new Error(
        "Form not found or you do not have permission to delete it."
      );
    }

    // 3. Delete using the internal Convex _id
    await ctx.db.delete(form._id);

    return { success: true, deletedId: args.id };
  },
})

export const updateForm = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    questions: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        options: v.optional(v.array(v.string())),
        required: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();
   
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user_id= identity?.subject
    const existing = await ctx.db
      .query("form")
      .withIndex("by_form_id", (q) => q.eq("id", args.id))
      .filter((q) => q.eq(q.field("user_id"), user_id))
      .first();

    if (!existing) {
      throw new Error("Form not found");
    }

    await ctx.db.patch(existing._id, {
      title: args.title,
      questions: args.questions,
    });

    return { success: true };
  },
});

// Server-side paginated query
export const getSessionsWithResponsesByForm = query({
  args: { 
    form_id: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user_id = identity.subject;

    // 1. AUTHORIZATION GATEKEEPER
    // Check if the form exists AND belongs to the current user
    const form = await ctx.db
      .query("form")
      .withIndex("by_form_id", (q) => q.eq("id", args.form_id)) // Using your stored ID logic
      .filter((q) => q.eq(q.field("user_id"), user_id))
      .first();

    if (!form) {
      // If the form doesn't exist or isn't owned by the user, return empty/error
      // Returning null or empty prevents unauthorized data leaks
      return { page: [], isDone: true, continueCursor: "" };
    }

    // 2. FETCH DATA
    // Now we know the user is authorized, we can fetch all sessions for this form
    const paginatedSessions = await ctx.db
      .query("session")
      .withIndex("by_form_id", (q) => q.eq("form_id", args.form_id))
      .order("desc")
      .paginate(args.paginationOpts);

    const sessionsWithResponses = await Promise.all(
      paginatedSessions.page.map(async (session) => {
        const responses = await ctx.db
          .query("responses")
          .withIndex("by_session_id", (q) => q.eq("session_id", session.id))
          .collect();

        return {
          ...session,
          responses,
        };
      })
    );

    return {
      ...paginatedSessions,
      page: sessionsWithResponses,
    };
  },
});