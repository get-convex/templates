import { action, internalMutation, query } from './_generated/server'
import { api, internal } from './_generated/api.js'
import type { Doc } from './_generated/dataModel'
import type { WithoutSystemFields } from 'convex/server'

export const list = query(async (ctx) => {
  return await ctx.db.query('posts').collect()
})

export const insert = internalMutation(
  (ctx, { post }: { post: WithoutSystemFields<Doc<'posts'>> }) =>
    ctx.db.insert('posts', post),
)

export const populate = action(async (ctx) => {
  const existing = await ctx.runQuery(api.posts.list)
  if (existing.length) {
    return
  }
  const posts = (await (
    await fetch('https://jsonplaceholder.typicode.com/posts')
  ).json()) as {
    userId: string
    id: number
    title: string
    body: string
  }[]
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
})
