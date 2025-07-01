import fs from "fs";
import { green, gray, red } from "kolorist";
import path from "path";
import {
  downloadAssetFromRelease,
  fetchAllGitHubReleases,
  findReleaseWithAsset,
} from "./github";

const CURSOR_RULES_FILE_NAME = "convex_rules.mdc";

export async function writeCursorRules(
  root: string,
  options: { verbose: boolean }
) {
  let rules: { content: string; version: string } | null = null;
  try {
    rules = await getLatestCursorRules(options);
  } catch (e) {
    console.error(red("✖ Failed to download latest cursor rules:"));
    console.error(gray(`${e}`));
  }
  if (rules !== null) {
    // Create the .cursor/rules directory if it doesn't exist
    fs.mkdirSync(path.join(root, ".cursor", "rules"), { recursive: true });
    fs.writeFileSync(
      path.join(root, ".cursor", "rules", CURSOR_RULES_FILE_NAME),
      rules.content
    );
    console.log(
      `${green("✔")} Latest Cursor Rules (${rules.version}) was added to project.`
    );
    console.log();
  }
}

async function getLatestCursorRules(options: { verbose: boolean }) {
  const repoPath = "get-convex/convex-evals";

  // Fetch all releases from GitHub
  const releases = await fetchAllGitHubReleases(repoPath);

  // Find the first stable release with the cursor rules file
  const targetRelease = findReleaseWithAsset(releases, CURSOR_RULES_FILE_NAME, {
    verbose: options.verbose,
  });

  if (!targetRelease) {
    throw new Error(
      `Found no stable releases with a ${CURSOR_RULES_FILE_NAME}.`
    );
  }

  // Download the cursor rules file
  const content = await downloadAssetFromRelease(
    repoPath,
    targetRelease.tag_name,
    CURSOR_RULES_FILE_NAME
  );

  return { content, version: targetRelease.tag_name };
}
