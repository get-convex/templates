import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  comments: defineTable({
    text: v.string(),
    userId: v.string(), // Note: you can't use v.id referring to external tables
    targetId: v.string(),
  }).index("targetId", ["targetId"]),
});
