import { httpRouter } from "convex/server";
import { sampleComponent } from "./example.js";

const http = httpRouter();

// Initialize the component

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
