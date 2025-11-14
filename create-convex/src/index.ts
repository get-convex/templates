import spawn from "cross-spawn";
import degit from "degit";
import fs from "fs";
import { bold, green, red, reset } from "kolorist";
import minimist from "minimist";
import path from "path";
import prompts from "prompts";
import { PackageManager, detectPackageManager } from "./packageManagers";
import { writeCursorRules } from "./cursorRules";

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  t?: string | boolean;
  template?: string | boolean;
  "dry-run"?: boolean | string;
  verbose?: boolean;
  component?: boolean;
  "with-vercel-json"?: boolean;
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
    name: "tanstack-start",
    display: "TanStack Start (Beta)",
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
  {
    name: "authkit",
    display: "AuthKit (auto-creates a WorkOS account if needed)",
    frameworks: ["react-vite", "nextjs", "tanstack-start"],
  },
  {
    name: "clerk",
    display: "Clerk (requires Clerk account)",
    frameworks: ["react-vite", "nextjs", "tanstack-start"],
  },
  {
    name: "convexauth",
    display: "Convex Auth",
    frameworks: ["react-vite", "nextjs"],
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

// Detect package manager early
const packageManager = detectPackageManager();
console.log(`Using package manager: ${green(packageManager)}`);

init().catch((e) => {
  console.error(e);
});

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  if (typeof argTemplate === "boolean") {
    throw new Error(
      red("✖") + " No template provided to -`t` or `--template`",
    );
  }
  const verbose = !!argv.verbose;
  const component = !!argv.component;
  const withVercelJson = !!argv["with-vercel-json"];

  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    "projectName" | "overwrite" | "auth" | "packageName" | "framework"
  >;

  try {
    result = await prompts(
      [
        // Prompt for the project name
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
          // Prompt for overwrite if the target directory is not empty
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
          // Check if overwrite is false
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
          name: "overwriteChecker",
        },
        {
          // Prompt for the package name (if project name is not a valid package name)
          type: () =>
            component || isValidPackageName(getProjectName()) ? null : "text",
          name: "packageName",
          message: reset("Package name:"),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            !!component ||
            isValidPackageName(dir) ||
            "Invalid package.json name",
        },
        // The next two prompts are only shown if not targeting a specific template or using the component template
        {
          // Prompt for the framework
          type: argTemplate || component ? null : "select",
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
          // Prompt for the auth provider
          type: (framework) => {
            if (argTemplate || component) {
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
  // e.g. `nextjs-convexauth`
  const givenTemplate: string = getGivenTemplate({
    component,
    framework,
    auth,
    argTemplate,
  });

  const templateRepoPath = getTemplateRepoPath(givenTemplate);

  console.log(`\nSetting up...`);

  const repo = `https://github.com/${templateRepoPath}`;

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
    if (verbose) {
      console.log(red((error as any).toString()));
    }
    console.log(red(`✖ Failed to download template from \`${repo}\``));
    return;
  }

  // Remove package-lock.json if it exists
  fs.rmSync(path.join(root, "package-lock.json"), { force: true });

  await writeCursorRules(root);

  if (!component) {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, `package.json`), "utf-8"),
    );

    pkg.name = packageName || getProjectName();

    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify(pkg, null, 2) + "\n",
    );
  }

  // Remove vercel.json from template if --with-vercel-json is not set
  if (!withVercelJson) {
    const vercelJsonPath = path.join(root, "vercel.json");
    if (fs.existsSync(vercelJsonPath)) {
      fs.rmSync(vercelJsonPath, { force: true });
    }
  }

  const cdProjectName = path.relative(cwd, root);
  if (root !== cwd) {
    process.chdir(root);
  }
  try {
    await installDependencies();
    console.log(`\n${green(`✔`)} Done.`);
  } catch (error) {
    console.log(red("✖ Failed to install dependencies."));
  }

  // Run rename.mjs for component projects
  if (component) {
    try {
      console.log(`\n${green(`Configuring component...`)}\n`);
      await runRenameMjs(root);
    } catch (error) {
      console.log(red("✖ Failed to configure component."));
      if (verbose) {
        console.log(red((error as any).toString()));
      }
    }
  }

  let message = "Run the following commands to start the project:\n\n";
  if (root !== cwd) {
    message += `  cd ${
      cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
    }\n`;
  }

  message += `  ${packageManager} run dev\n`;

  // Add a link to the Convex docs
  message += `\nCheck out the Convex docs at: ${bold(
    "https://docs.convex.dev",
  )}\n`;

  console.log();
  console.log();
  console.log(message);
}

