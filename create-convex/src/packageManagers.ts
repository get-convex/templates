import spawn from "cross-spawn";

// Type definition for package managers (no unknown - defaults to npm)
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/**
 * Detects which package manager is currently being used
 * First checks environment variables, then process.versions for Bun,
 * and falls back to checking which package managers are installed
 * @returns The detected package manager, defaulting to "npm" if none detected
 */
export function detectPackageManager(): PackageManager {
  // First check npm_config_user_agent environment variable
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes("yarn")) return "yarn";
    if (userAgent.includes("pnpm")) return "pnpm";
    if (userAgent.includes("bun")) return "bun";
    if (userAgent.includes("npm")) return "npm";
  }

  // Check if Bun is being used via process.versions
  if (process.versions.bun) return "bun";

  // Fallback to checking for commands in PATH
  try {
    // Try to run each package manager with --version flag to see if it's installed
    const checkCommand = (cmd: string): boolean => {
      try {
        const result = spawn.sync(cmd, ["--version"], { stdio: "ignore" });
        return result.status === 0;
      } catch (error) {
        return false;
      }
    };

    if (checkCommand("bun")) return "bun";
    if (checkCommand("pnpm")) return "pnpm";
    if (checkCommand("yarn")) return "yarn";
    if (checkCommand("npm")) return "npm";
  } catch (error) {
    // Ignore errors from command checks
  }

  // Default to npm if no package manager detected
  return "npm";
}
