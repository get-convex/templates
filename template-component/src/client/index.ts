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
  constructor(
    public component: ComponentApi,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    public options?: {
      // Common parameters:
      // logLevel
    },
  ) {}

  async list(ctx: CtxWith<"runQuery">) {
    return ctx.runQuery(this.component.lib.list, {});
  }

  async add(ctx: CtxWith<"runMutation">, text: string) {
    return ctx.runMutation(this.component.lib.add, { text });
  }

  async addWithValidation(ctx: CtxWith<"runAction">, text: string) {
    return ctx.runAction(this.component.lib.addWithValidation, { text });
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
        args: {},
        handler: async (ctx) => {
          return await this.list(ctx);
        },
      }),
      add: mutationGeneric({
        args: { text: v.string() },
        handler: async (ctx, args) => {
          return await this.add(ctx, args.text);
        },
      }),
      addWithValidation: actionGeneric({
        args: { text: v.string() },
        handler: async (ctx, args) => {
          return await this.addWithValidation(ctx, args.text);
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
   *   path: "/notes/last",
   * });
   *
   * export default http;
   * ```
   */
  registerRoutes(
    http: HttpRouter,
    {
      path = "/notes/last",
    }: {
      path?: string;
    } = {},
  ) {
    http.route({
      path,
      method: "GET",
      handler: httpActionGeneric(async (ctx, _request) => {
        const notes = await ctx.runQuery(this.component.lib.list, {});
        const lastNote = notes[0] ?? null;
        return new Response(JSON.stringify(lastNote), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }),
    });
  }
}
