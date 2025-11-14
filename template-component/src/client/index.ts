import { actionGeneric, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";
import type { CtxWith } from "./types.js";

// UseApi<typeof api> is an alternative that has jump-to-definition but is
// less stable and reliant on types within the component files, which can cause
// issues where passing `components.foo` doesn't match the argument

export class SampleComponent {
  constructor(
    public component: ComponentApi,
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
}
