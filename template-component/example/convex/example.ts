import { mutation } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { SampleComponent } from "@example/sample-component";

const sampleComponent = new SampleComponent(components.sampleComponent, {});

export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await sampleComponent.add(ctx, "accomplishments");
  },
});

// Direct re-export of component's API.
export const { add, count } = sampleComponent.api();
