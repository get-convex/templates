import { defineApp } from "convex/server";
import shardedCounter from "@example/sharded-counter/convex.config";

const app = defineApp();
app.use(shardedCounter);

export default app;
