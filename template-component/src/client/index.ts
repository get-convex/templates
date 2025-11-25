import {
  actionGeneric,
  httpActionGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import type {
  Auth,
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpRouter,
} from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";

// See the example/convex/example.ts file for how to use this component.

export class SampleComponent {
  private baseUrl: string;
  constructor(
    public component: ComponentApi,
    public options?: {
      // Allows overriding the base URL for the component.
      BASE_URL?: string;
    },
  ) {
    this.baseUrl =
      options?.BASE_URL ??
      // process.env isn't available in the component,
      // so we need to pass it in as an argument to translate.
      process.env.BASE_URL ??
      "https://pirate.monkeyness.com";
  }

  async list(ctx: QueryCtx | MutationCtx | ActionCtx, targetId: string) {
    return await ctx.runQuery(this.component.lib.list, { targetId });
  }

  async add(
    ctx: MutationCtx | ActionCtx,
    args: {
      targetId: string;
      userId: string;
      text: string;
    },
  ) {
    return await ctx.runMutation(this.component.lib.add, {
      text: args.text,
      userId: args.userId,
      targetId: args.targetId,
    });
  }

  async translate(ctx: ActionCtx, commentId: string) {
    return await ctx.runAction(this.component.lib.translate, {
      baseUrl: this.baseUrl,
      commentId,
    });
  }

  /**
   * For easy re-exporting of an API accessible from React clients.
   * e.g. `export const { list, add, translate } = sampleComponent.api({ });`
   * See example/convex/example.ts.
   */
  api(options: {
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
  }) {
    return {
      list: queryGeneric({
        args: { targetId: v.string() },
        handler: async (ctx, args) => {
          await options.auth(ctx, { type: "read", targetId: args.targetId });
          return await this.list(ctx, args.targetId);
        },
      }),
      add: mutationGeneric({
        args: { text: v.string(), targetId: v.string() },
        handler: async (ctx, args) => {
          const userId = await options.auth(ctx, {
            type: "create",
            targetId: args.targetId,
          });
          return await this.add(ctx, {
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
          return await this.translate(ctx, args.commentId);
        },
      }),
    };
  }
}

/**
 * Register HTTP routes for the component.
 * This allows you to expose HTTP endpoints for the component.
 * See example/convex/http.ts for an example.
 */
export function registerRoutes(
  http: HttpRouter,
  component: ComponentApi,
  { pathPrefix = "/comments" }: { pathPrefix?: string } = {},
) {
  http.route({
    path: `${pathPrefix}/last`,
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
      const comments = await ctx.runQuery(component.lib.list, {
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

// Convenient types for `ctx` args, that only include the bare minimum.
type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
type MutationCtx = Pick<
  GenericMutationCtx<GenericDataModel>,
  "runQuery" | "runMutation"
>;
type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;
