import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeCursorRules } from "./cursorRules";
import * as fs from "fs";
import * as version from "./versionApi";

// Mock fs module
vi.mock("fs", async () => {
  const mockFs = {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    default: mockFs,
    ...mockFs,
  };
});

// Mock path module
vi.mock("path", async () => {
  const mockPath = {
    join: vi.fn((...args) => args.join("/")),
  };
  return {
    default: mockPath,
    ...mockPath,
  };
});

vi.mock("./versionApi", async () => ({
  getLatestCursorRules: vi.fn().mockResolvedValue("Sample Cursor Rules"),
}));

vi.mock("./packageVersion", async () => ({
  getPackageVersion: vi.fn().mockReturnValue("1.2.3"),
}));

describe("Cursor Rules Functions", () => {
  const mockFsModule = (fs as any).default;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console spies
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Reset the version mock to default value
    vi.mocked(version.getLatestCursorRules).mockResolvedValue(
      "Sample Cursor Rules",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("writeCursorRules", () => {
    const mockRoot = "/test/project";

    it("should successfully write Cursor rules to project", async () => {
      await writeCursorRules(mockRoot);

      // Verify directory creation
      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules",
        { recursive: true },
      );

      // Verify file writing
      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        "Sample Cursor Rules",
      );
    });

    it("should handle fetchAllGitHubReleases failure gracefully", async () => {
      const error = new Error("API error");
      vi.mocked(version.getLatestCursorRules).mockRejectedValue(error);

      await writeCursorRules(mockRoot);

      // Should not create directory or write file
      expect(mockFsModule.mkdirSync).not.toHaveBeenCalled();
      expect(mockFsModule.writeFileSync).not.toHaveBeenCalled();

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("✖ Failed to download latest Cursor rules:"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("API error"),
      );
    });

    it("should work with different project root paths", async () => {
      const differentRoot = "/different/path/project";

      await writeCursorRules(differentRoot);

      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/different/path/project/.cursor/rules",
        { recursive: true },
      );

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/different/path/project/.cursor/rules/convex_rules.mdc",
        "Sample Cursor Rules",
      );
    });

    it("should throw error when file system operations fail", async () => {
      const fsError = new Error("Permission denied");
      mockFsModule.mkdirSync.mockImplementation(() => {
        throw fsError;
      });

      // The function should throw the fs error since it's not caught
      await expect(writeCursorRules(mockRoot)).rejects.toThrow(
        "Permission denied",
      );

      // Should still try to create directory
      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules",
        { recursive: true },
      );

      // Should not try to write file since mkdir failed
      expect(mockFsModule.writeFileSync).not.toHaveBeenCalled();
    });

    it("should write correct file content and path", async () => {
      const customContent = "# Custom rules content\nSome specific rules here.";
      vi.mocked(version.getLatestCursorRules).mockResolvedValue(customContent);

      await writeCursorRules(mockRoot);

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        customContent,
      );
    });

    it("should handle empty content gracefully", async () => {
      vi.mocked(version.getLatestCursorRules).mockResolvedValue("");

      await writeCursorRules(mockRoot);

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        "",
      );
    });
  });
});
