import {defineSchema, defineTable} from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    
    users: defineTable({
        id: v.string(),
        name: v.string(),
        email: v.string(),
  
    }).index("by_email",["email"]),

    form: defineTable({
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
      }))
    }).index("by_slug",["slug"])
    .index("by_user_id",["user_id"])
    .index("by_form_id",["id"]),

    session: defineTable({
        id: v.string(),
        surveyed_user_id: v.string(),
        form_id: v.string(),
        status: v.string(),
    }).index("by_session_id",["id"])
    .index("by_form_id",["form_id"]),

    responses: defineTable({
        session_id: v.string(),
        question_id: v.string(),
        question: v.string(),
        type: v.string(),
        answer: v.string(),
    }).index("by_session_id",["session_id"]),

    transcripts: defineTable({
    sessionId: v.id("surveySessions"),
    transcriptText: v.string(),
    createdAt: v.number(),
  })
  .index("by_session", ["sessionId"]),

})