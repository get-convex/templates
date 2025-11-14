import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  test("addNote and listNotes", async () => {
    const t = initConvexTest();
    const noteId = await t.mutation(api.example.addNote, {
      text: "My note",
    });
    expect(noteId).toBeDefined();
    const notes = await t.query(api.example.listNotes, {});
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toBe("My note");
  });

  test("addNoteWithValidation", async () => {
    const t = initConvexTest();
    await t.action(api.example.addNoteWithValidation, {
      text: "  Validated note  ",
    });
    const notes = await t.query(api.example.list, {});
    expect(notes[0].text).toBe("Validated note");
  });
});
