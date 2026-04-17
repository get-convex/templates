import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isGitInstalled, printMissingGitMessage } from "./git";

const mockSpawnSync = vi.hoisted(() => vi.fn());

vi.mock("cross-spawn", async () => {
  return {
    default: {
      sync: mockSpawnSync,
    },
    sync: mockSpawnSync,
  };
});

describe("git helpers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when git --version succeeds", () => {
    mockSpawnSync.mockReturnValue({ status: 0 });

    expect(isGitInstalled()).toBe(true);
    expect(mockSpawnSync).toHaveBeenCalledWith("git", ["--version"], {
      stdio: "ignore",
    });
  });

  it("returns false when git is not installed", () => {
    mockSpawnSync.mockReturnValue({ error: { code: "ENOENT" }, status: null });

    expect(isGitInstalled()).toBe(false);
  });

  it("returns false when git exits with non-zero status", () => {
    mockSpawnSync.mockReturnValue({ status: 1 });

    expect(isGitInstalled()).toBe(false);
  });

  it("prints a clear install message when git is missing", () => {
    printMissingGitMessage();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Git is required to download project templates."),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("https://git-scm.com/install/"),
    );
  });
});
