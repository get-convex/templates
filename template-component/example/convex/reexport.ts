import { components } from "./_generated/api.js";
import { exposeApi } from "@example/sample-component";
import { getAuthUserId } from "./auth.js";
// Here is an alternative way to use the component's methods directly by re-exporting
// the component's API:
export const { list, add, translate } = exposeApi(components.sampleComponent, {
  auth: async (ctx, operation) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null && operation.type !== "read") {
      throw new Error("Unauthorized");
    }
    return userId ?? "anonymous";
  },
  // Environment variables aren't available in the component,
  // so we need to pass it in as an argument to the component when necessary.
  baseUrl: process.env.BASE_URL ?? "https://pirate.monkeyness.com",
});

// You can also register HTTP routes for the component. See http.ts for an example.
