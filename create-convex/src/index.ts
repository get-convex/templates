import spawn from "cross-spawn";
import degit from "degit";
import fs from "fs";
import { bold, green, gray, red, reset } from "kolorist";
import minimist from "minimist";
import path from "path";
import prompts from "prompts";
import { PackageManager, detectPackageManager } from "./packageManagers";

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  t?: string;
  template?: string;
  "dry-run"?: string;
  verbose?: boolean;
  component?: boolean;
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
    name: "convexauth",
    display: "Convex Auth",
    frameworks: ["react-vite", "nextjs"],
  },
  {
    name: "clerk",
    display: "Clerk (requires Clerk account)",
    frameworks: ["react-vite", "nextjs", "tanstack-start"],
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
  const verbose = !!argv.verbose;
  const component = !!argv.component;

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
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
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

  await writeCursorRules(root, { verbose });

  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, `package.json`), "utf-8"),
  );

  pkg.name = packageName || getProjectName();

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
  );

  const cdProjectName = path.relative(cwd, root);
  if (root !== cwd) {
    process.chdir(root);
  }
  try {
    await installDependencies();
    if (component && fs.existsSync("./example")) {
      process.chdir("./example");
      await installDependencies();
    }
    console.log(`\n${green(`✔`)} Done.`);
  } catch (error) {
    console.log(red("✖ Failed to install dependencies."));
  }
  let message = "Run the following commands to start the project:\n\n";
  if (root !== cwd) {
    message += `  cd ${
      cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
    }\n`;
  }
  // The TanStack basic template is confusing
  // if you haven't imported the data.
  if (givenTemplate === "tanstack-start") {
    message += `  ${packageManager} run seed\n`;
    message += `  ${packageManager} run dev\n`;
  } else if (component) {
    message += `  cd example\n`;
    message += `  ${packageManager} run dev\n`;
  } else {
    message += `  ${packageManager} run dev\n`;
  }

  // Add a link to the Convex docs
  message += `\nCheck out the Convex docs at: ${bold(
    "https://docs.convex.dev",
  )}\n`;
}

async function installDependencies(): Promise<void> {
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
  "bare",
  "tanstack-start",
  "tanstack-start-clerk",
  "component",
];

// E.g. `get-convex/templates/template-nextjs-convexauth#main`
// or `atrakh/one-million-checkboxes`
function getTemplateRepoPath(templateName: string) {
  // Does this look like a repo name already?
  if (templateName.includes("/")) {
    if (templateName.includes("#")) {
      return templateName;
    } else {
      return templateName + "#main";
    }
  }
  if (TEMPLATES_IN_REPO.includes(templateName)) {
    return `get-convex/templates/template-${templateName}#main`;
  }

  // This is one of our templates specifically for `npm create convex`
  return `get-convex/template-${templateName}#main`;
}

type GitHubRelease = {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
  assets: { name: string }[];
};

const CURSOR_RULES_FILE_NAME = "convex_rules.mdc";

async function writeCursorRules(root: string, options: { verbose: boolean }) {
  let content: string | null = null;
  try {
    content = await getLatestCursorRules(options);
  } catch (e) {
    console.error(red("✖ Failed to download latest Cursor rules:"));
    console.error(gray(`${e}`));
  }
  if (content !== null) {
    // Create the .cursor/rules directory if it doesn't exist
    fs.mkdirSync(path.join(root, ".cursor", "rules"), { recursive: true });
    fs.writeFileSync(
      path.join(root, ".cursor", "rules", CURSOR_RULES_FILE_NAME),
      content,
    );
    console.log(`${green("✔")} Latest Cursor rules added to project.`);
    console.log();
  }
}
async function getLatestCursorRules(options: { verbose: boolean }) {
  const repoPath = "get-convex/convex-evals";
  let version: string | undefined;
  let nextUrl = `https://api.github.com/repos/${repoPath}/releases?per_page=30`;

  while (nextUrl && version === undefined) {
    const response = await fetch(nextUrl);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub API returned ${response.status}: ${text}`);
    }

    const releases = (await response.json()) as GitHubRelease[];
    if (releases.length === 0) {
      break;
    }

    for (const release of releases) {
      // Only consider stable releases
      if (!release.prerelease && !release.draft) {
        // Check if this release has our binary
        if (
          release.assets.find((asset) => asset.name === CURSOR_RULES_FILE_NAME)
        ) {
          if (options.verbose) {
            console.log(
              `Latest stable version with appropriate binary is ${release.tag_name}`,
            );
          }
          version = release.tag_name;
        }

        if (options.verbose) {
          console.log(
            `Version ${release.tag_name} does not contain a ${CURSOR_RULES_FILE_NAME}, checking previous version`,
          );
        }
      }
    }

    // Get the next page URL from the Link header
    const linkHeader = response.headers.get("Link");
    if (!linkHeader) {
      break;
    }

    const links = parseLinkHeader(linkHeader);
    nextUrl = links["next"] || "";
  }

  // If we get here, we didn't find any suitable releases
  if (!version) {
    throw new Error(
      `Found no stable releases with a ${CURSOR_RULES_FILE_NAME}.`,
    );
  }
  const downloadUrl = `https://github.com/${repoPath}/releases/download/${version}/${CURSOR_RULES_FILE_NAME}`;
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${CURSOR_RULES_FILE_NAME} from ${downloadUrl}`,
    );
  }
  const content = await response.text();
  return content;
}

/**
 * Parse the HTTP header like
 * link: <https://api.github.com/repositories/1300192/issues?page=2>; rel="prev", <https://api.github.com/repositories/1300192/issues?page=4>; rel="next", <https://api.github.com/repositories/1300192/issues?page=515>; rel="last", <https://api.github.com/repositories/1300192/issues?page=1>; rel="first"
 * into an object.
 * https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api?apiVersion=2022-11-28#using-link-headers
 */
function parseLinkHeader(header: string): {
  prev?: string;
  next?: string;
  first?: string;
  last?: string;
} {
  const links: { [key: string]: string } = {};
  const parts = header.split(",");
  for (const part of parts) {
    const section = part.split(";");
    if (section.length !== 2) {
      continue;
    }
    const url = section[0].trim().slice(1, -1);
    const rel = section[1].trim().slice(5, -1);
    links[rel] = url;
  }
  return links;
}
