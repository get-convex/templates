import {
  Expand,
  FunctionReference,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
type ComponentApi = InternalizeApi<typeof api>;

export class Client {
  constructor(
    public api: ComponentApi,
    public shards: number = 1
  ) {}
  async add(ctx: RunMutationCtx, name: string, count: number = 1) {
    return ctx.runMutation(this.api.public.add, {
      name,
      count,
      shards: this.shards,
    });
  }
  async get(ctx: RunQueryCtx, name: string) {
    return ctx.runQuery(this.api.public.get, { name });
  }
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

// TODO: Copy in a concrete API from example/_generated/server.d.ts once your API is stable.
import { api } from "../component/_generated/api.js"; // the component's public api
type InternalizeApi<API> = Expand<{
  [K in keyof API]: API[K] extends FunctionReference<
    infer T,
    "public",
    infer A,
    infer R,
    infer P
  >
    ? FunctionReference<T, "internal", A, R, P>
    : InternalizeApi<API[K]>;
}>;
