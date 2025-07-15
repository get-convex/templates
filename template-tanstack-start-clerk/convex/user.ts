import { query } from './_generated/server'

export const profile = query((ctx) => ctx.auth.getUserIdentity())

export const name = query(
  async (ctx) => (await ctx.auth.getUserIdentity())?.name,
)
export const email = query(
  async (ctx) => (await ctx.auth.getUserIdentity())?.email,
)
