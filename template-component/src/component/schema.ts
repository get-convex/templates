import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    text: v.string(),
    createdAt: v.number(),
  }),
});
