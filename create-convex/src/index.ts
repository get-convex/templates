import spawn from "cross-spawn";
import degit from "degit";
import fs from "fs";
import { bold, green, red, reset } from "kolorist";
import minimist from "minimist";
import path from "path";
import prompts from "prompts";

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  t?: string;
  template?: string;
  "dry-run"?: string;
  verbose?: boolean;
}>(process.argv.slice(2), { string: ["_"] });
const cwd = process.cwd();

type Framework = {
  name: string;
  display: string;
};

const FRAMEWORKS: Framework[] = [
  {
    name: "react-vite",
    display: "React (Vite)",
  },
  {
    name: "nextjs",
    display: "Next.js App Router",
  },
  {
    name: "bare",
    display: "none",
  },
  {
    name: "other",
    display: "other",
  },
];

const AUTH: { name: string; display: string; frameworks?: string[] }[] = [
  ...(process.env.CONVEX_AUTH_TEMPLATE !== undefined
    ? [
        {
          name: "convexauth",
          display: "Convex Auth",
          frameworks: ["react-vite"],
        },
      ]
    : []),
  {
    name: "clerk",
    display: "Clerk (requires Clerk account)",
  },
  {
    name: "none",
    display: "none",
  },
];

function authOptions(framework: Framework) {
  return AUTH.filter(
    ({ frameworks }) =>
      frameworks === undefined || frameworks.includes(framework.name),
  );
}

const defaultTargetDir = "my-app";

init().catch((e) => {
  console.error(e);
});

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  const verbose = argv.verbose;

  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    "projectName" | "overwrite" | "auth" | "packageName" | "framework"
  >;

  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("Project name:"),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () =>
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
          name: "overwriteChecker",
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          type: argTemplate ? null : "select",
          name: "framework",
          hint: "Use arrow-keys, <return> to confirm",
          message: reset("Choose a client:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            return {
              title: framework.display || framework.name,
              value: framework,
            };
          }),
        },
        {
          type: (framework) => {
            if (argTemplate) {
              return null;
            }

            if (framework.name === "other") {
              throw new Error(
                red("✖") +
                  " Follow one of the quickstarts at " +
                  bold("https://docs.convex.dev/quickstarts"),
              );
            }

            return framework.name === "bare" ? null : "select";
          },
          name: "auth",
          hint: "Use arrow-keys, <return> to confirm",
          message: reset("Choose user authentication:"),
          choices: (framework) =>
            authOptions(framework).map((auth) => {
              return {
                title: auth.display || auth.name,
                value: auth.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      },
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  // user choice associated with prompts
  const { framework, overwrite, packageName, auth } = result;

  const root = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine template
  const givenTemplate: string = framework
    ? framework.name +
      (framework.name === "bare"
        ? ""
        : (auth !== "none" ? "-" + auth : "") + "-shadcn")
    : argTemplate!;

  const template = givenTemplate.includes("/")
    ? givenTemplate.includes("#")
      ? givenTemplate
      : givenTemplate + "#main"
    : givenTemplate === "react-vite-convexauth-shadcn"
    ? `get-convex/template-react-vite-convexauth-shadcn#main`
    : `get-convex/templates/template-${givenTemplate}#main`;

  console.log(`\nSetting up...`);

  const repo = `https://github.com/${template}`;

  if (argv["dry-run"]) {
    console.log(`\n${green(`✔`)} Would have fetched template from:`);
    console.log(`    ${repo}`);
    console.log("  into:");
    console.log(`    ${root}`);
    return;
  }

  try {
    const degitInstance = degit(repo, { verbose });
    if (verbose) {
      degitInstance.on("info", (info) => {
        console.error(info.message);
      });
    }
    await degitInstance.clone(root);
  } catch (error) {
    console.log(red(`✖ Failed to download template from \`${repo}\``));
    return;
  }

  const write = (file: string, content: string) => {
    const targetPath = path.join(root, file);
    fs.writeFileSync(targetPath, content);
  };

  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, `package.json`), "utf-8"),
  );

  pkg.name = packageName || getProjectName();

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  const cdProjectName = path.relative(cwd, root);
  if (root !== cwd) {
    process.chdir(root);
  }
  try {
    await installDependencies();
    console.log(`\n${green(`✔`)} Done. Now run:\n`);
  } catch (error) {
    console.log(red("✖ Failed to install dependencies."));
  }
  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`,
    );
  }
  console.log(`  npm run dev`);
  console.log();
}

async function installDependencies(): Promise<void> {
  return new Promise((resolve, reject) => {
    /**
     * Spawn the installation process.
     */
    const child = spawn("npm", ["install", "--no-fund", "--no-audit"], {
      stdio: "inherit",
      env: {
        ...process.env,
        ADBLOCK: "1",
        // we set NODE_ENV to development as pnpm skips dev
        // dependencies when production
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(code);
        return;
      }
      resolve();
    });
  });
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0;
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}
