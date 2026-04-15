import { httpRouter } from "convex/server";
import { registerRoutes } from "@example/sample-component";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  // this will be mounted under the app's httpPrefix, as defined in the app's convex.config.ts
  path: `/last`,
  method: "GET",
  handler: httpAction(async (ctx, request) => {
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
    const comments = await ctx.runQuery(api.lib.list, {
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

export default http;
