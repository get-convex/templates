import spawn from "cross-spawn";
import { red } from "kolorist";

export function isGitInstalled(): boolean {
  const result = spawn.sync("git", ["--version"], {
    stdio: "ignore",
  });

  if (result.error) {
    const error = result.error as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      return false;
    }
  }

  return result.status === 0;
}

export function printMissingGitMessage() {
  console.log(red("✖ Git is required to download project templates."));
  console.log("Install Git and try again: https://git-scm.com/install/");
}
