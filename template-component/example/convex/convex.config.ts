import { defineApp } from "convex/server";
import component from "../../src/counter/convex.config";

const app = defineApp();
app.use(component, { name: "counter" });

export default app;
