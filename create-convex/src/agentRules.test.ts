import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeCursorRules, writeGithubCopilotInstructions } from "./agentRules";
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
  getGithubCopilotInstructions: vi
    .fn()
    .mockResolvedValue("Sample Copilot Instructions"),
}));

vi.mock("./packageVersion", async () => ({
  getPackageVersion: vi.fn().mockReturnValue("1.2.3"),
}));

describe("Agent Rules Functions", () => {
  const mockFsModule = (fs as any).default;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(version.getLatestCursorRules).mockResolvedValue(
      "Sample Cursor Rules",
    );
    vi.mocked((version as any).getGithubCopilotInstructions).mockResolvedValue(
      "Sample Copilot Instructions",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("writeCursorRules", () => {
    const mockRoot = "/test/project";

    it("should successfully write Cursor rules to project", async () => {
      await writeCursorRules(mockRoot);

      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules",
        { recursive: true },
      );

      expect(mockFsModule.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules/convex_rules.mdc",
        "Sample Cursor Rules",
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✔") &&
          expect.stringContaining(
            "Added the latest Cursor rules to the project.",
          ),
      );
      expect(console.log).toHaveBeenCalledWith();
    });

    it("should handle fetch failure gracefully", async () => {
      const error = new Error("API error");
      vi.mocked(version.getLatestCursorRules).mockRejectedValue(error);

      await writeCursorRules(mockRoot);

      expect(mockFsModule.mkdirSync).not.toHaveBeenCalled();
      expect(mockFsModule.writeFileSync).not.toHaveBeenCalled();

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

      await expect(writeCursorRules(mockRoot)).rejects.toThrow(
        "Permission denied",
      );

      expect(mockFsModule.mkdirSync).toHaveBeenCalledWith(
        "/test/project/.cursor/rules",
        { recursive: true },
      );

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

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✔") &&
          expect.stringContaining(
            "Added the latest Cursor rules to the project.",
          ),
      );
    });
  });

  describe("writeGithubCopilotInstructions", () => {
    const mockRoot = "/test/project";

    it("should successfully write Copilot instructions to project", async () => {
      await writeGithubCopilotInstructions(mockRoot);

      expect((fs as any).default.mkdirSync).toHaveBeenCalledWith(
        "/test/project/.github/instructions",
        { recursive: true },
      );

      expect((fs as any).default.writeFileSync).toHaveBeenCalledWith(
        "/test/project/.github/instructions/convex.instructions.md",
        "Sample Copilot Instructions",
      );

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✔") &&
          expect.stringContaining(
            "Added the latest GitHub Copilot instructions to the project.",
          ),
      );
      expect(console.log).toHaveBeenCalledWith();
    });

    it("should handle network failure gracefully", async () => {
      const error = new Error("API error");
      vi.mocked((version as any).getGithubCopilotInstructions).mockRejectedValue(
        error,
      );

      await writeGithubCopilotInstructions(mockRoot);

      expect((fs as any).default.mkdirSync).not.toHaveBeenCalled();
      expect((fs as any).default.writeFileSync).not.toHaveBeenCalled();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "✖ Failed to download latest Copilot instructions:",
        ),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("API error"),
      );
    });
  });
});


