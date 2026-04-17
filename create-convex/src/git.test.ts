import spawn from "cross-spawn";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isGitInstalled, printMissingGitMessage } from "./git";

vi.mock("cross-spawn", async () => {
  const mockSpawn = {
    sync: vi.fn(),
  };

  return {
    default: mockSpawn,
    ...mockSpawn,
  };
});

describe("git helpers", () => {
  const mockSpawn = (spawn as any).default;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when git --version succeeds", () => {
    mockSpawn.sync.mockReturnValue({ status: 0 });

    expect(isGitInstalled()).toBe(true);
    expect(mockSpawn.sync).toHaveBeenCalledWith("git", ["--version"], {
      stdio: "ignore",
    });
  });

  it("returns false when git is not installed", () => {
    mockSpawn.sync.mockReturnValue({ error: { code: "ENOENT" }, status: null });

    expect(isGitInstalled()).toBe(false);
  });

  it("returns false when git exits with non-zero status", () => {
    mockSpawn.sync.mockReturnValue({ status: 1 });

    expect(isGitInstalled()).toBe(false);
  });

  it("prints a clear install message when git is missing", () => {
    printMissingGitMessage();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Git is required to download project templates."),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("https://git-scm.com/downloads"),
    );
  });
});
