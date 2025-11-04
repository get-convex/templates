import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

export type CtxWith<T extends "runQuery" | "runMutation" | "runAction"> = Pick<
  {
    runQuery: <Query extends FunctionReference<"query", "internal">>(
      query: Query,
      args: FunctionArgs<Query>,
    ) => Promise<FunctionReturnType<Query>>;
    runMutation: <Mutation extends FunctionReference<"mutation", "internal">>(
      mutation: Mutation,
      args: FunctionArgs<Mutation>,
    ) => Promise<FunctionReturnType<Mutation>>;
    runAction: <Action extends FunctionReference<"action", "internal">>(
      action: Action,
      args: FunctionArgs<Action>,
    ) => Promise<FunctionReturnType<Action>>;
  },
  T
>;
