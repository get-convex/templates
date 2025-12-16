import { defineApp } from "convex/server";
import sampleComponent from "@example/sample-component/convex.config.js";

const app = defineApp();
app.use(sampleComponent);

export default app;
