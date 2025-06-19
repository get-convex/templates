import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { Mounts } from "../component/_generated/api";
import type { UseApi, RunMutationCtx, RunQueryCtx } from "./types";

// UseApi<typeof api> is an alternative that has jump-to-definition but is
// less stable and reliant on types within the component files, which can cause
// issues where passing `components.foo` doesn't match the argument
export type ShardedCounterComponent = UseApi<Mounts>;

export class ShardedCounter<Shards extends Record<string, number>> {
  constructor(
    public component: ShardedCounterComponent,
    public options?: {
      shards?: Shards;
      defaultShards?: number;
      // Common parameters:
      // logLevel
    }
  ) {}
  async add<Name extends string = keyof Shards & string>(
    ctx: RunMutationCtx,
    name: Name,
    count: number = 1
  ) {
    const shards = this.options?.shards?.[name] ?? this.options?.defaultShards;
    return ctx.runMutation(this.component.lib.add, {
      name,
      count,
      shards,
    });
  }
  async count<Name extends string = keyof Shards & string>(
    ctx: RunQueryCtx,
    name: Name
  ) {
    return ctx.runQuery(this.component.lib.count, { name });
  }
  /**
   * For easy re-exporting.
   * Apps can do
   * ```ts
   * export const { add, count } = shardedCounter.api();
   * ```
   */
  api() {
    return {
      add: mutationGeneric({
        args: { name: v.string() },
        handler: async (ctx, args) => {
          await this.add(ctx, args.name);
        },
      }),
      count: queryGeneric({
        args: { name: v.string() },
        handler: async (ctx, args) => {
          return await this.count(ctx, args.name);
        },
      }),
    };
  }
}
