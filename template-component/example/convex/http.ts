import { httpRouter } from "convex/server";
import { sampleComponent } from "./example.js";

const http = httpRouter();

// Initialize the component

// Register HTTP routes for the component
// This will expose a GET endpoint at /comments/last that returns the most recent comment
sampleComponent.registerRoutes(http, {
  path: "/comments/last",
});

// You can also register routes at different paths
// sampleComponent.registerRoutes(http, {
//   path: "/api/comments/latest",
// });

export default http;
