const { execSync } = require("child_process");
const fs = require("fs");

const directories = fs
  .readdirSync(".", { withFileTypes: true })
  .filter((directory) => directory.isDirectory())
  .map((dirent) => dirent.name)
  .filter((name) => !name.startsWith("."));

let failed = false;

if (process.argv.includes("lint")) {
  // eslint();
  consistency();
}

function eslint() {
  directories.forEach((dir) => {
    try {
      console.log(`\n\n=== Running "npm run lint" in directory: ${dir} ===`);
      execSync("npm run lint", { cwd: dir, stdio: "inherit" });
    } catch (error) {
      console.error(
        `[ERROR]: Error running "npm run lint" in directory: ${dir}`
      );
      failed = true;
    }
  });
}

function consistency() {
  const reactShadcnDirectories = directories.filter((dir) =>
    dir.startsWith("template-react-vite-")
  );
  const nextShadcnDirectories = directories.filter((dir) =>
    dir.startsWith("template-nextjs-")
  );
  const shouldBeConsistent = [].concat(
    [
      ".eslintrc.cjs",
      "src/lib",
      "src/components",
      ".gitignore",
      "tailwind.config.js",
      "postcss.config.js",
    ].map((path) => reactShadcnDirectories.map((dir) => `${dir}/${path}`)),
    [
      "components",
      ".eslintrc.cjs",
      ".gitignore",
      "tailwind.config.js",
      "postcss.config.js",
    ].map((path) => nextShadcnDirectories.map((dir) => `${dir}/${path}`)),
    [
      [].concat(
        reactShadcnDirectories.map((dir) => `${dir}/src/lib`),
        nextShadcnDirectories.map((dir) => `${dir}/lib`)
      ),
    ]
  );

  shouldBeConsistent.forEach((paths) => {
    const first = paths[0];
    paths.forEach((path) => {
      try {
        execSync(`git diff --color=always --no-index ${first} ${path}`, {
          encoding: "utf8",
        });
      } catch (error) {
        console.error(`\n[ERROR]: ${first} differs from ${path}\n`);
        console.error(error.stdout);
        failed = true;
      }
    });
  });
}

process.exit(failed ? 1 : 0);
