import {
  Expand,
  FunctionReference,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { GenericId } from "convex/values";
import { api } from "../component/_generated/api";

export class Client<Shards extends Record<string, number>> {
  constructor(
    public component: UseApi<typeof api>,
    public options?: { shards?: Shards; defaultShards?: number }
  ) {}
  async add<Name extends string = keyof Shards & string>(
    ctx: RunMutationCtx,
    name: Name,
    count: number = 1
  ) {
    const shards = this.options?.shards?.[name] ?? this.options?.defaultShards;
    return ctx.runMutation(this.component.public.add, {
      name,
      count,
      shards,
    });
  }
  async count<Name extends string = keyof Shards & string>(
    ctx: RunQueryCtx,
    name: Name
  ) {
    return ctx.runQuery(this.component.public.count, { name });
  }
}

// Another way of exporting functionality
export function defineCounter(
  component: UseApi<typeof api>,
  name: string,
  shards: number
) {
  return {
    add: async (ctx: RunMutationCtx, count: number = 1) =>
      ctx.runMutation(component.public.add, { name, count, shards }),
    subtract: async (ctx: RunMutationCtx, count: number = 1) =>
      ctx.runMutation(component.public.add, { name, count: -count, shards }),
    inc: async (ctx: RunMutationCtx) =>
      ctx.runMutation(component.public.add, { name, count: 1, shards }),
    dec: async (ctx: RunMutationCtx) =>
      ctx.runMutation(component.public.add, { name, count: -1, shards }),
    count: async (ctx: RunQueryCtx) =>
      ctx.runQuery(component.public.count, { name }),
  };
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends object
        ? { [K in keyof T]: OpaqueIds<T[K]> }
        : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;
