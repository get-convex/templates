import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    text: v.string(),
    userId: v.string(), // Note: you can't use v.id referring to external tables
  }).index("userId", ["userId"]),
});
