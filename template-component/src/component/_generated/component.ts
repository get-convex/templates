/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    actions: {
      translate: FunctionReference<
        "action",
        "internal",
        { baseUrl: string; commentId: string },
        string,
        Name
      >;
    };
    mutations: {
      add: FunctionReference<
        "mutation",
        "internal",
        { targetId: string; text: string; userId: string },
        string,
        Name
      >;
    };
    queries: {
      list: FunctionReference<
        "query",
        "internal",
        { limit?: number; targetId: string },
        Array<{
          _creationTime: number;
          _id: string;
          targetId: string;
          text: string;
          userId: string;
        }>,
        Name
      >;
    };
  };
