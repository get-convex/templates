const { execSync } = require("child_process");
const fs = require("fs");

const directories = fs
  .readdirSync(".", { withFileTypes: true })
  .filter((directory) => directory.isDirectory())
  .map((dirent) => dirent.name)
  .filter((name) => !name.startsWith("."));

if (process.argv.includes("lint")) {
  directories.forEach((dir) => {
    try {
      console.log();
      console.log();
      console.log(`=== Running "npm run lint" in directory: ${dir} ===`);
      execSync("npm run lint", {
        cwd: dir,
        stdio: "inherit", // This will output the command's result to the console
      });
    } catch (error) {
      console.error(
        `!!! Error running "npm run lint" in directory: ${dir} !!!`
      );
    }
  });
}
