import { v } from 'convex/values'
import { action, internalMutation, query } from './_generated/server'
import { api, internal } from './_generated/api.js'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('posts').collect()
  },
})

export const insert = internalMutation({
  args: {
    post: v.object({ id: v.string(), title: v.string(), body: v.string() }),
  },
  handler: (ctx, { post }) => ctx.db.insert('posts', post),
})

export const populate = action({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.runQuery(api.posts.list)
    if (existing.length) {
      return
    }
    const posts = (await (
      await fetch('https://jsonplaceholder.typicode.com/posts')
    ).json()) as Array<{
      userId: string
      id: number
      title: string
      body: string
    }>
    await Promise.all(
      posts.slice(0, 10).map((post) =>
        ctx.runMutation(internal.posts.insert, {
          post: {
            id: post.id.toString(),
            body: post.body,
            title: post.title,
          },
        }),
      ),
    )
  },
})
