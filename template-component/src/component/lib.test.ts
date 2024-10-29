/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
import { api } from "./_generated/api.js";

const modules = import.meta.glob("./**/*.*s");

describe("counter", () => {
  test("add and subtract", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.lib.add, { name: "beans", count: 10 });
    await t.mutation(api.lib.add, { name: "beans", count: 5 });
    expect(await t.query(api.lib.count, { name: "beans" })).toEqual(15);
    await t.mutation(api.lib.add, { name: "beans", count: -5 });
    expect(await t.query(api.lib.count, { name: "friends" })).toEqual(0);
    await t.mutation(api.lib.add, { name: "friends", count: 6, shards: 1 });
    await t.mutation(api.lib.add, { name: "friends", count: 2, shards: 1 });
    await t.mutation(api.lib.add, { name: "friends", count: 3, shards: 3 });
    expect(await t.query(api.lib.count, { name: "beans" })).toEqual(10);
    expect(await t.query(api.lib.count, { name: "friends" })).toEqual(11);
  });
});
