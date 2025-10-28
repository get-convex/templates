import { defineApp } from "convex/server";
import shardedCounter from "@example/sharded-counter/convex.config";
import sibling from "../../src/component/convex.config.js";

const app = defineApp();
app.use(shardedCounter);
app.use(sibling, { name: "sibling" });

export default app;
