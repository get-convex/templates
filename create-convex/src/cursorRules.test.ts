import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeCursorRules } from "./cursorRules";
import * as fs from "fs";
import * as githubHelpers from "./github";

// Mock fs module
vi.mock("fs", async (importOriginal) => {
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
vi.mock("path", async (importOriginal) => {
  const mockPath = {
    join: vi.fn((...args) => args.join("/")),
  };
  return {
    default: mockPath,
    ...mockPath,
  };
});

// Mock GitHub helper functions
vi.mock("./github", () => ({
  fetchAllGitHubReleases: vi.fn(),
  findReleaseWithAsset: vi.fn(),
  downloadAssetFromRelease: vi.fn(),
}));

describe("Cursor Rules Functions", () => {
  const mockFsModule = (fs as any).default;
  const mockGithubHelpers = githubHelpers as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console spies
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("writeCursorRules", () => {
    const mockRoot = "/test/project";
    const mockRules = {
      content: "# Mock cursor rules content\nThis is a test file.",
      version: "v1.2.3",
    };

    beforeEach(() => {
      // Setup default successful mocks
      mockGithubHelpers.fetchAllGitHubReleases.mockResolvedValue([
        {
          tag_name: "v1.2.3",
          prerelease: false,
          draft: false,
          assets: [{ name: "convex_rules.mdc" }],
        },
      ]);
      mockGithubHelpers.findReleaseWithAsset.mockReturnValue({
        tag_name: "v1.2.3",
        prerelease: false,
        draft: false,
        assets: [{ name: "convex_rules.mdc" }],
      });
      mockGithubHelpers.downloadAssetFromRelease.mockResolvedValue(
        mockRules.content,
      );
    });

    it("should successfully write cursor rules to project", async () => {
      await writeCursorRules(mockRoot, { verbose: false });

      // Verify directory creation
      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules",
        { recursive: true },
      );

      // Verify file writing
      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        mockRules.content,
      );

      // Verify success message
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✔") &&
          expect.stringContaining(
            "Latest Cursor Rules (v1.2.3) was added to project.",
          ),
      );
      expect(console.log).toHaveBeenCalledWith(); // Empty line
    });

    it("should call GitHub helpers with correct parameters", async () => {
      await writeCursorRules(mockRoot, { verbose: true });

      expect(mockGithubHelpers.fetchAllGitHubReleases).toHaveBeenCalledWith(
        "get-convex/convex-evals",
      );
      expect(mockGithubHelpers.findReleaseWithAsset).toHaveBeenCalledWith(
        expect.any(Array),
        "convex_rules.mdc",
        { verbose: true },
      );
      expect(mockGithubHelpers.downloadAssetFromRelease).toHaveBeenCalledWith(
        "get-convex/convex-evals",
        "v1.2.3",
        "convex_rules.mdc",
      );
    });

    it("should handle fetchAllGitHubReleases failure gracefully", async () => {
      const error = new Error("GitHub API error");
      mockGithubHelpers.fetchAllGitHubReleases.mockRejectedValue(error);

      await writeCursorRules(mockRoot, { verbose: false });

      // Should not create directory or write file
      expect(mockFsModule.mkdirSync).not.toHaveBeenCalled();
      expect(mockFsModule.writeFileSync).not.toHaveBeenCalled();

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("✖ Failed to download latest cursor rules:"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("GitHub API error"),
      );
    });

    it("should handle findReleaseWithAsset returning null", async () => {
      mockGithubHelpers.findReleaseWithAsset.mockReturnValue(null);

      await writeCursorRules(mockRoot, { verbose: false });

      // Should not create directory or write file
      expect(mockFsModule.mkdirSync).not.toHaveBeenCalled();
      expect(mockFsModule.writeFileSync).not.toHaveBeenCalled();

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("✖ Failed to download latest cursor rules:"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Found no stable releases with a convex_rules.mdc.",
        ),
      );
    });

    it("should handle downloadAssetFromRelease failure gracefully", async () => {
      const error = new Error("Download failed");
      mockGithubHelpers.downloadAssetFromRelease.mockRejectedValue(error);

      await writeCursorRules(mockRoot, { verbose: false });

      // Should not create directory or write file
      expect(mockFsModule.mkdirSync).not.toHaveBeenCalled();
      expect(mockFsModule.writeFileSync).not.toHaveBeenCalled();

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("✖ Failed to download latest cursor rules:"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Download failed"),
      );
    });

    it("should work with different project root paths", async () => {
      const differentRoot = "/different/path/project";

      await writeCursorRules(differentRoot, { verbose: false });

      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/different/path/project/.cursor/rules",
        { recursive: true },
      );

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/different/path/project/.cursor/rules/convex_rules.mdc",
        mockRules.content,
      );
    });

    it("should handle verbose mode correctly", async () => {
      await writeCursorRules(mockRoot, { verbose: true });

      // Verify that verbose flag is passed to findReleaseWithAsset
      expect(mockGithubHelpers.findReleaseWithAsset).toHaveBeenCalledWith(
        expect.any(Array),
        "convex_rules.mdc",
        { verbose: true },
      );
    });

    it("should handle non-verbose mode correctly", async () => {
      await writeCursorRules(mockRoot, { verbose: false });

      // Verify that verbose: false is passed to findReleaseWithAsset
      expect(mockGithubHelpers.findReleaseWithAsset).toHaveBeenCalledWith(
        expect.any(Array),
        "convex_rules.mdc",
        { verbose: false },
      );
    });

    it("should throw error when file system operations fail", async () => {
      const fsError = new Error("Permission denied");
      mockFsModule.mkdirSync.mockImplementation(() => {
        throw fsError;
      });

      // The function should throw the fs error since it's not caught
      await expect(
        writeCursorRules(mockRoot, { verbose: false }),
      ).rejects.toThrow("Permission denied");

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
      mockGithubHelpers.downloadAssetFromRelease.mockResolvedValue(
        customContent,
      );

      await writeCursorRules(mockRoot, { verbose: false });

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        customContent,
      );
    });

    it("should handle empty content gracefully", async () => {
      mockGithubHelpers.downloadAssetFromRelease.mockResolvedValue("");

      await writeCursorRules(mockRoot, { verbose: false });

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        "",
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✔") &&
          expect.stringContaining(
            "Latest Cursor Rules (v1.2.3) was added to project.",
          ),
      );
    });

    it("should handle version formatting correctly", async () => {
      mockGithubHelpers.findReleaseWithAsset.mockReturnValue({
        tag_name: "v2.0.0-beta.1",
        prerelease: false,
        draft: false,
        assets: [{ name: "convex_rules.mdc" }],
      });

      await writeCursorRules(mockRoot, { verbose: false });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(
          "Latest Cursor Rules (v2.0.0-beta.1) was added to project.",
        ),
      );
    });
  });
});
