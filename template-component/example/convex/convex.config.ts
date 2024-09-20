import { defineApp } from "convex/server";
import counter from "@convex-dev/counter/convex.config";

const app = defineApp();
app.use(counter);

export default app;
