import { Auth } from "convex/server";

// For demo purposes
export async function getAuthUserId(ctx: { auth: Auth }) {
  return (await ctx.auth.getUserIdentity())?.subject ?? null;
}
