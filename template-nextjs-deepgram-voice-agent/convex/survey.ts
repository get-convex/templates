import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createResponses = mutation({
  args: {
    responses: v.array(
      v.object({
        session_id: v.string(),
        question_id: v.string(),
        question: v.string(),
        type: v.string(),
        answer: v.string(),
      })
    ),
  },

  handler: async (ctx, args) => {
    await Promise.all(
      args.responses.map((response:any) =>{
        
        ctx.db.insert("responses", response)
      }
      )
    );

    return { inserted: args.responses.length };
  },
})


