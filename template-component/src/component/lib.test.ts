/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
import { api } from "./_generated/api.js";
import { modules } from "./setup.test.js";

describe("component lib", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("add and list notes", async () => {
    const t = convexTest(schema, modules);
    const noteId = await t.mutation(api.lib.add, { text: "Hello, world!" });
    expect(noteId).toBeDefined();
    const notes = await t.query(api.lib.list, {});
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toEqual("Hello, world!");
  });
  test("addWithValidation action", async () => {
    const t = convexTest(schema, modules);
    const noteId = await t.action(api.lib.addWithValidation, {
      text: "  Valid note  ",
    });
    expect(noteId).toBeDefined();
    const notes = await t.query(api.lib.list, {});
    expect(notes[0].text).toEqual("Valid note");
  });
  test("addWithValidation rejects empty text", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.action(api.lib.addWithValidation, { text: "   " }),
    ).rejects.toThrow("Note text cannot be empty");
  });
});
