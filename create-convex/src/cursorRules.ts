import fs from "fs";
import { green, gray, red } from "kolorist";
import path from "path";
import { getLatestCursorRules } from "./versionApi";

const CURSOR_RULES_FILE_NAME = "convex_rules.mdc";

export async function writeCursorRules(root: string) {
  let rules: string | null = null;
  try {
    rules = await getLatestCursorRules();
  } catch (e) {
    console.error(red("✖ Failed to download latest cursor rules:"));
    console.error(gray(`${e}`));
    return;
  }

  // Create the .cursor/rules directory if it doesn't exist
  fs.mkdirSync(path.join(root, ".cursor", "rules"), { recursive: true });
  fs.writeFileSync(
    path.join(root, ".cursor", "rules", CURSOR_RULES_FILE_NAME),
    rules,
  );
  console.log(`${green("✔")} Added the latest Cursor rules to the project.`);
  console.log();
}
