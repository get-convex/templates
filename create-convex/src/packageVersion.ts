import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getPackageVersion(): string {
  try {
    const packageJsonPath = join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  } catch (error) {
    // Fallback to a default version if package.json cannot be read
    return "0.0.0";
  }
}
