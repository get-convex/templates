import { httpRouter } from "convex/server";
import { components } from "./_generated/api.js";
import { SampleComponent } from "@example/sample-component";

const http = httpRouter();

// Initialize the component
const sampleComponent = new SampleComponent(components.sampleComponent);

// Register HTTP routes for the component
// This will expose a GET endpoint at /notes/last that returns the most recent note
sampleComponent.registerRoutes(http, {
  path: "/notes/last",
});

// You can also register routes at different paths
// sampleComponent.registerRoutes(http, {
//   path: "/api/notes/latest",
// });

export default http;
