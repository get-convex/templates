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

  test("convertToPirateTalkAction", async () => {
    const t = initConvexTest();
    const noteId = await t.mutation(api.example.addNote, {
      text: "My note",
    });
    expect(noteId).toBeDefined();
    await t.action(api.example.convertToPirateTalkAction, {
      noteId: noteId,
    });
    const notes = await t.query(api.example.listNotes, {});
    expect(notes[0].text).toBe("My note");
  });
});
