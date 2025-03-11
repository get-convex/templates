// Type definition for package managers (no unknown - defaults to npm)
export const packageManagers = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];

/**
 * Detects which package manager is currently being used
 * First checks environment variables, then process.versions for Bun,
 * and falls back to checking which package managers are installed
 * @returns The detected package manager, defaulting to "npm" if none detected
 */
export function detectPackageManager(): PackageManager {
  // First check npm_config_user_agent environment variable
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent)
    for (const manager of packageManagers)
      if (userAgent.includes(manager)) return manager;

  // Check if Bun is being used via process.versions
  if (process.versions.bun) return "bun";

  // Default to npm if no package manager detected
  return "npm";
}
