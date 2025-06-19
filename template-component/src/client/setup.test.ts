/// <reference types="vite/client" />
import { test } from "vitest";
import { convexTest } from "convex-test";
export const modules = import.meta.glob("./**/*.*s");

import {
  defineSchema,
  type GenericSchema,
  type SchemaDefinition,
} from "convex/server";
import { type ShardedCounterComponent } from "./index.js";
import { componentsGeneric } from "convex/server";
import componentSchema from "../component/schema.js";
export { componentSchema };
export const componentModules = import.meta.glob("../component/**/*.ts");

export function initConvexTest<
  Schema extends SchemaDefinition<GenericSchema, boolean>,
>(schema?: Schema) {
  const t = convexTest(schema ?? defineSchema({}), modules);
  t.registerComponent("shardedCounter", componentSchema, componentModules);
  return t;
}
export const components = componentsGeneric() as unknown as {
  shardedCounter: ShardedCounterComponent;
};

test("setup", () => {});
