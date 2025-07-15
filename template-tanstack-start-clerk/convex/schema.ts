import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  posts: defineTable({
    id: v.string(),
    title: v.string(),
    body: v.string(),
  }).index('id', ['id']),

  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
})