async function installDependencies(): Promise<void> {
  if (packageManager === "pnpm") {
    // Any reasonable-to-trust deps that have build scripts used in any templates
    const buildScriptDepsAllowList = ["esbuild", "@tailwindcss/oxide"];
    const packageJsonPath = "package.json";
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    pkg.pnpm = {
      ...pkg.pnpm,
      onlyBuiltDependencies: buildScriptDepsAllowList,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));

    console.log(
      "Pre-approved known dependncy build scripts (check package.json pnpm.onlyBuiltDependencies to change)",
    );
  }

  return new Promise((resolve, reject) => {
    // Different package managers use different command arguments
    const packageManagerArgs: Record<PackageManager, string[]> = {
      npm: ["install", "--no-fund", "--no-audit", "--loglevel=error"],
      yarn: ["install", "--no-fund"],
      pnpm: ["install", "--config.ignore-scripts=false"],
      bun: ["install"],
    };

    /**
     * Spawn the installation process using the detected package manager
     */
    const child = spawn(packageManager, packageManagerArgs[packageManager], {
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

async function runRenameMjs(root: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const renamePath = path.join(root, "rename.mjs");

    // Check if rename.mjs exists
    if (!fs.existsSync(renamePath)) {
      console.log("No rename.mjs found, skipping component configuration.");
      resolve();
      return;
    }

    // Run node rename.mjs
    const child = spawn("node", [renamePath], {
      cwd: root,
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`rename.mjs exited with code ${code}`));
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
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

// e.g. `nextjs-convexauth`
function getGivenTemplate(args: {
  component: boolean;
  framework: Framework;
  auth: string;
  argTemplate: string | undefined;
}) {
  const { component, framework, auth, argTemplate } = args;
  if (component) {
    return "component";
  }
  if (argTemplate) {
    return argTemplate;
  }
  if (framework === null || framework === undefined) {
    throw new Error(red("✖") + " No framework or template provided");
  }
  if (framework.name === "bare") {
    return "bare";
  }
  if (auth === "none") {
    return framework.name;
  }
  return framework.name + "-" + auth;
}

const TEMPLATES_IN_REPO = [
  // When adding a template, please also update `.github/workflows/ci.yml`.

  "astro",
  "bare",
  "component",
  "nextjs",
  "nextjs-authkit",
  "nextjs-clerk",
  "nextjs-clerk-shadcn", // not suggested anymore
  "nextjs-convexauth",
  "nextjs-shadcn", // not suggested anymore
  "react-vite",
  "react-vite-authkit",
  "react-vite-clerk",
  "react-vite-clerk-shadcn", // not suggested anymore
  "react-vite-convexauth",
  "react-vite-convexauth-shadcn", // not suggested anymore
  "react-vite-shadcn", //  not suggested anymore
  "tanstack-start",
  "tanstack-start-clerk",
  "tanstack-start-authkit",
];

// E.g. `get-convex/templates/template-nextjs-convexauth#main`
// or `atrakh/one-million-checkboxes`
function getTemplateRepoPath(templateName: string) {
  // Allow overriding the branch via environment variable for development
  const branch = process.env.CONVEX_TEMPLATE_BRANCH || "main";

  // Does this look like a repo name already?
  if (templateName.includes("/")) {
    if (templateName.includes("#")) {
      return templateName;
    } else {
      return templateName + `#${branch}`;
    }
  }

  if (TEMPLATES_IN_REPO.includes(templateName)) {
    return `get-convex/templates/template-${templateName}#${branch}`;
  }

  // This is one of our templates specifically for `npm create convex`
  // These are annoying to maintain, let's move the ones we care about to this repo.
  const external = `get-convex/template-${templateName}#${branch}`;
  console.log(
    `Can't find template ${templateName} in create-convex repo, using external repo: ${external}`,
  );
  return external;
}
