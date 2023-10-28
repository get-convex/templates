// convex/env.d.ts
declare namespace Lucia {
  type Auth = import("@convex-dev/convex-lucia-auth").Auth;
  type DatabaseUserAttributes =
    import("@convex-dev/convex-lucia-auth").DatabaseUserAttributes & {
      email: string;
    };
  type DatabaseSessionAttributes =
    import("@convex-dev/convex-lucia-auth").DatabaseSessionAttributes;
}

declare namespace ConvexLuciaAuth {
  type DataModel = import("./_generated/dataModel").DataModel;
}
