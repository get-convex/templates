import { defineApp } from "convex/server";
import sampleComponent from "@example/sample-component/convex.config.js";

const app = defineApp();
app.use(sampleComponent, { httpPrefix: "/comments/" });

export default app;
