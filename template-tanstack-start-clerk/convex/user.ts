import { query } from './_generated/server'

export const profile = query({
  args: {},
  handler: async (ctx) => {
    return ctx.auth.getUserIdentity()
  },
})
