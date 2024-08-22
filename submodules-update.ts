import { $ } from "bun";
import { join } from "path";

const submoduleNames = (await $`git submodule status`.text())
  .trim()
  .split("\n")
  .map((line) => line.trim().split(" ")[1]);

// Remember where we were, so that it's easy to recover
// any lost work.
const commitAndBranchesBeforeUpdate = new Map();
for (const submoduleName of submoduleNames) {
  const commit = (
    await $`git -C ${submoduleName} rev-parse --short HEAD`.text()
  ).trim();
  const branch = (
    await $`git -C ${submoduleName} symbolic-ref --short HEAD 2>/dev/null || echo "detached HEAD"`.text()
  ).trim();
  commitAndBranchesBeforeUpdate.set(submoduleName, { commit, branch });
}

// Initialize and update submodules
await $`git submodule update --init --remote`;

const pwd = (await $`pwd`.text()).trim();

// Setup tracking for all branches and checkout branch
for (const submoduleName of submoduleNames) {
  $.cwd(join(pwd, submoduleName));

  const didCheckout = await templateTrackBranchesAndCheckoutBranch(
    submoduleName,
  );

  const oldCommit = commitAndBranchesBeforeUpdate.get(submoduleName).commit;
  const oldBranch = commitAndBranchesBeforeUpdate.get(submoduleName).branch;
  const newBranch = submoduleName;
  const newCommit = (await $`git rev-parse --short HEAD`.text()).trim();

  if (oldCommit === newCommit && oldBranch === newBranch) {
    continue;
  }

  if (!didCheckout) {
    printHeader(submoduleName);
  }

  console.log(
    `  before: commit \x1b[31m${oldCommit}\x1b[0m branch \x1b[92m${oldBranch}\x1b[0m`,
  );
  console.log(
    `   after: commit \x1b[31m${newCommit}\x1b[0m branch \x1b[92m${newBranch}\x1b[0m`,
  );
}

async function templateTrackBranchesAndCheckoutBranch(submoduleName: string) {
  const currentCommit = (await $`git rev-parse --short HEAD`.text()).trim();
  const currentBranch = (
    await $`git symbolic-ref --short HEAD 2>/dev/null || echo "detached HEAD"`.text()
  ).trim();
  const newBranch = submoduleName;

  const remoteBranches = (await $`git branch -r | grep -v '\->'`.text())
    .trim()
    .split("\n")
    .map((line) => line.trim());

  // Fetch all remote branches and set up tracking, in case
  // a new branch was added.
  await $`git fetch --prune origin`.quiet();
  for (const remoteBranch of remoteBranches) {
    const branchName = remoteBranch.split("/").at(-1);
    await $`git fetch --update-head-ok origin ${branchName}:${branchName}`.quiet();
    await $`git branch --set-upstream-to=${remoteBranch} ${branchName}`.quiet();
  }

  if (newBranch === currentBranch) {
    const remoteCommit = (await $`git rev-parse --short @{u}`.text()).trim();
    if (currentCommit === remoteCommit) {
      return false;
    }
  }

  printHeader(submoduleName);

  await $`git checkout ${newBranch}`;
  return true;
}

function printHeader(submoduleName: string) {
  console.log();
  console.log("----------------------------------------");
  console.log(`"\x1b[33m${submoduleName}"\x1b[0m updated`);
  console.log();
}
