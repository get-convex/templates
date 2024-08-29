import { defineApp } from "convex/server";
import component from "../../template-component/src/component/convex.config";

const app = defineApp();
app.install(component, { name: "theComponent" });

export default app;
