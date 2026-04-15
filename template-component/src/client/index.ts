import {
  actionGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import type {
  Auth,
  GenericActionCtx,
  GenericDataModel,
} from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";

// See the example/convex/example.ts file for how to use this component.

/**
 *
 * @param ctx
 * @param targetId
 */
export function translate(
  ctx: ActionCtx,
  component: ComponentApi,
  commentId: string,
) {
  // By wrapping the function call, we can read from environment variables.
  const baseUrl = getDefaultBaseUrlUsingEnv();
  return ctx.runAction(component.lib.translate, { commentId, baseUrl });
}

/**
 * For re-exporting of an API accessible from React clients.
 * e.g. `export const { list, add, translate } =
 * exposeApi(components.sampleComponent, {
 *   auth: async (ctx, operation) => { ... },
 * });`
 * See example/convex/example.ts.
 */
export function exposeApi(
  component: ComponentApi,
  options: {
    /**
     * It's very important to authenticate any functions that users will export.
     * This function should return the authorized user's ID.
     */
    auth: (
      ctx: { auth: Auth },
      operation:
        | { type: "read"; targetId: string }
        | { type: "create"; targetId: string }
        | { type: "update"; commentId: string },
    ) => Promise<string>;
    baseUrl?: string;
  },
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrlUsingEnv();
  return {
    list: queryGeneric({
      args: { targetId: v.string() },
      handler: async (ctx, args) => {
        await options.auth(ctx, { type: "read", targetId: args.targetId });
        return await ctx.runQuery(component.lib.list, {
          targetId: args.targetId,
        });
      },
    }),
    add: mutationGeneric({
      args: { text: v.string(), targetId: v.string() },
      handler: async (ctx, args) => {
        const userId = await options.auth(ctx, {
          type: "create",
          targetId: args.targetId,
        });
        return await ctx.runMutation(component.lib.add, {
          text: args.text,
          userId: userId,
          targetId: args.targetId,
        });
      },
    }),
    translate: actionGeneric({
      args: { commentId: v.string() },
      handler: async (ctx, args) => {
        await options.auth(ctx, {
          type: "update",
          commentId: args.commentId,
        });
        return await ctx.runAction(component.lib.translate, {
          commentId: args.commentId,
          baseUrl,
        });
      },
    }),
  };
}


function getDefaultBaseUrlUsingEnv() {
  return process.env.BASE_URL ?? "https://pirate.monkeyness.com";
}

// Convenient types for `ctx` args, that only include the bare minimum.

// type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
// type MutationCtx = Pick<
//   GenericMutationCtx<GenericDataModel>,
//   "runQuery" | "runMutation"
// >;
type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;
