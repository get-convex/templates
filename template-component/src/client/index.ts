import {
  actionGeneric,
  httpActionGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import type { HttpRouter } from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";
import type { CtxWith } from "./types.js";

// This is a thick client for the component. In your convex app, you can re-export
// the component's API like this:
// ```ts
// export const { list, add, addWithValidation } = sampleComponent.api();
// ```
// Then you can use the component's methods directly in your convex functions.
// ```ts
// export const addNote = mutation({
//   args: { text: v.string() },
//   handler: async (ctx, args) => {
//     return await sampleComponent.add(ctx, args.text);
//   },
// });
// ```

// See the example/convex/example.ts file for an example of how to use this thick client.

// UseApi<typeof api> is an alternative that has jump-to-definition but is
// less stable and reliant on types within the component files, which can cause
// issues where passing `components.foo` doesn't match the argument

export class SampleComponent {
  getUserIdCallback: (
    ctx: CtxWith<"runQuery"> | CtxWith<"runMutation">,
  ) => string;
  constructor(
    public component: ComponentApi,
    public options: {
      // Common parameters:
      // logLevel
      getUserIdCallback: (
        ctx: CtxWith<"runQuery"> | CtxWith<"runMutation">,
      ) => string;
    },
  ) {
    this.getUserIdCallback = options.getUserIdCallback;
  }

  async list(ctx: CtxWith<"runQuery">, targetId: string) {
    return ctx.runQuery(this.component.lib.list, { targetId });
  }

  async add(ctx: CtxWith<"runMutation">, text: string, targetId: string) {
    const userId = this.getUserIdCallback(ctx);
    return ctx.runMutation(this.component.lib.add, { text, userId, targetId });
  }

  async convertToPirateTalk(ctx: CtxWith<"runAction">, commentId: string) {
    return ctx.runAction(this.component.lib.convertToPirateTalk, { commentId });
  }

  /**
   * For easy re-exporting.
   * Apps can do
   * ```ts
   * export const { list, add, addWithValidation } = sampleComponent.api();
   * ```
   */
  api() {
    return {
      list: queryGeneric({
        args: { targetId: v.string() },
        handler: async (ctx, args) => {
          return await this.list(ctx, args.targetId);
        },
      }),
      add: mutationGeneric({
        args: { text: v.string(), targetId: v.string() },
        handler: async (ctx, args) => {
          return await this.add(ctx, args.text, args.targetId);
        },
      }),
      convertToPirateTalk: actionGeneric({
        args: { commentId: v.string() },
        handler: async (ctx, args) => {
          return await this.convertToPirateTalk(ctx, args.commentId);
        },
      }),
    };
  }

  /**
   * Register HTTP routes for the component.
   * This allows you to expose HTTP endpoints for the component.
   *
   * @example
   * ```ts
   * import { httpRouter } from "convex/server";
   * const http = httpRouter();
   *
   * const sampleComponent = new SampleComponent(components.sampleComponent);
   * sampleComponent.registerRoutes(http, {
   *   path: "/comments/last",
   * });
   *
   * export default http;
   * ```
   */
  registerRoutes(
    http: HttpRouter,
    {
      path = "/comments/last",
    }: {
      path?: string;
    } = {},
  ) {
    http.route({
      path,
      method: "GET",
      handler: httpActionGeneric(async (ctx, request) => {
        const targetId = new URL(request.url).searchParams.get("targetId");
        if (!targetId) {
          return new Response(
            JSON.stringify({ error: "targetId parameter required" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
        const comments = await ctx.runQuery(this.component.lib.list, {
          targetId,
        });
        const lastComment = comments[0] ?? null;
        return new Response(JSON.stringify(lastComment), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }),
    });
  }
}
