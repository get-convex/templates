import { defineApp } from "convex/server";
import component from "@convex-dev/counter/convex.config.js";

const app = defineApp();
app.use(component, { name: "counter" });

export default app;
